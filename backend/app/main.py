from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import incidents, chat
from app.database import engine
from app import models

models.incident.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AlertIQ API",
    description="Incident Intelligence Platform — team memory powered by AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "AlertIQ API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
