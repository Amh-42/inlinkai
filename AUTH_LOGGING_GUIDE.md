# 🔐 Auth Logging System

## Overview

A comprehensive logging system has been implemented to track authentication-related events and help debug issues like the 500 error you're experiencing with social sign-in.

## Log Files

- **Location**: `logs/auth.log`
- **Rotation**: Automatically rotates when file exceeds 10MB
- **Retention**: Keeps last 5 log files
- **Format**: Structured logs with timestamps, levels, categories, and detailed metadata

## Log Categories

- **AUTH**: General authentication events
- **SOCIAL**: Social sign-in specific events  
- **DATABASE**: Database connection and query events
- **SESSION**: Session management events
- **CONFIG**: Configuration validation and setup

## Log Levels

- **INFO**: Normal operations and successful events
- **WARN**: Warning conditions that don't break functionality
- **ERROR**: Error conditions that cause failures
- **DEBUG**: Detailed debugging information

## Accessing Logs

### 1. File System (Production)
```bash
# View recent logs
tail -f logs/auth.log

# View last 100 lines
tail -100 logs/auth.log

# Search for specific errors
grep "ERROR" logs/auth.log
grep "sign-in/social" logs/auth.log
```

### 2. Debug API Endpoint
```bash
# View logs (admin only)
GET /api/debug-auth-logs?lines=200&format=text

# View logs as JSON
GET /api/debug-auth-logs?lines=100&format=json

# Clear logs
GET /api/debug-auth-logs?clear=true

# Add test log entry
POST /api/debug-auth-logs
{
  "action": "test",
  "message": "Test message",
  "data": { "key": "value" }
}
```

### 3. Browser Console (Development)
- Client-side auth events are logged to browser console
- Also stored in localStorage as 'auth-client-logs'

## What Gets Logged

### Social Sign-In Flow
1. **Client-side attempt**: When user clicks LinkedIn sign-in
2. **Request routing**: Auth route handler receives request
3. **Better Auth processing**: Internal Better Auth operations
4. **Database operations**: User lookup/creation
5. **Response handling**: Success/failure responses
6. **Client-side completion**: Final client-side processing

### Environment Configuration
- LinkedIn client ID/secret validation
- Database connection status
- Trusted origins configuration
- Better Auth initialization

### Request Details
- User agent, IP address, timestamps
- Request/response status codes
- Error messages and stack traces
- Session information

## Debugging Your 500 Error

The logs will help identify:

1. **Configuration Issues**
   - Missing environment variables
   - Invalid LinkedIn credentials
   - Database connection problems

2. **Request Flow Problems**
   - Where exactly the request fails
   - What error message is generated
   - Network/routing issues

3. **Better Auth Issues**
   - Internal Better Auth errors
   - Callback/redirect problems
   - Session handling issues

## Log Examples

### Successful Social Sign-In
```
[2024-01-01T12:00:00.000Z] [INFO] [SOCIAL] Social sign-in attempt started | provider=linkedin | endpoint=/api/auth/sign-in/social
[2024-01-01T12:00:01.000Z] [INFO] [AUTH] Better Auth signIn callback executed | userId=123 | provider=linkedin
[2024-01-01T12:00:01.100Z] [INFO] [SOCIAL] Social sign-in request successful | provider=linkedin | status=200
```

### Failed Social Sign-In
```
[2024-01-01T12:00:00.000Z] [INFO] [SOCIAL] Social sign-in attempt started | provider=linkedin
[2024-01-01T12:00:01.000Z] [ERROR] [SOCIAL] Social sign-in failed | provider=linkedin
  ERROR: Invalid client credentials
  STACK: Error: Invalid client credentials at ...
[2024-01-01T12:00:01.100Z] [ERROR] [AUTH] POST request failed | status=500
```

## Next Steps

1. **Deploy the updated code** with logging enabled
2. **Attempt social sign-in** to trigger the 500 error
3. **Check the logs** using one of the methods above
4. **Identify the root cause** from the detailed error information
5. **Fix the specific issue** based on the log findings

The logs will show exactly where and why the social sign-in is failing, making it much easier to resolve the 500 error.
