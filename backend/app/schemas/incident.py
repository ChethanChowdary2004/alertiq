from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class IncidentCreate(BaseModel):
    title: str
    raw_alert: str

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None

class IncidentResponse(BaseModel):
    id: UUID
    title: str
    raw_alert: str
    ai_summary: Optional[str]
    root_cause: Optional[str]
    suggested_fix: Optional[str]
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: UUID
    incident_id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    title: str
    raw_alert: str
