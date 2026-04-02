def build_analyze_prompt(title: str, raw_alert: str, similar_incidents: list) -> str:
    similar_context = ""

    if similar_incidents:
        similar_context = "\n\n--- SIMILAR PAST INCIDENTS FROM THIS TEAM ---\n"
        for i, inc in enumerate(similar_incidents, 1):
            similar_context += f"""
Incident {i}: {inc['title']}
Alert: {inc['raw_alert'][:300]}...
Root Cause: {inc['root_cause']}
Fix Applied: {inc['suggested_fix']}
---"""
        similar_context += "\nUse the above historical context to improve your analysis. If this looks like a repeat incident, say so explicitly.\n"

    prompt = f"""You are AlertIQ, an expert incident analysis assistant for software engineering teams.
Your job is to analyze production alerts and errors, identify root causes, and suggest fixes.
You have access to this team's historical incident data to detect patterns and repeats.
{similar_context}
--- NEW INCIDENT ---
Title: {title}
Alert / Log:
{raw_alert}

Respond ONLY in the following JSON format, no extra text:
{{
  "ai_summary": "2-3 sentence plain English explanation of what happened",
  "root_cause": "The most likely technical root cause",
  "suggested_fix": "Step-by-step actionable fix",
  "severity": "critical|high|medium|low",
  "is_repeat": true or false,
  "repeat_note": "If repeat, explain which past incident this resembles and why"
}}"""
    return prompt


def build_chat_prompt(incident: dict, chat_history: list, user_message: str):
    system = f"""You are AlertIQ, an expert incident assistant.
You are helping a team investigate this specific incident:

Title: {incident['title']}
Alert: {incident['raw_alert'][:500]}
AI Summary: {incident.get('ai_summary', 'Not yet analyzed')}
Root Cause: {incident.get('root_cause', 'Unknown')}
Suggested Fix: {incident.get('suggested_fix', 'None yet')}
Severity: {incident.get('severity', 'unknown')}

Answer questions about this incident concisely and technically.
If asked about something unrelated, redirect the conversation back."""

    messages = []
    for msg in chat_history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})

    return system, messages
