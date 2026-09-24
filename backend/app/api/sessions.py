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


@router.get("/api/sessions/{year}/{round}/{session}/laps")
def get_laps(year: int, round: int, session: str):
    try:
        return session_service.get_laps_for_session(year, round, session)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/sessions/{year}/{round}/{session}/circuit")
def get_circuit(year: int, round: int, session: str):
    try:
        return session_service.get_circuit_corners(year, round, session)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/api/sessions/{year}/{round}/{session}/telemetry")
def get_telemetry(
    year: int,
    round: int,
    session: str,
    drivers: List[str] = Query(..., description="Driver abbreviations, e.g. HAM&drivers=VER"),
    laps: List[str] = Query([], description="Parallel to drivers: 'fastest' or a lap number each"),
):
    try:
        return session_service.get_telemetry_comparison(year, round, session, drivers, laps)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
