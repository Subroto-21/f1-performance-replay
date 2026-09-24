import pandas as pd

from app.services.session_service import _safe, _td


def test_safe_returns_none_for_nan():
    assert _safe(float("nan")) is None
    assert _safe(pd.NA) is None


def test_safe_passes_through_real_values():
    assert _safe("VER") == "VER"
    assert _safe(44) == 44
    assert _safe(0) == 0


def test_safe_handles_non_nan_able_types():
    assert _safe("some string") == "some string"


def test_td_converts_timedelta_to_seconds():
    assert _td(pd.Timedelta(seconds=91.234)) == 91.234


def test_td_returns_none_for_none():
    assert _td(None) is None


def test_td_returns_none_for_nat():
    assert _td(pd.NaT) is None
