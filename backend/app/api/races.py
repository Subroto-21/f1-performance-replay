from fastapi import APIRouter
from app.services import race_service

router = APIRouter(prefix="/api/races", tags=["Races"])


@router.get("/{year}")
def get_races(year: int):
    return race_service.get_races_for_year(year)
