from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, session: Session = Depends(get_session)):
    # Validate password length
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters",
        )

    # Check for duplicate email
    existing = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, session: Session = Depends(get_session)):
    # Find user by email
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate JWT
    access_token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=access_token)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}
