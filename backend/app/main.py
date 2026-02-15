import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_db_and_tables
from app.api.auth import router as auth_router
from app.api.tasks import router as tasks_router
from app.api.chat import router as chat_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables if they don't exist...")
    create_db_and_tables()
    logger.info("Database tables ready.")
    yield


app = FastAPI(
    title="Todo Full-Stack Web Application API",
    description="RESTful API for multi-user todo application with JWT authentication",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info(
        "%s %s %s %.3fs",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    return response


app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(chat_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
