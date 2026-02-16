from sqlmodel import SQLModel, Session, create_engine
from app.config import get_settings
settings = get_settings()

# Ensure psycopg3 driver is used (postgresql+psycopg://)
db_url = settings.database_url.strip("'\"")
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(db_url, echo=False, pool_pre_ping=True)


def create_db_and_tables():
    # Import all models so SQLModel registers their tables
    import app.models  # noqa: F401
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        # Table already exists, ignore the error
        import logging
        logging.getLogger(__name__).debug(f"Table creation info: {e}")


def get_session():
    with Session(engine) as session:
        yield session
