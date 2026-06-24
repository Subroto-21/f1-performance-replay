from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.services import session_service

router = APIRouter(tags=["Sessions"])


@router.get("/api/races/{year}/{round}/sessions")
def get_sessions(year: int, round: int):
    try:
        return session_service.get_sessions_for_race(year, round)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/sessions/{year}/{round}/{session}/results")
def get_results(year: int, round: int, session: str):
    try:
        return session_service.get_session_results(year, round, session)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/sessions/{year}/{round}/{session}/telemetry")
def get_telemetry(
    year: int,
    round: int,
    session: str,
    drivers: List[str] = Query(..., description="Driver abbreviations, e.g. HAM&drivers=VER"),
    lap: str = Query("fastest", description="'fastest' or a lap number"),
):
    try:
        return session_service.get_telemetry_comparison(year, round, session, drivers, lap)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
