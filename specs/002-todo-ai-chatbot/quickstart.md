# Quickstart: Todo AI Chatbot

**Feature**: 002-todo-ai-chatbot
**Date**: 2026-02-09

## Prerequisites

- Phase II backend and frontend running (or deployed)
- Neon PostgreSQL database with User and Task tables
- Python 3.12+
- Node.js 18+
- OpenAI API key

## 1. Environment Setup

Add these variables to your `.env` file (backend):

```env
# Existing Phase II variables (unchanged)
DATABASE_URL=postgresql://...@your-neon-host/your-db
AUTH_SECRET=your-better-auth-secret

# New Phase III variables
OPENAI_API_KEY=sk-your-openai-api-key
```

Add to frontend `.env.local`:

```env
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-chatkit-domain-key
```

## 2. Database Migration

Run the Phase III migration to create Conversation and Message tables:

```sql
-- See: specs/002-todo-ai-chatbot/data-model.md for full DDL
-- Or run: db/migrations/002_add_conversations.sql
```

Verify tables exist:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('conversations', 'messages');
```

## 3. Backend Setup

Install new dependencies:

```bash
cd backend
pip install openai-agents mcp-sdk
```

Verify the chat endpoint is registered:

```bash
# Start the backend
uvicorn app.main:app --reload

# Test the endpoint (replace with valid JWT and user_id)
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries"}'
```

Expected response:

```json
{
  "response": "I've added 'Buy groceries' to your tasks!",
  "conversation_id": "some-uuid"
}
```

## 4. Frontend Setup

Install ChatKit:

```bash
cd frontend
npm install @openai/chatkit
```

Navigate to `http://localhost:3000/chat` and verify the chat interface loads.

## 5. Verification Checklist

- [ ] Conversation and Message tables created in Neon
- [ ] `POST /api/{user_id}/chat` returns 200 with valid JWT
- [ ] `POST /api/{user_id}/chat` returns 401 without JWT
- [ ] `POST /api/{user_id}/chat` returns 403 with mismatched user_id
- [ ] Task created via chat appears in Phase II task list
- [ ] Phase II endpoints (`/api/tasks`, `/api/auth/*`) still work
- [ ] ChatKit interface renders at `/chat`
- [ ] Conversation persists across page reloads

## 6. Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| 401 on chat endpoint | Missing or expired JWT | Re-authenticate via Phase II login |
| 403 on chat endpoint | user_id mismatch | Ensure path user_id matches JWT sub claim |
| 503 on chat endpoint | OpenAI API down or rate limited | Check OPENAI_API_KEY, verify API status |
| Empty chat response | Agent failed to invoke tool | Check backend logs for tool dispatch errors |
| Chat history missing | conversation_id not sent | Ensure frontend passes conversation_id on subsequent messages |
