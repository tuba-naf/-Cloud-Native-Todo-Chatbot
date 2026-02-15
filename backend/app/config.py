import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/dbname")
    better_auth_secret: str = os.getenv(
        "BETTER_AUTH_SECRET", "change-me-to-a-secure-secret-minimum-32-chars"
    )
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_days: int = int(os.getenv("JWT_EXPIRE_DAYS", "7"))
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    # Phase III: OpenAI API key for Agents SDK
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")


def get_settings() -> Settings:
    return Settings()
