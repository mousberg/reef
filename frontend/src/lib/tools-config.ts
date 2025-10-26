import { ToolsConfig, ToolDefinition, ToolParameter, ToolProvider } from '../types/tools';

// Twitter/X Tools
const twitterTools: ToolDefinition[] = [
  {
    tool_name: "X.PostTweet",
    description: "Post a tweet to X (Twitter).",
    parameters: [
      { name: "tweet_text", type: "string", required: true, description: "The text content of the tweet you want to post" },
      { name: "quote_tweet_id", type: "string", required: false, description: "The ID of the tweet you want to quote. Optional." }
    ],
    category: "social"
  }
];

// LinkedIn Tools
const linkedinTools: ToolDefinition[] = [
  {
    tool_name: "LinkedIn.CreateTextPost",
    description: "Share a new text post to LinkedIn.",
    parameters: [
      { name: "text", type: "string", required: true, description: "The text content of the post." }
    ],
    category: "social"
  }
];

// Google Search Tools
const googleSearchTools: ToolDefinition[] = [
  {
    tool_name: "GoogleSearch.Search",
    description: "Search Google using SerpAPI and return organic search results.",
    parameters: [
      { name: "query", type: "string", required: true, description: "The search query." },
      { name: "n_results", type: "integer", required: false, description: "Number of results to retrieve.", default: 5 }
    ],
    category: "search"
  }
];

// Slack Tools
const slackTools: ToolDefinition[] = [
  {
    tool_name: "Slack.WhoAmI",
    description: "Get comprehensive user profile information.",
    parameters: [],
    category: "communication"
  },
  {
    tool_name: "Slack.GetUsersInfo",
    description: "Get the information of one or more users in Slack by ID, username, and/or email.",
    parameters: [
      { name: "user_ids", type: "array[string]", required: false, description: "The IDs of the users to get" },
      { name: "usernames", type: "array[string]", required: false, description: "The usernames of the users to get. Prefer retrieving by user_ids and/or emails, when available, since the performance is better." },
      { name: "emails", type: "array[string]", required: false, description: "The emails of the users to get" }
    ],
    category: "communication"
  },
  {
    tool_name: "Slack.ListUsers",
    description: "List all users in the authenticated user's Slack team.",
    parameters: [
      { name: "exclude_bots", type: "boolean", required: false, description: "Whether to exclude bots from the results.", default: true },
      { name: "limit", type: "integer", required: false, description: "The maximum number of users to return.", default: 200 },
      { name: "next_cursor", type: "string", required: false, description: "The next cursor token to use for pagination." }
    ],
    category: "communication"
  },
  {
    tool_name: "Slack.SendMessage",
    description: "Send a message to a Channel, Direct Message (IM/DM), or Multi-Person (MPIM) conversation.",
    parameters: [
      { name: "message", type: "string", required: true, description: "The content of the message to send." },
      { name: "channel_name", type: "string", required: false, description: "The channel name to send the message to. Prefer providing a conversation_id, when available, since the performance is better." },
      { name: "conversation_id", type: "string", required: false, description: "The conversation ID to send the message to." },
      { name: "user_ids", type: "array[string]", required: false, description: "The Slack user IDs of the people to message." },
      { name: "emails", type: "array[string]", required: false, description: "The emails of the people to message." },
      { name: "usernames", type: "array[string]", required: false, description: "The Slack usernames of the people to message. Prefer providing user_ids and/or emails, when available, since the performance is better." }
    ],
    category: "communication"
  }
];

