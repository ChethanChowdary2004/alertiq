import re
from sqlalchemy.orm import Session
from app.models.incident import Incident

def get_similar_incidents(db: Session, raw_alert: str, current_id=None, limit: int = 3) -> list:
    """
    Core differentiator: finds past incidents similar to the current alert
    using keyword matching, then injects them into the LLM prompt.
    This gives the AI team memory that ChatGPT cannot have.
    """
    keywords = extract_keywords(raw_alert)
    if not keywords:
        return []

    query = db.query(Incident).filter(
        Incident.ai_summary.isnot(None),
        Incident.root_cause.isnot(None),
    )
    if current_id:
        query = query.filter(Incident.id != current_id)

    past_incidents = query.order_by(Incident.created_at.desc()).limit(50).all()

    scored = []
    for inc in past_incidents:
        score = keyword_overlap_score(keywords, inc.raw_alert + " " + (inc.ai_summary or ""))
        if score > 0:
            scored.append((score, inc))

    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            "title": inc.title,
            "raw_alert": inc.raw_alert,
            "root_cause": inc.root_cause,
            "suggested_fix": inc.suggested_fix,
            "severity": inc.severity,
            "score": score,
        }
        for score, inc in scored[:limit]
    ]


def extract_keywords(text: str) -> list:
    stopwords = {"the","a","an","is","at","on","in","to","and","or","for","of","with","this","that"}
    words = re.findall(r'\b[a-zA-Z0-9_\-\.]{3,}\b', text.lower())
    return [w for w in words if w not in stopwords]


def keyword_overlap_score(keywords: list, target_text: str) -> int:
    target_lower = target_text.lower()
    return sum(1 for kw in keywords if kw in target_lower)
