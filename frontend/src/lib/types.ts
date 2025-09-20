export interface UserData {
  firstName: string
  lastName: string
  email: string
  lastLoggedIn: any
  lastLoggedInIp: string
  termsAccepted: boolean
  marketingAccepted: boolean
  createdAt: any
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: any
  editedAt?: any
  parts?: Array<{
    type: string
    text?: string
    input?: any
    output?: any
    state?: string
    toolCallId?: string
    errorText?: string
  }>
}

export interface Agent {
  name: string
  task: string
  instructions: string
  connected_agents: string[]
  expected_input: string
  expected_output: string
  receives_from_user: boolean
  sends_to_user: boolean
  tools: string[]
}

export interface WorkflowState {
  main_task: string
  relations: string
  agents: Record<string, Agent>
}

export interface Project {
  id: string
  name: string
  createdAt: any
  updatedAt: any
  messages?: Message[]
  workflowState?: WorkflowState
}