// Google Calendar Tools
const googleCalendarTools: ToolDefinition[] = [
  {
    tool_name: "GoogleCalendar.ListCalendars",
    description: "List all calendars accessible by the user.",
    parameters: [
      { name: "max_results", type: "integer", required: false, description: "The maximum number of calendars to return. Up to 250 calendars", default: 10 },
      { name: "show_deleted", type: "boolean", required: false, description: "Whether to show deleted calendars.", default: false },
      { name: "show_hidden", type: "boolean", required: false, description: "Whether to show hidden calendars.", default: false },
      { name: "next_page_token", type: "string", required: false, description: "The token to retrieve the next page of calendars. Optional." }
    ],
    category: "calendar"
  },
  {
    tool_name: "GoogleCalendar.CreateEvent",
    description: "Create a new event/meeting/sync/meetup in the specified calendar.",
    parameters: [
      { name: "summary", type: "string", required: true, description: "The title of the event" },
      { name: "start_datetime", type: "string", required: true, description: "The datetime when the event starts in ISO 8601 format, e.g., '2024-12-31T15:30:00'." },
      { name: "end_datetime", type: "string", required: true, description: "The datetime when the event ends in ISO 8601 format, e.g., '2024-12-31T17:30:00'." },
      { name: "calendar_id", type: "string", required: false, description: "The ID of the calendar to create the event in, usually 'primary'." },
      { name: "description", type: "string", required: false, description: "The description of the event" },
      { name: "location", type: "string", required: false, description: "The location of the event" },
      { name: "visibility", type: "Enum", required: false, description: "The visibility of the event" },
      { name: "attendee_emails", type: "array[string]", required: false, description: "The list of attendee emails. Must be valid email addresses e.g., username@domain.com." },
      { name: "send_notifications_to_attendees", type: "Enum", required: false, description: "Should attendees be notified by email of the invitation? (none, all, external_only)" },
      { name: "add_google_meet", type: "boolean", required: false, description: "Whether to add a Google Meet link to the event.", default: false }
    ],
    category: "calendar"
  }
];

// Google Finance Tools
const googleFinanceTools: ToolDefinition[] = [
  {
    tool_name: "GoogleFinance.GetStockSummary",
    description: "Retrieve summary information for a given stock using the Google Finance API via SerpAPI. This tool returns the current price and price change from the most recent trading day.",
    parameters: [
      { name: "ticker_symbol", type: "string", required: true, description: "The stock ticker, e.g., 'GOOG'." },
      { name: "exchange_identifier", type: "string", required: true, description: "The market identifier, e.g., 'NASDAQ'." }
    ],
    category: "finance"
  }
];

// Gmail Tools
const gmailTools: ToolDefinition[] = [
  {
    tool_name: "Gmail.SendEmail",
    description: "Send an email using the Gmail API.",
    parameters: [
      { name: "subject", type: "string", required: true, description: "The subject of the email." },
      { name: "body", type: "string", required: true, description: "The body of the email." },
      { name: "recipient", type: "string", required: true, description: "The recipient of the email." },
      { name: "cc", type: "array", required: false, description: "CC recipients of the email." },
      { name: "bcc", type: "array", required: false, description: "BCC recipients of the email." }
    ],
    category: "email"
  },
  {
    tool_name: "Gmail.SendDraftEmail",
    description: "Send a draft email using the Gmail API.",
    parameters: [
      { name: "email_id", type: "string", required: true, description: "The ID of the draft to send." }
    ],
    category: "email"
  },
  {
    tool_name: "Gmail.WriteDraftEmail",
    description: "Compose a new email draft using the Gmail API.",
    parameters: [
      { name: "subject", type: "string", required: true, description: "The subject of the draft email." },
      { name: "body", type: "string", required: true, description: "The body of the draft email." },
      { name: "recipient", type: "string", required: true, description: "The recipient of the draft email." },
      { name: "cc", type: "array", required: false, description: "CC recipients of the draft email." },
      { name: "bcc", type: "array", required: false, description: "BCC recipients of the draft email." }
    ],
    category: "email"
  }
];

