"""
Checkpointer Abstraction

Provides a unified interface for LangGraph state persistence.
Starts with in-memory storage (free) and can be upgraded to
PostgreSQL/Redis when revenue justifies the cost.

Budget Philosophy: Use MemorySaver for MVP, upgrade when profitable.
"""

import os
from typing import Optional, Literal
from langgraph.checkpoint.memory import MemorySaver

# Future imports (uncomment when upgrading)
# from langgraph.checkpoint.postgres import PostgresSaver
# from langgraph.checkpoint.sqlite import SqliteSaver


CheckpointerType = Literal["memory", "sqlite", "postgres"]


def get_checkpointer(
    checkpointer_type: Optional[CheckpointerType] = None,
    connection_string: Optional[str] = None
):
    """
    Get the appropriate checkpointer based on environment and config.

    Priority:
    1. Explicit checkpointer_type parameter
    2. CHECKPOINTER_TYPE environment variable
    3. Default to "memory" (free, no setup required)

    Args:
        checkpointer_type: Type of checkpointer to use
        connection_string: Database connection string (for postgres/sqlite)

    Returns:
        Configured checkpointer instance

    Examples:
        # Development (default, free)
        checkpointer = get_checkpointer()

        # SQLite (free, persistent, local)
        checkpointer = get_checkpointer("sqlite", "./data/tutor.db")

        # PostgreSQL (production, requires setup)
        checkpointer = get_checkpointer("postgres", os.environ["DATABASE_URL"])
    """
    # Determine checkpointer type
    ctype = checkpointer_type or os.environ.get("CHECKPOINTER_TYPE", "memory")

    if ctype == "memory":
        return MemorySaver()

    elif ctype == "sqlite":
        # SQLite is free and persistent - good for single-server deployments
        db_path = connection_string or os.environ.get("SQLITE_PATH", "./data/tutor.db")
        # Ensure directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        # Note: SqliteSaver requires langgraph[sqlite] extra
        # pip install langgraph[sqlite]
        try:
            from langgraph.checkpoint.sqlite import SqliteSaver
            return SqliteSaver.from_conn_string(db_path)
        except ImportError:
            print("SQLite checkpointer requires: pip install langgraph[sqlite]")
            print("Falling back to memory checkpointer")
            return MemorySaver()

    elif ctype == "postgres":
        # PostgreSQL - production grade, requires database
        conn_string = connection_string or os.environ.get("DATABASE_URL")
        if not conn_string:
            raise ValueError(
                "PostgreSQL checkpointer requires DATABASE_URL environment variable "
                "or connection_string parameter"
            )
        # Note: PostgresSaver requires langgraph[postgres] extra
        # pip install langgraph[postgres]
        try:
            from langgraph.checkpoint.postgres import PostgresSaver
            return PostgresSaver.from_conn_string(conn_string)
        except ImportError:
            print("PostgreSQL checkpointer requires: pip install langgraph[postgres]")
            print("Falling back to memory checkpointer")
            return MemorySaver()

    else:
        raise ValueError(f"Unknown checkpointer type: {ctype}")


class CheckpointerFactory:
    """
    Factory class for creating and managing checkpointers.

    Provides a singleton-like pattern for checkpointer instances
    to avoid creating multiple connections.
    """

    _instance: Optional[object] = None
    _type: Optional[str] = None

    @classmethod
    def get_instance(
        cls,
        checkpointer_type: Optional[CheckpointerType] = None,
        connection_string: Optional[str] = None,
        force_new: bool = False
    ):
        """
        Get or create a checkpointer instance.

        Args:
            checkpointer_type: Type of checkpointer
            connection_string: Database connection string
            force_new: Force creation of new instance

        Returns:
            Checkpointer instance
        """
        ctype = checkpointer_type or os.environ.get("CHECKPOINTER_TYPE", "memory")

        # Return cached instance if same type and not forcing new
        if cls._instance is not None and cls._type == ctype and not force_new:
            return cls._instance

        # Create new instance
        cls._instance = get_checkpointer(checkpointer_type, connection_string)
        cls._type = ctype

        return cls._instance

    @classmethod
    def reset(cls):
        """Reset the factory (useful for testing)."""
        cls._instance = None
        cls._type = None


# Convenience function for getting the default checkpointer
def get_default_checkpointer():
    """
    Get the default checkpointer for the application.

    Uses environment variables to determine the appropriate type.
    Falls back to memory (free) if not configured.

    Returns:
        Configured checkpointer instance
    """
    return CheckpointerFactory.get_instance()


# Export for easy access
__all__ = [
    "get_checkpointer",
    "get_default_checkpointer",
    "CheckpointerFactory",
    "CheckpointerType",
]
