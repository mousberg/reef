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

Parameters:
This tool takes no parameters.

### Slack.GetUsersInfo

Get the information of one or more users in Slack by ID, username, and/or email.

Parameters:

- user_ids (array[string], optional) The IDs of the users to get
- usernames (array[string], optional) The usernames of the users to get. Prefer retrieving by user_ids and/or emails, when available, since the performance is better.
- emails (array[string], optional) The emails of the users to get

### Slack.ListUsers

List all users in the authenticated user's Slack team.

Parameters:

- exclude_bots (boolean, optional) Whether to exclude bots from the results. Defaults to True.
- limit (integer, optional) The maximum number of users to return. Defaults to 200. Maximum is 500.
- next_cursor (string, optional) The next cursor token to use for pagination.

### Slack.SendMessage

Send a message to a Channel, Direct Message (IM/DM), or Multi-Person (MPIM) conversation.

Parameters:

- message (string, required) The content of the message to send.
- channel_name (string, optional) The channel name to send the message to. Prefer providing a conversation_id, when available, since the performance is better.
- conversation_id (string, optional) The conversation ID to send the message to.
- user_ids (array[string], optional) The Slack user IDs of the people to message.
- emails (array[string], optional) The emails of the people to message.
- usernames (array[string], optional) The Slack usernames of the people to message. Prefer providing user_ids and/or emails, when available, since the performance is better.

### Slack.GetUsersInConversation

Get the users in a Slack conversation (Channel, DM/IM, or MPIM) by its ID or by channel name.

Parameters:

- conversation_id (string, optional) The ID of the conversation to get users in.
- channel_name (string, optional) The name of the channel to get users in. Prefer providing a conversation_id, when available, since the performance is better.
- limit (integer, optional) The maximum number of users to return. Defaults to 200. Maximum is 500.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.GetMessages

Get messages in a Slack Channel, DM (direct message) or MPIM (multi-person) conversation.

Parameters:

- conversation_id (string, optional) The ID of the conversation to get messages from. Provide exactly one of conversation_id OR any combination of user_ids, usernames, and/or emails.
- channel_name (string, optional) The name of the channel to get messages from. Prefer providing a conversation_id, when available, since the performance is better.
- user_ids (array[string], optional) The IDs of the users in the conversation to get messages from.
- usernames (array[string], optional) The usernames of the users in the conversation to get messages from. Prefer providing user_ids and/or emails, when available, since the performance is better.
- emails (array[string], optional) The emails of the users in the conversation to get messages from.
- limit (integer, optional) The maximum number of messages to return. Defaults to 100. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.
- oldest (string, optional) The oldest timestamp of messages to include. Defaults to 0.
- latest (string, optional) The latest timestamp of messages to include. Defaults to now.

### Slack.GetConversationMetadata

Get metadata of a Channel, a Direct Message (IM / DM) or a Multi-Person (MPIM) conversation.

Parameters:

- conversation_id (string, optional) The ID of the conversation to get metadata for.
- channel_name (string, optional) The name of the channel to get metadata for. Prefer providing a conversation_id, when available, since the performance is better.
- user_ids (array[string], optional) The IDs of the users in the conversation to get metadata for.
- usernames (array[string], optional) The usernames of the users in the conversation to get metadata for. Prefer providing user_ids and/or emails, when available, since the performance is better.
- emails (array[string], optional) The emails of the users in the conversation to get metadata for.

### Slack.ListConversations

List metadata for Slack conversations (channels, DMs, MPIMs) the user is a member of.

Parameters:

- exclude_archived (boolean, optional) Whether to exclude archived conversations from the results. Defaults to True.
- types (array[string], optional) The types of conversations to include. Defaults to all types. Options: public_channel, private_channel, mpim, im.
- limit (integer, optional) The maximum number of conversations to return. Defaults to 200. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.GetUserInfoById

Get the information of a user in Slack.

Parameters:

- user_id (string, required) The ID of the user to get information for.

### Slack.SendDmToUser

Send a direct message to a user in Slack.

Parameters:

- message (string, required) The content of the message to send.
- user_id (string, optional) The ID of the user to send the message to. Provide exactly one of user_id, username, or email.
- username (string, optional) The username of the user to send the message to. Prefer providing user_id or email, when available, since the performance is better.
- email (string, optional) The email of the user to send the message to.

### Slack.SendMessageToChannel

Send a message to a channel in Slack.

Parameters:

