import fastf1

fastf1.Cache.enable_cache('./cache')


def get_races_for_year(year: int):
    schedule = fastf1.get_event_schedule(year, include_testing=False)
    races = []

    for _, row in schedule.iterrows():
        races.append({
            "RoundNumber": int(row["RoundNumber"]),
            "EventName": row["EventName"],
            "EventDate": str(row["EventDate"].date()),
            "Country": row["Country"],
            "Location": row["Location"]
        })

    return {"season": year, "races": races}
