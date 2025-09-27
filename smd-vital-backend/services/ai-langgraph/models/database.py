"""
Database Models for AI LangGraph Service
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class AISession(Base):
    """AI Session model"""
    __tablename__ = "ai_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    queries = relationship("AIQuery", back_populates="session")

class AIQuery(Base):
    """AI Query model"""
    __tablename__ = "ai_queries"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("ai_sessions.id"), nullable=False)
    query_text = Column(Text, nullable=False)
    response_text = Column(Text)
    confidence_score = Column(Float, default=0.0)
    processing_time = Column(Float, default=0.0)
    model_used = Column(String(100))
    workflow_used = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("AISession", back_populates="queries")

class AIWorkflow(Base):
    """AI Workflow model"""
    __tablename__ = "ai_workflows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    configuration = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Database connection
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://smdvital:smdvital123@postgres:5432/smdvital_ai")

# Async engine
async_engine = create_async_engine(DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    """Get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()