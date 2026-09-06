import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.dependencies import get_db, require_manager
from app.infrastructure.models.report import ReportModel
from app.infrastructure.models.report_version import ReportVersionModel

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


async def build_team_context(db: AsyncSession) -> str:
    """Extracts all active team reports into a structured context for Gemini."""
    result = await db.execute(
        select(ReportModel)
        .options(
            selectinload(ReportModel.user),
            selectinload(ReportModel.project),
            selectinload(ReportModel.versions),
        )
        .order_by(ReportModel.week_start.desc())
        .limit(20)
    )
    reports = list(result.scalars().all())

    if not reports:
        return "No reports currently available in database."

    context_lines = ["=== RECENT TEAM WEEKLY REPORTS ==="]
    for r in reports:
        user_name = r.user.full_name if r.user else f"User #{r.user_id}"
        proj_name = r.project.name if r.project else "General"
        v = sorted(r.versions or [], key=lambda x: x.version_number, reverse=True)
        latest = v[0] if v else None

        context_lines.append(
            f"\n[Report: {user_name} | Week: {r.week_start} to {r.week_end} | Project: {proj_name} | Status: {r.status}]"
        )
        if latest:
            tasks = latest.tasks_completed or []
            task_summaries = [
                f"- {t.get('task_name')} ({t.get('actual_percentage', 0)}% done, {t.get('time_spent_hours', 0)}h, Status: {t.get('status')})"
                for t in tasks
            ]
            if task_summaries:
                context_lines.append("  Completed/Active Tasks:\n  " + "\n  ".join(task_summaries))

            if latest.tasks_planned:
                context_lines.append(f"  Planned Next Week: {latest.tasks_planned.strip()}")

            blockers = latest.blockers or []
            if blockers:
                blocker_strs = [
                    f"- {'[KEY ISSUE] ' if b.get('is_key_issue') else ''}{b.get('description')}"
                    for b in blockers
                ]
                context_lines.append("  Blockers:\n  " + "\n  ".join(blocker_strs))

            achievements = latest.achievements or []
            if achievements:
                ach_strs = [
                    f"- {'[HIGHLIGHT] ' if a.get('is_key_achievement') else ''}{a.get('description')}"
                    for a in achievements
                ]
                context_lines.append("  Achievements:\n  " + "\n  ".join(ach_strs))

    return "\n".join(context_lines)


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_manager()),
):
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("PASTE_YOUR"):
        return ChatResponse(
            reply="⚠️ Google Gemini API Key is missing. Please add `GEMINI_API_KEY` to your `backend/.env` file and restart the server."
        )

    team_context = await build_team_context(db)

    full_prompt = (
        "You are an executive AI Management Assistant for a weekly report tracking system. "
        "Your job is to assist managers by analyzing submitted weekly reports, identifying workload imbalances, "
        "highlighting critical blockers, and summarizing completed work.\n\n"
        "Here is the real-time weekly report data across the team:\n"
        f"{team_context}\n\n"
        f"Manager's Question: {request.message}\n\n"
        "Instructions:\n"
        "- Answer the manager's question clearly, concisely, and professionally based strictly on the provided report data.\n"
        "- Use bullet points where appropriate for readability.\n"
        "- If the requested person or detail is not present in the data, state that clearly."
    )

    payload = {
        "contents": [
            {
                "parts": [{"text": full_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 800,
        }
    }

    # Prioritized active models from your account quota
    models_to_try = [
        "gemini-3.6-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.7-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
    ]

    async with httpx.AsyncClient(timeout=30.0) as client:
        last_error = ""
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            try:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return ChatResponse(reply=parts[0]["text"])
                elif response.status_code == 404:
                    last_error = response.text
                    continue
                else:
                    last_error = response.text
            except Exception as e:
                last_error = str(e)
                continue

    return ChatResponse(
        reply=f"❌ Could not connect to Gemini models. Details: {last_error}"
    )