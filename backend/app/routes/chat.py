from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database import get_db
from app.models.incident import Incident, ChatMessage
from app.schemas.incident import ChatMessageCreate, ChatMessageResponse
from app.services.llm_service import chat_with_incident
from app.prompts.analyze_prompt import build_chat_prompt

router = APIRouter(prefix="/incidents/{incident_id}/chat", tags=["chat"])


@router.get("/", response_model=List[ChatMessageResponse])
def get_chat_history(incident_id: UUID, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return db.query(ChatMessage).filter(
        ChatMessage.incident_id == incident_id
    ).order_by(ChatMessage.created_at.asc()).all()


@router.post("/", response_model=ChatMessageResponse)
async def send_message(incident_id: UUID, body: ChatMessageCreate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    user_msg = ChatMessage(incident_id=incident_id, role="user", content=body.content)
    db.add(user_msg)
    db.commit()

    history = db.query(ChatMessage).filter(
        ChatMessage.incident_id == incident_id
    ).order_by(ChatMessage.created_at.asc()).all()

    history_dicts = [{"role": m.role, "content": m.content} for m in history]
    incident_dict = {
        "title": incident.title,
        "raw_alert": incident.raw_alert,
        "ai_summary": incident.ai_summary,
        "root_cause": incident.root_cause,
        "suggested_fix": incident.suggested_fix,
        "severity": incident.severity,
    }

    system_prompt, messages = build_chat_prompt(incident_dict, history_dicts, body.content)

    try:
        ai_reply = await chat_with_incident(system_prompt, messages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM API error: {str(e)}")

    assistant_msg = ChatMessage(incident_id=incident_id, role="assistant", content=ai_reply)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
