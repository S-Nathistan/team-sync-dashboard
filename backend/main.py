from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.infrastructure.database import create_tables
from app.presentation.api import auth, users, reports, projects, dashboard, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist (dev convenience; prod uses Alembic)
    await create_tables()
    yield
    # Shutdown: nothing for now


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Weekly Report Generator & Team Dashboard API",
    lifespan=lifespan,
)

# CORS
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-steel-pi-63.vercel.app",
        "https://frontend-admin-d925.vercel.app",
        "https://frontend-git-main-admin-d925.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Matches all current and future Vercel deployment URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Let HTTPException be handled by FastAPI normally
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(chat.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)