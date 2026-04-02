from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from app.database import get_db
from app.models.incident import Incident, AnalysisHistory

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    total = db.query(Incident).count()
    resolved = db.query(Incident).filter(Incident.status == "resolved").count()
    repeat_incidents = db.query(AnalysisHistory).filter(
        AnalysisHistory.similar_incidents_used > 0
    ).count()

    avg_resolution = None
    resolved_incidents = db.query(Incident).filter(Incident.status == "resolved").all()
    if resolved_incidents:
        durations = [
            (inc.updated_at - inc.created_at).total_seconds() / 3600
            for inc in resolved_incidents
            if inc.updated_at and inc.created_at
        ]
        avg_resolution = round(sum(durations) / len(durations), 2) if durations else 0

    return {
        "total_incidents": total,
        "resolved": resolved,
        "open": db.query(Incident).filter(Incident.status == "open").count(),
        "investigating": db.query(Incident).filter(Incident.status == "investigating").count(),
        "repeat_rate": round((repeat_incidents / total * 100), 1) if total > 0 else 0,
        "avg_resolution_hours": avg_resolution,
    }


@router.get("/severity-breakdown")
def get_severity_breakdown(db: Session = Depends(get_db)):
    results = db.query(
        Incident.severity, func.count(Incident.id).label("count")
    ).group_by(Incident.severity).all()
    return [{"severity": r.severity, "count": r.count} for r in results]


@router.get("/incidents-over-time")
def get_incidents_over_time(db: Session = Depends(get_db)):
    results = db.query(
        cast(Incident.created_at, Date).label("date"),
        func.count(Incident.id).label("count")
    ).group_by(cast(Incident.created_at, Date)).order_by("date").all()
    return [{"date": str(r.date), "count": r.count} for r in results]


@router.get("/top-keywords")
def get_top_keywords(db: Session = Depends(get_db)):
    incidents = db.query(Incident.root_cause).filter(
        Incident.root_cause.isnot(None)
    ).all()

    import re
    from collections import Counter
    stopwords = {"the","a","an","is","at","on","in","to","and","or","for",
                 "of","with","this","that","was","are","were","has","have",
                 "been","due","caused","by","from","it","its","which","when"}

    all_words = []
    for (root_cause,) in incidents:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', root_cause.lower())
        all_words.extend([w for w in words if w not in stopwords])

    top = Counter(all_words).most_common(8)
    return [{"keyword": kw, "count": count} for kw, count in top]