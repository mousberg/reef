# Reef Cloud Functions

This directory contains Firebase Cloud Functions for automated workflow scheduling.

## Functions

### `processScheduledTasks`

HTTP-triggered function that processes all due scheduled tasks.

- **Trigger**: Cloud Scheduler (every 5 minutes)
- **What it does**:
  1. Queries Firestore for enabled scheduled tasks
  2. Checks if tasks are due to run based on `nextRun` timestamp
  3. Executes workflows by calling Coral Factory API
  4. Updates task records with execution results
  5. Calculates next run time for recurring tasks

### `triggerScheduledTasks`

Callable function for manually triggering the scheduler (useful for testing).

- **Trigger**: Manual call from frontend
- **What it does**: Triggers the `processScheduledTasks` function

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Watch Mode (during development)

```bash
npm run build:watch
```

### Local Testing

```bash
npm run serve
```

This starts the Firebase emulator for testing functions locally.

### Deploy

```bash
npm run deploy
```

Or from the parent directory:

```bash
firebase deploy --only functions
```

## Environment Variables

Set these using `firebase functions:config:set`:

```bash
# Coral Factory API URL
firebase functions:config:set factory.url="https://coral-factory-540229907345.europe-west1.run.app"

# Coral Factory authentication token
firebase functions:config:set factory.token="YOUR_TOKEN_HERE"

# (Optional) Custom function URL for manual triggers
firebase functions:config:set functions.url="https://us-central1-reefs-c1adb.cloudfunctions.net/processScheduledTasks"
```

View current config:
```bash
firebase functions:config:get
```

## Logs

View function logs:

```bash
npm run logs
```

Or use Firebase CLI:

```bash
firebase functions:log --only processScheduledTasks
```

Or use gcloud:

```bash
gcloud functions logs read processScheduledTasks --region=us-central1
```

## Structure

```
functions/
├── src/
│   └── index.ts          # Main functions code
├── lib/                  # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .gitignore           # Git ignore rules
```

## Dependencies

- `firebase-admin`: Firebase Admin SDK for Firestore access
- `firebase-functions`: Firebase Functions SDK
- TypeScript for type safety

## Cron Expression Parser

The `getNextRunTime` function includes a simple cron parser for common patterns:

- `*/N * * * *` - Every N minutes
- `0 */N * * *` - Every N hours
- `M H * * *` - Daily at hour H, minute M

For more complex patterns, the function returns a fallback interval.

## Error Handling

- Failed workflow executions are logged and marked with `lastStatus: "failed"`
- Errors don't stop other tasks from processing
- One-time tasks are automatically disabled after execution
- Recurring tasks continue even if a single execution fails

## Testing

1. **Manual Trigger**:
   ```bash
   gcloud scheduler jobs run process-scheduled-tasks --location=us-central1
   ```

2. **Check Logs**:
   ```bash
   npm run logs
   ```

3. **Verify Firestore**:
   - Check `scheduledTasks` collection for `lastRun` updates
   - Check `taskExecutions` collection for execution history

## Debugging

Common issues:

1. **"FACTORY_TOKEN environment variable not set"**
   - Run: `firebase functions:config:set factory.token="YOUR_TOKEN"`
   - Redeploy: `firebase deploy --only functions`

2. **"Factory API error: 401"**
   - Invalid or expired Factory token
   - Update the token in function config

3. **Tasks not executing**
   - Check if task is enabled in Firestore
   - Verify `nextRun` timestamp is in the past
   - Check Cloud Function logs for errors

## Performance

- **Timeout**: 540 seconds (9 minutes)
- **Memory**: 512MB
- **Concurrency**: Processes multiple tasks in parallel using Promise.all()

## Cost Optimization

- Cloud Functions free tier: 2M invocations/month
- Scheduler triggers every 5 minutes = ~8,640 invocations/month
- Well within free tier for most use cases

## Future Enhancements

Potential improvements:

- [ ] Add retry logic for failed executions
- [ ] Implement more sophisticated cron parsing (use a library)
- [ ] Add email notifications for failures
- [ ] Support for task dependencies
- [ ] Batch processing optimization
- [ ] Add metrics and monitoring
