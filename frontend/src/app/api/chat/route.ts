import { streamText, tool, stepCountIs, NoSuchToolError, InvalidToolInputError, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'
import { z } from 'zod'


// Zod schema for WorkflowState validation
const workflowStateSchema = z.object({
  main_task: z.string().describe('The main task or goal of the workflow'),
  relations: z.string().describe('Description of how agents interact and pass data'),
  agents: z.array(z.object({
    name: z.string().describe('The name of the agent'),
    description: z.string().describe('How the agent identifies itself to other agents'),
    task: z.string().describe('The task / goal the agent is trying to achieve'),
    expected_input: z.string().describe('What does the agent need to receive'),
    expected_output: z.string().describe('What does the agent need to output'),
    tools: z.array(z.string()).describe('Array of tools this agent can use')
  })).describe('Array of agents in the workflow')
})

// Simple tool for updating workflow state - just returns success
const updateWorkflowTool = tool({
  description: 'Update the workflow state for a project with agents, their connections, and tools',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user who owns the project'),
    projectId: z.string().describe('The ID of the project to update'),
    workflowState: workflowStateSchema
  }),
  execute: async ({ userId, projectId, workflowState }) => {
    console.log('Tool called with:', { userId, projectId, workflowState })

    // Simple success response - Firestore update will happen client-side
    return {
      success: true,
      message: `Workflow created successfully for project ${projectId}`,
      agentCount: workflowState.agents.length
    }
  }
})

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json()
    console.log('API Route - Full request body:', JSON.stringify(requestBody, null, 2))

    const { messages, projectId, userId } = requestBody

    console.log('API Route - Extracted messages:', messages)
    console.log('API Route - Extracted projectId:', projectId)
    console.log('API Route - Extracted userId:', userId)

    if (!messages || !Array.isArray(messages)) {
      console.log('API Route - Messages validation failed:', { messages, isArray: Array.isArray(messages) })
      return new Response('Messages array is required', { status: 400 })
    }

    if (!projectId) {
      console.log('API Route - ProjectId validation failed:', { projectId })
      return new Response('Project ID is required', { status: 400 })
    }

    if (!userId) {
      console.log('API Route - UserId validation failed:', { userId })
      return new Response('User ID is required', { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    // Convert UI messages to model messages for AI SDK 5
    console.log('API Route - Converting UI messages to model messages...')
    console.log('API Route - Input messages:', JSON.stringify(messages, null, 2))

    const modelMessages = convertToModelMessages(messages)
    console.log('API Route - Converted model messages:', JSON.stringify(modelMessages, null, 2))

    // Stream the chat completion with multi-step tool calling
    console.log('API Route - Starting OpenAI stream with multi-step tool calls...')

    const result = await streamText({
      model: openai('gpt-5-nano'),
      messages: modelMessages,
      maxOutputTokens: 4000,
      system: `You are Workflow Builder. Your single goal is to iteratively build a valid WorkflowConfig.

Contract:
- After any user message that provides useful info, immediately update the workflow by calling the workflow creation tool (upsert the full current config with user_id). Never wait—always persist progress.
- Do NOT print or summarize the config in chat. The UI shows it. Chat must contain only one short question per turn to refine the config.
- Keep questions ≤20 words, no explanations. Prefer yes/no or small multiple-choice. Propose smart defaults and ask "OK?" to confirm.
- Stay on-topic. No chit-chat.

Current context:
- User ID: ${userId}
- Project ID: ${projectId}

Target data model (keep this shape):
{
  "main_task": "<string: The main task to be achieved>",
  "relations": "<string: how agents interact and pass data, this is sent to the orchestrator agent>",
  "agents": [
    {
      "name": "<string: The name of the agent>",
      "description": "<string: How the agent identifies itself to other agents>",
      "task": "<string: The task / goal the agent is trying to achieve>",
      "expected_input": "<string: What does the agent need to receive>",
      "expected_output": "<string: What does the agent need to output>",
      "tools": ["<string: The name of the tool>", "..."]
    }
  ]
}

Iteration flow:
1) Main goal: Ask for the main outcome. Upsert.
2) Agents: Ask what agents/roles are needed (names/brief roles). Create entries. Upsert.
3) For each agent (one question per turn):
   - Task? Upsert.
   - Expected input? Upsert.
   - Expected output? Upsert.
   - Tools (pick known tools)? Upsert. If unsure, suggest likely tools and ask "OK?".
4) Relations: Ask how agents connect (who sends to whom, what). Upsert.
5) Gaps/ambiguity: Suggest defaults succinctly and ask to confirm. Only one short question per turn.
6) Completion: When fields look complete, ask: "Ready to deploy? (yes/no)".

Tool usage rules:
- After every answer with any actionable detail, call the workflow creation tool to upsert the entire current config (not just the delta). Include user_id.
- If the user revises something ("Change agent X tools to …"), immediately upsert with the new value.
- If a reply is ambiguous, upsert only certain parts; ask a clarifying short question for the rest.

Style:
- Only one short question per turn. No preambles, no code, no lists, no summaries. Just the question.

Best practices:
- Make sure to mention the exact params required for the workflow tool in the expected_input field.
- Mention the workflow tools in the description of the agent.
- Sketch the flow of the workflow in the relations field so the orchestrator agent knows how to connect the agents.

<workflow_tools>
# TIMEZONE
- We are in the timezone: New York
- Time now: {time}

## Twitter
tool_name = "X.PostTweet"
Post a tweet to X (Twitter).

Parameters:
- tweet_text (string, required) The text content of the tweet you want to post
- quote_tweet_id (string, optional) The ID of the tweet you want to quote. Optional.

## LinkedIn
tool_name = "LinkedIn.CreateTextPost"
Share a new text post to LinkedIn.

Parameters
- text (string, required) The text content of the post.

## Google search
tool_name = "GoogleSearch.Search"
Search Google using SerpAPI and return organic search results.

Parameters
- query (string, required) The search query.
- n_results (integer, optional, Defaults to 5) Number of results to retrieve.

## Slack
### Slack.WhoAmI
Get comprehensive user profile information.

### Slack.GetUsersInfo
Get the information of one or more users in Slack by ID, username, and/or email.

Parameters:
- user_ids (array[string], optional) The IDs of the users to get
- usernames (array[string], optional) The usernames of the users to get
- emails (array[string], optional) The emails of the users to get

### Slack.ListUsers
List all users in the authenticated user's Slack team.

### Slack.SendMessage
Send a message to a Channel, Direct Message (IM/DM), or Multi-Person (MPIM) conversation.

Parameters:
- message (string, required) The content of the message to send.
- channel_name (string, optional) The channel name to send the message to
- conversation_id (string, optional) The conversation ID to send the message to
- user_ids (array[string], optional) The Slack user IDs of the people to message
- emails (array[string], optional) The emails of the people to message
- usernames (array[string], optional) The Slack usernames of the people to message

### Slack.GetMessages
Get messages in a Slack Channel, DM (direct message) or MPIM (multi-person) conversation.

### Slack.SendDmToUser
Send a direct message to a user in Slack.

### Slack.SendMessageToChannel
Send a message to a channel in Slack.

## Google Calendar
### GoogleCalendar.ListCalendars
List all calendars accessible by the user.

### GoogleCalendar.CreateEvent
Create a new event/meeting/sync/meetup in the specified calendar.

Parameters:
- summary (string, required) The title of the event
- start_datetime (string, required) The datetime when the event starts in ISO 8601 format
- end_datetime (string, required) The datetime when the event ends in ISO 8601 format
- calendar_id (string, optional) The ID of the calendar to create the event in
- description (string, optional) The description of the event
- location (string, optional) The location of the event
- attendee_emails (array[string], optional) The list of attendee emails
- add_google_meet (boolean, optional) Whether to add a Google Meet link

### GoogleCalendar.ListEvents
List events from the specified calendar within the given datetime range.

### GoogleCalendar.UpdateEvent
Update an existing event in the specified calendar.

### GoogleCalendar.DeleteEvent
Delete an event from Google Calendar.

### GoogleCalendar.FindTimeSlotsWhenEveryoneIsFree
Provides time slots when everyone is free within a given date range.

## Google Finance
tool_name = "GoogleFinance.GetStockSummary"
Retrieve summary information for a given stock using the Google Finance API.

Parameters:
- ticker_symbol (string, required): The stock ticker, e.g., 'GOOG'.
- exchange_identifier (string, required): The market identifier, e.g., 'NASDAQ'.

## Gmail
### Gmail.SendEmail
Send an email using the Gmail API.

Parameters:
- subject (string, required) The subject of the email
- body (string, required) The body of the email
- recipient (string, required) The recipient of the email
- cc (array, optional) CC recipients of the email
- bcc (array, optional) BCC recipients of the email

### Gmail.WriteDraftEmail
Compose a new email draft using the Gmail API.

### Gmail.ListEmails
Read emails from a Gmail account and extract plain text content.

### Gmail.SearchThreads
Search for threads in the user's mailbox

### Gmail.GetThread
Get the specified thread by ID.
</workflow_tools>`,
      tools: {
        updateWorkflow: updateWorkflowTool
      },
      stopWhen: stepCountIs(5), // Allow up to 5 steps for multi-step tool calling
      onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
        console.log('API Route - Step finished:', {
          hasText: !!text,
          toolCallsCount: toolCalls.length,
          toolResultsCount: toolResults.length,
          finishReason,
          usage
        })

        // Log tool calls and results for debugging
        toolCalls.forEach((toolCall, index) => {
          console.log(`API Route - Tool call ${index}:`, {
            toolName: toolCall.toolName,
            input: toolCall.input
          })
        })

        toolResults.forEach((toolResult, index) => {
          console.log(`API Route - Tool result ${index}:`, {
            toolName: toolResult.toolName,
            hasOutput: !!toolResult.output,
            output: toolResult.output
          })
        })
      }
    })

    console.log('API Route - OpenAI stream created successfully')

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('API Route - Tool execution error:', error)

        // Handle specific AI SDK errors
        if (NoSuchToolError.isInstance(error)) {
          return 'The model tried to call an unknown tool.';
        } else if (InvalidToolInputError.isInstance(error)) {
          return 'The model called a tool with invalid inputs.';
        } else {
          return 'An error occurred while processing your request.';
        }
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
