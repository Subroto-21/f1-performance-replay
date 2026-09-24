from fastapi.testclient import TestClient

from app.api import sessions as sessions_api
from main import app

client = TestClient(app)


def test_get_laps_returns_service_payload(monkeypatch):
    fake_payload = {"year": 2024, "round": 1, "session_key": "R", "drivers": []}
    monkeypatch.setattr(
        sessions_api.session_service, "get_laps_for_session", lambda *a, **k: fake_payload
    )

    resp = client.get("/api/sessions/2024/1/R/laps")

    assert resp.status_code == 200
    assert resp.json() == fake_payload


def test_get_laps_returns_500_on_service_error(monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("fastf1 blew up")

    monkeypatch.setattr(sessions_api.session_service, "get_laps_for_session", boom)

    resp = client.get("/api/sessions/2024/1/R/laps")

    assert resp.status_code == 500
    assert "fastf1 blew up" in resp.json()["detail"]


def test_get_telemetry_forwards_parallel_drivers_and_laps(monkeypatch):
    captured = {}

    def fake_telemetry(year, round, session, drivers, laps):
        captured["args"] = (year, round, session, drivers, laps)
        return {"drivers": []}

    monkeypatch.setattr(sessions_api.session_service, "get_telemetry_comparison", fake_telemetry)

    resp = client.get(
        "/api/sessions/2024/1/R/telemetry",
        params=[("drivers", "VER"), ("drivers", "HAM"), ("laps", "fastest"), ("laps", "12")],
    )

    assert resp.status_code == 200
    assert captured["args"] == (2024, 1, "R", ["VER", "HAM"], ["fastest", "12"])
