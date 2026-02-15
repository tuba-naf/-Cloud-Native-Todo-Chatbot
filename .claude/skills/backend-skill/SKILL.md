---
name: backend-skill
description: Generate backend routes, handle requests/responses, and connect to databases safely. Use for FastAPI, REST APIs, or Python backend tasks.
---

# Backend Skill

## Instructions

1. **Route Generation**
   - Create RESTful endpoints using proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Use logical route structures for resources
   - Apply APIRouter or modular routing patterns
   - Include authentication and authorization dependencies where necessary

2. **Request/Response Handling**
   - Validate incoming requests using Pydantic models
   - Handle query parameters, headers, and path parameters safely
   - Return structured and consistent JSON responses
   - Implement error handling for invalid inputs and exceptions
   - Log requests and errors for traceability

3. **Database Interaction**
   - Use parameterized queries or ORM methods to prevent SQL injection
   - Manage async or sync database sessions appropriately
   - Implement transactions for multi-step operations
   - Use repository or service layers for business logic separation
   - Optimize queries and database access patterns

4. **Middleware and Security**
   - Add authentication and authorization checks
   - Implement rate limiting and logging where appropriate
   - Sanitize inputs to prevent injection attacks
   - Handle cross-origin requests (CORS) as required

---

## Best Practices

- Follow consistent naming conventions for endpoints, parameters, and models  
- Always validate input before processing  
- Provide meaningful HTTP status codes and messages  
- Keep endpoint functions focused on a single responsibility  
- Document endpoints for OpenAPI/Swagger automatically  
- Test routes with unit and integration tests  
- Avoid hardcoding credentials; use environment variables  
- Ensure backward compatibility when updating routes  

---

## Example Structure

```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: str

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """Create a new user in the database with proper validation and hashing."""
    # Implementation here
    pass