- message (string, required) The content of the message to send.
- channel_name (string, optional) The name of the channel to send the message to. Prefer providing conversation_id, when available, since the performance is better.
- conversation_id (string, optional) The ID of the conversation to send the message to.

### Slack.GetMembersInConversationById

Get the members of a conversation in Slack by the conversation's ID.

Parameters:

- conversation_id (string, required) The ID of the conversation to get members for.
- limit (integer, optional) The maximum number of members to return. Defaults to 200. Maximum is 500.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.GetMembersInChannelByName

Get the members of a conversation in Slack by the conversation's name.

Parameters:

- channel_name (string, required) The name of the channel to get members for.
- limit (integer, optional) The maximum number of members to return. Defaults to 200. Maximum is 500.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.GetMessagesInChannelByName

Get the messages in a channel by the channel's name.

Parameters:

- channel_name (string, required) The name of the channel to get messages from.
- limit (integer, optional) The maximum number of messages to return. Defaults to 100. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.
- oldest (string, optional) The oldest timestamp of messages to include. Defaults to 0.
- latest (string, optional) The latest timestamp of messages to include. Defaults to now.

### Slack.GetMessagesInConversationById

Get the messages in a conversation by the conversation's ID.

Parameters:

- conversation_id (string, required) The ID of the conversation to get messages from.
- limit (integer, optional) The maximum number of messages to return. Defaults to 100. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.
- oldest (string, optional) The oldest timestamp of messages to include. Defaults to 0.
- latest (string, optional) The latest timestamp of messages to include. Defaults to now.

### Slack.GetMessagesInDirectMessageConversationByUsername

Get the messages in a direct conversation by the user's name.

Parameters:

- username (string, required) The username of the user to get direct messages with.
- limit (integer, optional) The maximum number of messages to return. Defaults to 100. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.
- oldest (string, optional) The oldest timestamp of messages to include. Defaults to 0.
- latest (string, optional) The latest timestamp of messages to include. Defaults to now.

### Slack.GetMessagesInMultiPersonDmConversationByUsernames

Get the messages in a multi-person direct message conversation by the usernames.

Parameters:

- usernames (array[string], required) The usernames of the users in the multi-person direct message conversation.
- limit (integer, optional) The maximum number of messages to return. Defaults to 100. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.
- oldest (string, optional) The oldest timestamp of messages to include. Defaults to 0.
- latest (string, optional) The latest timestamp of messages to include. Defaults to now.

### Slack.ListConversationsMetadata

List Slack conversations (channels, DMs, MPIMs) the user is a member of.

Parameters:

- exclude_archived (boolean, optional) Whether to exclude archived conversations from the results. Defaults to True.
- types (array[string], optional) The types of conversations to include. Defaults to all types. Options: public_channel, private_channel, mpim, im.
- limit (integer, optional) The maximum number of conversations to return. Defaults to 200. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.ListPublicChannelsMetadata

List metadata for public channels in Slack that the user is a member of.

Parameters:

- exclude_archived (boolean, optional) Whether to exclude archived channels from the results. Defaults to True.
- limit (integer, optional) The maximum number of channels to return. Defaults to 200. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.ListPrivateChannelsMetadata

List metadata for private channels in Slack that the user is a member of.

Parameters:

- exclude_archived (boolean, optional) Whether to exclude archived channels from the results. Defaults to True.
- limit (integer, optional) The maximum number of channels to return. Defaults to 200. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.ListGroupDirectMessageConversationsMetadata

List metadata for group direct message conversations that the user is a member of.

Parameters:

- limit (integer, optional) The maximum number of conversations to return. Defaults to 200. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.ListDirectMessageConversationsMetadata

List metadata for direct message conversations in Slack that the user is a member of.

Parameters:

- limit (integer, optional) The maximum number of conversations to return. Defaults to 200. Maximum is 1000.
- next_cursor (string, optional) The cursor to use for pagination.

### Slack.GetConversationMetadataById

Get the metadata of a conversation in Slack searching by its ID.

Parameters:

- conversation_id (string, required) The ID of the conversation to get metadata for.

### Slack.GetChannelMetadataByName

Get the metadata of a channel in Slack searching by its name.

Parameters:

- channel_name (string, required) The name of the channel to get metadata for.

### Slack.GetDirectMessageConversationMetadataByUsername

Get the metadata of a direct message conversation in Slack by the username.

Parameters:

- username (string, required) The username of the user to get direct message conversation metadata with.

