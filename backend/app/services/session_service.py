import fastf1
import pandas as pd
import numpy as np

fastf1.Cache.enable_cache("./cache")

# Maps FastF1 full session names → short URL-safe keys
_NAME_TO_KEY: dict[str, str] = {
    "Practice 1": "FP1",
    "Practice 2": "FP2",
    "Practice 3": "FP3",
    "Qualifying": "Q",
    "Sprint Qualifying": "SQ",
    "Sprint Shootout": "SQ",
    "Sprint": "S",
    "Race": "R",
}

_KEY_TO_LABEL: dict[str, str] = {
    "FP1": "Practice 1",
    "FP2": "Practice 2",
    "FP3": "Practice 3",
    "Q": "Qualifying",
    "SQ": "Sprint Qualifying",
    "S": "Sprint",
    "R": "Race",
}


def _safe(val):
    """Return None for any NaN-like value, otherwise return val."""
    try:
        if pd.isna(val):
            return None
    except (TypeError, ValueError):
        pass
    return val


def _td(val):
    """Convert pandas Timedelta → float seconds, or None."""
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
    except (TypeError, ValueError):
        pass
    return round(float(val.total_seconds()), 4)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def get_sessions_for_race(year: int, round_number: int) -> dict:
    event = fastf1.get_event(year, round_number)
    sessions = []
    for i in range(1, 6):
        col = f"Session{i}"
        if col in event.index and pd.notna(event[col]) and event[col]:
            full_name = str(event[col])
            key = _NAME_TO_KEY.get(full_name, full_name)
            sessions.append({"number": i, "name": full_name, "key": key})

    return {
        "year": year,
        "round": round_number,
        "event_name": str(event["EventName"]),
        "country": str(event["Country"]),
        "location": str(event["Location"]),
        "date": str(event["EventDate"].date()),
        "sessions": sessions,
    }


def get_session_results(year: int, round_number: int, session_key: str) -> dict:
    session = fastf1.get_session(year, round_number, session_key)
    session.load(laps=True, telemetry=False, weather=False, messages=False)

    drivers = []
    for _, row in session.results.iterrows():
        d: dict = {
            "position": int(row["Position"]) if pd.notna(row.get("Position")) else None,
            "driver_number": str(_safe(row.get("DriverNumber")) or ""),
            "abbreviation": str(_safe(row.get("Abbreviation")) or ""),
            "full_name": str(_safe(row.get("FullName")) or ""),
            "team": str(_safe(row.get("TeamName")) or ""),
            "team_color": "#" + str(_safe(row.get("TeamColor")) or "888888"),
        }
        # Qualifying times
        for q in ("Q1", "Q2", "Q3"):
            if q in row.index:
                d[q.lower()] = _td(row[q])
        # Race time / status / points
        if "Time" in row.index:
            d["time"] = _td(row["Time"])
        if "Status" in row.index:
            d["status"] = str(_safe(row["Status"]) or "")
        if "Points" in row.index:
            pts = _safe(row["Points"])
            d["points"] = float(pts) if pts is not None else 0.0
        if "GridPosition" in row.index:
            gp = _safe(row["GridPosition"])
            d["grid_position"] = int(gp) if gp is not None else None

        drivers.append(d)

    # Fastest lap per driver
    fastest: dict = {}
    try:
        valid_laps = session.laps.pick_accurate()
        for drv in valid_laps["Driver"].unique():
            drv_laps = valid_laps[valid_laps["Driver"] == drv]
            if drv_laps.empty:
                continue
            idx = drv_laps["LapTime"].idxmin()
            fl = drv_laps.loc[idx]
            fastest[str(drv)] = {
                "lap_time": _td(fl["LapTime"]),
                "lap_number": int(fl["LapNumber"]),
                "compound": str(_safe(fl.get("Compound")) or ""),
            }
    except Exception:
        pass

    return {
        "session_key": session_key,
        "session_name": _KEY_TO_LABEL.get(session_key, session_key),
        "event_name": str(session.event["EventName"]),
        "year": year,
        "round": round_number,
        "drivers": drivers,
        "fastest_laps": fastest,
    }


