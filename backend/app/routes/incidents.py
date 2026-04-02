from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database import get_db
from app.models.incident import Incident, AnalysisHistory
from app.schemas.incident import IncidentUpdate, IncidentResponse, AnalyzeRequest
from app.services.similarity_service import get_similar_incidents
from app.services.llm_service import analyze_incident
from app.prompts.analyze_prompt import build_analyze_prompt
from app.config import settings

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("/", response_model=List[IncidentResponse])
def list_incidents(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: UUID, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.post("/analyze", response_model=IncidentResponse)
async def analyze_and_create(body: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Core endpoint — the differentiator.
    1. Finds similar past incidents from PostgreSQL (team memory)
    2. Injects them into the LLM prompt
    3. Gets structured AI analysis
    4. Saves everything to DB + logs the analysis
    """
    similar = get_similar_incidents(db, body.raw_alert, limit=3)
    prompt = build_analyze_prompt(body.title, body.raw_alert, similar)

    try:
        result = await analyze_incident(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM API error: {str(e)}")

    parsed = result["parsed"]

    incident = Incident(
        user_id=settings.DEFAULT_USER_ID if settings.DEFAULT_USER_ID else None,
        title=body.title,
        raw_alert=body.raw_alert,
        ai_summary=parsed.get("ai_summary"),
        root_cause=parsed.get("root_cause"),
        suggested_fix=parsed.get("suggested_fix"),
        severity=parsed.get("severity", "medium"),
        status="open",
    )
    db.add(incident)
    db.flush()

    log = AnalysisHistory(
        incident_id=incident.id,
        prompt_sent=prompt,
        raw_llm_response=result["raw"],
        tokens_used=result["tokens_used"],
        similar_incidents_used=len(similar),
    )
    db.add(log)
    db.commit()
    db.refresh(incident)
    return incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: UUID, body: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if body.status:
        incident.status = body.status
    if body.severity:
        incident.severity = body.severity
    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}")
def delete_incident(incident_id: UUID, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return {"message": "Incident deleted"}