### Slack.GetMultiPersonDmConversationMetadataByUsernames

Get the metadata of a multi-person direct message conversation in Slack by the usernames.

Parameters:

- usernames (array[string], required) The usernames of the users in the multi-person direct message conversation.

## Google Calendar

### GoogleCalendar.ListCalendars

List all calendars accessible by the user.

Parameters:

- max_results (integer, optional) The maximum number of calendars to return. Up to 250 calendars, defaults to 10.
- show_deleted (boolean, optional) Whether to show deleted calendars. Defaults to False
- show_hidden (boolean, optional) Whether to show hidden calendars. Defaults to False
- next_page_token (string, optional) The token to retrieve the next page of calendars. Optional.

### GoogleCalendar.CreateEvent

Create a new event/meeting/sync/meetup in the specified calendar.

Parameters:

- summary (string, required) The title of the event
- start_datetime (string, required) The datetime when the event starts in ISO 8601 format, e.g., ‘2024-12-31T15:30:00’.
- end_datetime (string, required) The datetime when the event ends in ISO 8601 format, e.g., ‘2024-12-31T17:30:00’.
- calendar_id (string, optional) The ID of the calendar to create the event in, usually ‘primary’.
- description (string, optional) The description of the event
- location (string, optional) The location of the event
- visibility (Enum, optional) The visibility of the event
- attendee_emails (array[string], optional) The list of attendee emails. Must be valid email addresses e.g., username@domain.com.
- send_notifications_to_attendees (Enum, optional) Should attendees be notified by email of the invitation? (none, all, external_only)
- add_google_meet (boolean, optional) Whether to add a Google Meet link to the event. Defaults to False.

### GoogleCalendar.ListEvents

List events from the specified calendar within the given datetime range.

Parameters:

- min_end_datetime (string, required) Filter by events that end on or after this datetime in ISO 8601 format, e.g., ‘2024-09-15T09:00:00’.
- max_start_datetime (string, required) Filter by events that start before this datetime in ISO 8601 format, e.g., ‘2024-09-16T17:00:00’.
- calendar_id (string, optional) The ID of the calendar to list events from
- max_results (integer, optional) The maximum number of events to return

### GoogleCalendar.UpdateEvent

Update an existing event in the specified calendar with the provided details. Only the provided fields will be updated; others will remain unchanged.

Parameters:

- event_id (string, required) The ID of the event to update
- updated_start_datetime (string, optional) The updated datetime that the event starts in ISO 8601 format, e.g., ‘2024-12-31T15:30:00’.
- updated_end_datetime (string, optional) The updated datetime that the event ends in ISO 8601 format, e.g., ‘2024-12-31T17:30:00’.
- updated_calendar_id (string, optional) The updated ID of the calendar containing the event.
- updated_summary (string, optional) The updated title of the event
- updated_description (string, optional) The updated description of the event
- updated_location (string, optional) The updated location of the event
- updated_visibility (Enum, optional) The visibility of the event
- attendee_emails_to_add (array[string], optional) The list of attendee emails to add. Must be valid email addresses e.g., username@domain.com.
- attendee_emails_to_remove (array[string], optional) The list of attendee emails to remove. Must be valid email addresses e.g., username@domain.com.
- send_notifications_to_attendees (Enum, optional) Should attendees be notified of the update? (none, all, external_only)
- update_google_meet (Enum, optional) Whether to update the Google Meet link to the event. (none, add, remove)

### GoogleCalendar.DeleteEvent

Delete an event from Google Calendar.

Parameters:

- event_id (string, required) The ID of the event to delete
- calendar_id (string, optional) The ID of the calendar containing the event
- send_updates (Enum, optional) Specifies which attendees to notify about the deletion

### GoogleCalendar.FindTimeSlotsWhenEveryoneIsFree

Provides time slots when everyone is free within a given date range and time boundaries.

Parameters:

- email_addresses (array[string], optional) The list of email addresses from people in the same organization domain (apart from the currently logged in user) to search for free time slots. Defaults to None, which will return free time slots for the current user only.
- start_date (string, optional) The start date to search for time slots in the format ‘YYYY-MM-DD’. Defaults to today’s date. It will search starting from this date at the time 00:00:00.
- end_date (string, optional) The end date to search for time slots in the format ‘YYYY-MM-DD’. Defaults to seven days from the start date. It will search until this date at the time 23:59:59.
- start_time_boundary (string, optional) Will return free slots in any given day starting from this time in the format ‘HH:MM’. Defaults to ‘08:00’, which is a usual business hour start time.
- end_time_boundary (string, optional) Will return free slots in any given day until this time in the format ‘HH:MM’. Defaults to ‘17:00’, which is a usual business hour end time.
- duration_minutes (integer, optional) The duration of the time slots to find in minutes. Defaults to 60 minutes.