def get_laps_for_session(year: int, round_number: int, session_key: str) -> dict:
    session = fastf1.get_session(year, round_number, session_key)
    session.load(laps=True, telemetry=False, weather=False, messages=False)

    by_driver: dict[str, list] = {}
    for _, row in session.laps.iterrows():
        drv = str(_safe(row.get("Driver")) or "")
        if not drv:
            continue
        by_driver.setdefault(drv, []).append({
            "lap_number": int(row["LapNumber"]) if pd.notna(row.get("LapNumber")) else None,
            "lap_time": _td(row.get("LapTime")),
            "sector1": _td(row.get("Sector1Time")),
            "sector2": _td(row.get("Sector2Time")),
            "sector3": _td(row.get("Sector3Time")),
            "compound": str(_safe(row.get("Compound")) or ""),
            "tyre_life": int(row["TyreLife"]) if pd.notna(row.get("TyreLife")) else None,
            "stint": int(row["Stint"]) if pd.notna(row.get("Stint")) else None,
            "is_personal_best": bool(_safe(row.get("IsPersonalBest")) or False),
            "deleted": bool(_safe(row.get("Deleted")) or False),
            "pit_in": row.get("PitInTime") is not None and pd.notna(row.get("PitInTime")),
            "pit_out": row.get("PitOutTime") is not None and pd.notna(row.get("PitOutTime")),
            "track_status": str(_safe(row.get("TrackStatus")) or ""),
            "position": int(row["Position"]) if pd.notna(row.get("Position")) else None,
        })

    return {
        "year": year,
        "round": round_number,
        "session_key": session_key,
        "drivers": [
            {"driver": drv, "laps": sorted(laps, key=lambda l: l["lap_number"] or 0)}
            for drv, laps in by_driver.items()
        ],
    }


def get_telemetry_comparison(
    year: int,
    round_number: int,
    session_key: str,
    drivers: list[str],
    laps: list[str] | None = None,
) -> dict:
    session = fastf1.get_session(year, round_number, session_key)
    session.load(laps=True, telemetry=True, weather=False, messages=False)

    laps = laps or []

    results = []
    ref_curve: tuple[np.ndarray, np.ndarray] | None = None  # (distance, time) of first successful driver

    for i, driver in enumerate(drivers):
        lap = laps[i] if i < len(laps) and laps[i] else "fastest"
        try:
            drv_laps = session.laps.pick_driver(driver)
            if drv_laps.empty:
                continue

            lap_row = drv_laps.pick_fastest() if lap == "fastest" else drv_laps[drv_laps["LapNumber"] == int(lap)].iloc[0]
            tel = lap_row.get_telemetry()
            if tel.empty:
                continue

            # Downsample to 500 evenly-spaced distance points
            d_max = float(tel["Distance"].max())
            dist_grid = np.linspace(0, d_max, 500)
            distance_src = tel["Distance"].astype(float)

            def interp(col: str) -> list:
                vals = np.interp(dist_grid, distance_src, tel[col].astype(float))
                return [round(float(v), 2) for v in vals]

            time_src = tel["Time"].dt.total_seconds().astype(float)
            time_vals = np.interp(dist_grid, distance_src, time_src)
            time_vals = time_vals - time_vals[0]  # seconds elapsed since lap start

            data = {
                "distance": [round(float(d), 1) for d in dist_grid],
                "speed":    interp("Speed"),
                "throttle": interp("Throttle"),
                "brake":    [int(round(v)) for v in np.interp(dist_grid, distance_src, tel["Brake"].astype(float))],
                "gear":     [int(round(v)) for v in np.interp(dist_grid, distance_src, tel["nGear"].astype(float))],
                "drs":      [int(round(v)) for v in np.interp(dist_grid, distance_src, tel["DRS"].astype(float))],
                "time":     [round(float(t), 4) for t in time_vals],
                "x":        interp("X"),
                "y":        interp("Y"),
            }

            if ref_curve is None:
                ref_curve = (dist_grid, time_vals)
            else:
                ref_dist, ref_time = ref_curve
                ref_time_on_grid = np.interp(dist_grid, ref_dist, ref_time)
                data["delta"] = [round(float(d - r), 4) for d, r in zip(time_vals, ref_time_on_grid)]

            results.append({
                "driver": driver,
                "lap_number": int(lap_row["LapNumber"]),
                "lap_time": _td(lap_row["LapTime"]),
                "compound": str(_safe(lap_row.get("Compound")) or ""),
                "data": data,
            })
        except Exception as exc:
            results.append({"driver": driver, "error": str(exc)})

    return {"drivers": results}
