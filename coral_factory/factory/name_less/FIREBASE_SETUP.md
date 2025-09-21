# Firebase Setup for Agent Tracing

This document explains how to set up Firebase Firestore for agent tracing instead of MongoDB. The system now supports dynamic user ID passing through the factory API endpoints.

## Database Structure

The agent tracing data is stored in Firebase Firestore with the following structure:

```
users/
  {user_id}/
    agent_traces/
      {trace_id}/
        - trace_id: string
        - name: string
        - start_time: timestamp
        - end_time: timestamp
        - status: string (running, completed, error)
        - inputs: object
        - outputs: object
        - metadata: object
        - tags: array
        - user_id: string
        - created_at: timestamp
        - updated_at: timestamp
    
    agent_spans/
      {span_id}/
        - span_id: string
        - trace_id: string
        - parent_id: string
        - name: string
        - type: string
        - start_time: timestamp
        - end_time: timestamp
        - status: string (running, completed, error)
        - inputs: object
        - outputs: object
        - error: string (optional)
        - metadata: object
        - tags: array
        - user_id: string
        - created_at: timestamp
        - updated_at: timestamp
```

## Setup Instructions

### 1. Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `firebase-service-account.json` in this directory

### 2. Configure Environment Variables

Set the following environment variables:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Existing variables
MODEL=gpt-4
OPENAI_API_KEY=your-openai-api-key
CORAL_SSE_URL=your-coral-sse-url
CORAL_AGENT_ID=your-coral-agent-id
```

**Note:** The `USER_ID` is now passed dynamically through the API endpoints and doesn't need to be set as a static environment variable.

### 3. Install Dependencies

The `firebase-admin` package has been added to `requirements.txt`. Install it with:

```bash
pip install -r requirements.txt
```

### 4. Firebase Security Rules (Optional)

If you want to restrict access to the tracing data, you can set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own agent traces and spans
    match /users/{userId}/agent_traces/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/agent_spans/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## API Endpoints

The factory now supports dynamic user ID passing through the following endpoints:

### Create Workflow
```bash
POST /create/workflow
Content-Type: application/json

{
  "workflow_config": {
    "main_task": "string",
    "relations": "string", 
    "agents": [...]
  },
  "user_id": "firebase_auth_uid"
}
```

### Deploy Workflow
```bash
POST /deploy/workflow
Content-Type: application/json

{
  "workflow_name": "string",
  "deploy_type": "local",
  "user_id": "firebase_auth_uid",
  "query": "string"
}
```

## Frontend Integration

Your frontend should call the factory API with the Firebase Auth UID:

```typescript
// Create workflow
await fetch('/api/coral-factory/create/workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_config: workflowData,
    user_id: user.uid  // Firebase Auth UID
  })
})

// Deploy workflow  
await fetch('/api/coral-factory/deploy/workflow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_name: "My Workflow",
    user_id: user.uid,  // Firebase Auth UID
    query: "Hello world"
  })
})
```

## Usage

The tracing processor will automatically:

1. Store traces under `users/{user_id}/agent_traces/` (where user_id comes from API)
2. Store spans under `users/{user_id}/agent_spans/`
3. Link spans to their parent traces via `trace_id`
4. Track timing, inputs, outputs, and metadata for all operations

## User ID Flow

The user ID flows through the system as follows:

1. **Frontend** → Passes Firebase Auth UID via API request
2. **Factory API** → Receives user_id in request body
3. **Workflow Creation** → Sets user_id in agent context 
4. **Docker Deployment** → Passes user_id as environment variable
5. **Agent Execution** → Uses user_id to scope Firestore collections
6. **Tracing Storage** → Stores data under `users/{user_id}/`

## Migration from MongoDB

If you were previously using MongoDB, your data structure and user ID handling will change:

### Data Structure Changes:
- **MongoDB**: Collections `trace_traces` and `trace_spans`
- **Firestore**: User-scoped subcollections `agent_traces` and `agent_spans`

### User ID Changes:
- **Before**: Static `USER_ID` environment variable 
- **After**: Dynamic user ID passed through API endpoints

### Benefits:
- Better data isolation per user
- Aligns with frontend Firebase structure (`users/{uid}/projects/`)
- Dynamic user switching without environment variable changes
- Consistent authentication flow with frontend Firebase Auth