### GoogleCalendar.WhoAmI

Get comprehensive user profile and Google Calendar environment information.

Parameters:

- This tool does not take any parameters.

## Google finance

tool_name = "GoogleFinance.GetStockSummary"
Retrieve summary information for a given stock using the Google Finance API via SerpAPI. This tool returns the current price and price change from the most recent trading day.

Parameters:

- ticker_symbol (string, required): The stock ticker, e.g., ‘GOOG’.
- exchange_identifier (string, required): The market identifier, e.g., ‘NASDAQ’.

## Gmail

### Gmail.SendEmail

Send an email using the Gmail API.

Parameters:

- subject (string, required) The subject of the email.
- body (string, required) The body of the email.
- recipient (string, required) The recipient of the email.
- cc (array, optional) CC recipients of the email.
- bcc (array, optional) BCC recipients of the email.

### Gmail.SendDraftEmail

Send a draft email using the Gmail API.

Parameters:

- email_id (string, required) The ID of the draft to send.

### Gmail.WriteDraftEmail

Compose a new email draft using the Gmail API.

Parameters:

- subject (string, required) The subject of the draft email.
- body (string, required) The body of the draft email.
- recipient (string, required) The recipient of the draft email.
- cc (array, optional) CC recipients of the draft email.
- bcc (array, optional) BCC recipients of the draft email.

### Gmail.UpdateDraftEmail

Update an existing email draft.

Parameters:

- draft_email_id (string, required) The ID of the draft email to update.
- subject (string, required) The subject of the draft email.
- body (string, required) The body of the draft email.
- recipient (string, required) The recipient of the draft email.
- cc (array, optional) CC recipients of the draft email.
- bcc (array, optional) BCC recipients of the draft email.

### Gmail.DeleteDraftEmail

Delete a draft email using the Gmail API.

Parameters:

- draft_email_id (string, required) The ID of the draft email to delete.

### Gmail.TrashEmail

Move an email to the trash folder.

Parameters:

- email_id (string, required) The ID of the email to trash.

### Gmail.ListDraftEmails

List draft emails in the user's mailbox.

Parameters:

- n_drafts (integer, optional) Number of draft emails to read.

### Gmail.ListEmailsByHeader

Search for emails by header using the Gmail API.

Parameters:

- sender (string, optional) The name or email address of the sender.
- recipient (string, optional) The name or email address of the recipient.
- subject (string, optional) Words to find in the subject of the email.
- body (string, optional) Words to find in the body of the email.
- date_range (string, optional) The date range of the emails.
- limit (integer, optional) The maximum number of emails to return.

### Gmail.ListEmails

Read emails from a Gmail account and extract plain text content.

Parameters:

- n_emails (integer, optional) Number of emails to read.

### Gmail.SearchThreads

Search for threads in the user's mailbox

Parameters:

- page_token (string, optional) Page token to retrieve a specific page of results in the list.
- max_results (integer, optional) The maximum number of threads to return.
- include_spam_trash (boolean, optional) Whether to include spam and trash in the results.
- label_ids (array, optional) The IDs of labels to filter by.
- sender (string, optional) The name or email address of the sender of the email.
- recipient (string, optional) The name or email address of the recipient.
- subject (string, optional) Words to find in the subject of the email.
- body (string, optional) Words to find in the body of the email.
- date_range (string, optional) The date range of the email. Valid values are 'today', 'yesterday', 'last_7_days', 'last_30_days', 'this_month', 'last_month', 'this_year'.

### Gmail.ListThreads

List threads in the user's mailbox.

Parameters:

- page_token (string, optional) Page token to retrieve a specific page of results in the list.
- max_results (integer, optional) The maximum number of threads to return.
- include_spam_trash (boolean, optional) Whether to include spam and trash in the results.

### Gmail.GetThread

Get the specified thread by ID.

Parameters:

- thread_id (string, required) The ID of the thread to retrieve.

### Gmail.WhoAmI

Get comprehensive user profile and Gmail account information.

Parameters:
This tool does not take any parameters.
