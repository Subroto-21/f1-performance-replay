import pandas as pd
import pytest

from app.services import session_service


class _FakeSession:
    def __init__(self, laps: pd.DataFrame):
        self.laps = laps

    def load(self, **kwargs):
        pass


@pytest.fixture
def fake_laps_df() -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "Driver": "VER",
                "LapNumber": 2,
                "LapTime": pd.Timedelta(seconds=91.0),
                "Sector1Time": pd.Timedelta(seconds=30.0),
                "Sector2Time": pd.Timedelta(seconds=31.0),
                "Sector3Time": pd.Timedelta(seconds=30.0),
                "Compound": "SOFT",
                "TyreLife": 2,
                "Stint": 1,
                "IsPersonalBest": True,
                "Deleted": False,
                "PitInTime": pd.NaT,
                "PitOutTime": pd.NaT,
                "TrackStatus": "1",
                "Position": 1,
            },
            {
                "Driver": "VER",
                "LapNumber": 1,
                "LapTime": pd.Timedelta(seconds=93.0),
                "Sector1Time": pd.Timedelta(seconds=31.0),
                "Sector2Time": pd.Timedelta(seconds=31.0),
                "Sector3Time": pd.Timedelta(seconds=31.0),
                "Compound": "SOFT",
                "TyreLife": 1,
                "Stint": 1,
                "IsPersonalBest": False,
                "Deleted": False,
                "PitInTime": pd.NaT,
                "PitOutTime": pd.NaT,
                "TrackStatus": "1",
                "Position": 2,
            },
            {
                "Driver": "HAM",
                "LapNumber": 1,
                "LapTime": pd.NaT,
                "Sector1Time": pd.NaT,
                "Sector2Time": pd.NaT,
                "Sector3Time": pd.NaT,
                "Compound": "MEDIUM",
                "TyreLife": 1,
                "Stint": 1,
                "IsPersonalBest": False,
                "Deleted": False,
                "PitInTime": pd.NaT,
                "PitOutTime": pd.NaT,
                "TrackStatus": "1",
                "Position": 3,
            },
        ]
    )


def test_get_laps_for_session_groups_and_sorts_by_driver(monkeypatch, fake_laps_df):
    monkeypatch.setattr(
        session_service.fastf1, "get_session", lambda *a, **k: _FakeSession(fake_laps_df)
    )

    result = session_service.get_laps_for_session(2024, 1, "R")

    assert result["year"] == 2024
    assert result["round"] == 1
    assert result["session_key"] == "R"

    by_driver = {d["driver"]: d["laps"] for d in result["drivers"]}
    assert set(by_driver) == {"VER", "HAM"}

    # VER's laps come back sorted ascending by lap number, not input order
    ver_laps = by_driver["VER"]
    assert [lap["lap_number"] for lap in ver_laps] == [1, 2]
    assert ver_laps[1]["lap_time"] == 91.0
    assert ver_laps[1]["is_personal_best"] is True

    # NaT lap time on HAM's lap becomes None, not NaN/crash
    assert by_driver["HAM"][0]["lap_time"] is None
