import pandas as pd
import pytest

from app.services import session_service


class _FakeCircuitInfo:
    def __init__(self, corners: pd.DataFrame):
        self.corners = corners


class _FakeSession:
    def __init__(self, circuit_info):
        self._circuit_info = circuit_info

    def load(self, **kwargs):
        pass

    def get_circuit_info(self):
        return self._circuit_info


def test_get_circuit_corners_returns_number_letter_and_distance(monkeypatch):
    corners_df = pd.DataFrame(
        [
            {"Number": 1, "Letter": "", "Distance": 338.0},
            {"Number": 3, "Letter": "A", "Distance": 818.2},
        ]
    )
    fake_session = _FakeSession(_FakeCircuitInfo(corners_df))
    monkeypatch.setattr(session_service.fastf1, "get_session", lambda *a, **k: fake_session)

    result = session_service.get_circuit_corners(2024, 15, "FP1")

    assert result["corners"] == [
        {"number": 1, "letter": "", "distance": 338.0},
        {"number": 3, "letter": "A", "distance": 818.2},
    ]


def test_get_circuit_corners_skips_rows_without_distance(monkeypatch):
    corners_df = pd.DataFrame(
        [
            {"Number": 1, "Letter": "", "Distance": float("nan")},
            {"Number": 2, "Letter": "", "Distance": 500.0},
        ]
    )
    fake_session = _FakeSession(_FakeCircuitInfo(corners_df))
    monkeypatch.setattr(session_service.fastf1, "get_session", lambda *a, **k: fake_session)

    result = session_service.get_circuit_corners(2024, 15, "FP1")

    assert result["corners"] == [{"number": 2, "letter": "", "distance": 500.0}]


def test_get_circuit_corners_handles_no_circuit_info(monkeypatch):
    fake_session = _FakeSession(None)
    monkeypatch.setattr(session_service.fastf1, "get_session", lambda *a, **k: fake_session)

    result = session_service.get_circuit_corners(2024, 15, "FP1")

    assert result == {"corners": []}