// GitHub Tools
const githubTools: ToolDefinition[] = [
  {
    tool_name: "GitHub.GetUser",
    description: "Get information about the authenticated GitHub user.",
    parameters: [],
    category: "development"
  },
  {
    tool_name: "GitHub.ListRepositories",
    description: "List repositories accessible to the authenticated user.",
    parameters: [
      { name: "visibility", type: "string", required: false, description: "Filter by repository visibility. Options: 'all', 'public', 'private'.", default: "all" },
      { name: "sort", type: "string", required: false, description: "Sort repositories by. Options: 'created', 'updated', 'pushed', 'full_name'.", default: "full_name" },
      { name: "per_page", type: "integer", required: false, description: "Number of repositories per page.", default: 30 },
      { name: "page", type: "integer", required: false, description: "Page number for pagination.", default: 1 }
    ],
    category: "development"
  },
  {
    tool_name: "GitHub.CreatePullRequest",
    description: "Create a new pull request in a repository.",
    parameters: [
      { name: "owner", type: "string", required: true, description: "The repository owner's username." },
      { name: "repo", type: "string", required: true, description: "The repository name." },
      { name: "title", type: "string", required: true, description: "The title of the pull request." },
      { name: "body", type: "string", required: false, description: "The description of the pull request." },
      { name: "head", type: "string", required: true, description: "The name of the branch where your changes are implemented." },
      { name: "base", type: "string", required: true, description: "The name of the branch you want the changes pulled into." }
    ],
    category: "development"
  }
];

// Notion Tools
const notionTools: ToolDefinition[] = [
  {
    tool_name: "Notion.SearchPages",
    description: "Search for pages in Notion.",
    parameters: [
      { name: "query", type: "string", required: false, description: "The text to search for." },
      { name: "filter", type: "object", required: false, description: "Filter results by type. Options: { \"property\": \"object\", \"value\": \"page\" } or { \"property\": \"object\", \"value\": \"database\" }." },
      { name: "sort", type: "object", required: false, description: "Sort the results. Example: { \"direction\": \"ascending\", \"timestamp\": \"last_edited_time\" }." },
      { name: "page_size", type: "integer", required: false, description: "Number of results per page.", default: 100 },
      { name: "start_cursor", type: "string", required: false, description: "Pagination cursor." }
    ],
    category: "productivity"
  },
  {
    tool_name: "Notion.CreatePage",
    description: "Create a new page in Notion.",
    parameters: [
      { name: "parent_id", type: "string", required: true, description: "The ID of the parent page or database." },
      { name: "parent_type", type: "string", required: true, description: "Type of parent. Options: 'page_id', 'database_id'." },
      { name: "title", type: "string", required: true, description: "The title of the new page." },
      { name: "content", type: "array[object]", required: false, description: "The content blocks for the page." },
      { name: "properties", type: "object", required: false, description: "Properties for the page (required if parent is a database)." }
    ],
    category: "productivity"
  }
];

// Spotify Tools
const spotifyTools: ToolDefinition[] = [
  {
    tool_name: "Spotify.GetTrackFromId",
    description: "Get information about a track.",
    parameters: [
      { name: "track_id", type: "string", required: true, description: "The Spotify ID of the track." }
    ],
    category: "music"
  },
  {
    tool_name: "Spotify.PlayTrackByName",
    description: "Plays a song by name. Note: This tool currently requires a self-hosted instance of Arcade.",
    parameters: [
      { name: "track_name", type: "string", required: true, description: "The name of the track to play." },
      { name: "artist_name", type: "string", required: false, description: "The name of the artist of the track." }
    ],
    category: "music"
  },
  {
    tool_name: "Spotify.Search",
    description: "Search Spotify catalog information. Note: This tool currently requires a self-hosted instance of Arcade.",
    parameters: [
      { name: "q", type: "string", required: true, description: "The search query." },
      { name: "types", type: "array", required: true, description: "The types of results to return, Valid values are 'album', 'artist', 'playlist', 'track', 'show', 'episode', 'audiobook'." },
      { name: "limit", type: "integer", required: false, description: "The maximum number of results to return.", default: 1 }
    ],
    category: "music"
  }
];

// Combine all tools
const allTools: ToolDefinition[] = [
  ...twitterTools,
  ...linkedinTools,
  ...googleSearchTools,
  ...slackTools,
  ...googleCalendarTools,
  ...googleFinanceTools,
  ...gmailTools,
  ...githubTools,
  ...notionTools,
  ...spotifyTools
];

export const toolsConfig: ToolsConfig = {
  providers: [],
  tools: allTools
};

export type { ToolParameter, ToolDefinition, ToolProvider, ToolsConfig };
export default toolsConfig;
