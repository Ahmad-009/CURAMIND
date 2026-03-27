from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# engine is the one that establishes the connection
engine = create_engine(settings.DATABASE_URL, 
                       pool_size=20,
                       max_overflow=10,
                       pool_pre_ping=True
                    )

# the session maker is what makes the session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base() # the base class 


def get_db():
    db = SessionLocal()
    try:
        yield db # yield waits for the execution to complete
    finally:
        db.close()
