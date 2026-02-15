"""Initial schema: users and tasks tables

Revision ID: 001
Revises:
Create Date: 2026-02-06
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("idx_users_email", "users", ["email"], unique=True)

    op.create_table(
        "tasks",
        sa.Column("id", sa.Uuid(), nullable=False, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("idx_tasks_owner_id", "tasks", ["owner_id"])

    # Create updated_at trigger
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    op.execute("""
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)
    op.execute("""
        CREATE TRIGGER update_tasks_updated_at
            BEFORE UPDATE ON tasks
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks")
    op.execute("DROP TRIGGER IF EXISTS update_users_updated_at ON users")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    op.drop_index("idx_tasks_owner_id", table_name="tasks")
    op.drop_table("tasks")
    op.drop_index("idx_users_email", table_name="users")
    op.drop_table("users")
