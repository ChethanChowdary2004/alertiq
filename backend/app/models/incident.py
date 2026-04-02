import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    incidents = relationship("Incident", back_populates="user")

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=False)
    raw_alert = Column(Text, nullable=False)
    ai_summary = Column(Text)
    root_cause = Column(Text)
    suggested_fix = Column(Text)
    severity = Column(String(20), default="medium")
    status = Column(String(20), default="open")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="incidents")
    chat_messages = relationship("ChatMessage", back_populates="incident", cascade="all, delete")
    analysis_history = relationship("AnalysisHistory", back_populates="incident", cascade="all, delete")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(10), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    incident = relationship("Incident", back_populates="chat_messages")

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    prompt_sent = Column(Text, nullable=False)
    raw_llm_response = Column(Text, nullable=False)
    tokens_used = Column(Integer)
    similar_incidents_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    incident = relationship("Incident", back_populates="analysis_history")
