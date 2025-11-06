from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import races
from app.core.config import settings

app = FastAPI(title="F1 Performance Replay API 🚀")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(races.router)


@app.get("/")
def root():
    return {"message": "Backend running successfully!"}
