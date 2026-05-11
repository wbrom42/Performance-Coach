"""Database engine and session — SQLModel over SQLite (WAL mode)."""

from pathlib import Path
from sqlmodel import create_engine, Session

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "performance.db"

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db():
    """Create tables. Import models first so SQLModel metadata registers them."""
    from models import SQLModel  # noqa: F401 — registers all models on import
    SQLModel.metadata.create_all(engine)

    # Seed athletes if empty
    with Session(engine) as session:
        from models import Athlete
        existing = session.get(Athlete, "tristan")
        if existing is None:
            session.add(Athlete(
                id="tristan", name="Tristan", initials="T",
                age=16, position="Midfielder", avatar_hue=217,
                height="5'9\"", weight="142 lb", joined="2024-09-01",
            ))
            session.add(Athlete(
                id="kennedy", name="Kennedy", initials="K",
                age=15, position="Forward", avatar_hue=25,
            ))
            session.commit()


def get_session():
    with Session(engine) as session:
        yield session
