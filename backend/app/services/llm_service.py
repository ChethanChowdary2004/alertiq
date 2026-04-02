import httpx
import json
from app.config import settings

OPENAI_URL = "https://api.openai.com/v1/chat/completions"

def get_headers():
    return {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

async def analyze_incident(prompt: str) -> dict:
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(OPENAI_URL, headers=get_headers(), json=payload)
        response.raise_for_status()
        data = response.json()

    raw_content = data["choices"][0]["message"]["content"]
    tokens_used = data["usage"]["total_tokens"]
    parsed = json.loads(raw_content)

    return {"parsed": parsed, "raw": raw_content, "tokens_used": tokens_used}


async def chat_with_incident(system_prompt: str, messages: list) -> str:
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "system", "content": system_prompt}] + messages,
        "temperature": 0.4,
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(OPENAI_URL, headers=get_headers(), json=payload)
        response.raise_for_status()
        data = response.json()

    return data["choices"][0]["message"]["content"]
