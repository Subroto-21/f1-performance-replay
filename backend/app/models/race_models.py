from pydantic import BaseModel
from typing import List


class Race(BaseModel):
    RoundNumber: int
    EventName: str
    EventDate: str
    Country: str
    Location: str


class RaceListResponse(BaseModel):
    season: int
    races: List[Race]
