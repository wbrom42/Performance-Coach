#!/usr/bin/env python3
"""Seed check-in data for the current week so the dashboard has real data."""

import sqlite3
from datetime import date

DB = "/home/infinitespark2/Performance-Coach/data/performance.db"

CHECKINS = [
    # Tristan — Mon May 11
    ("tristan", "2026-05-11", 4, 4, 4, 5, "Ready for speed day"),
    # Tristan — Tue May 12 (today)
    ("tristan", "2026-05-12", 3, 3, 4, 4, "Rest day, legs feel good"),
    # Kennedy — Mon May 11
    ("kennedy", "2026-05-11", 4, 3, 5, 4, "Felt strong in warm-up"),
    # Kennedy — Tue May 12 (today)
    ("kennedy", "2026-05-12", 3, 2, 4, 3, "Tired from school, rest tonight"),
]

def seed():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    for athlete_id, checkin_date, energy, sleep, soreness, motivation, note in CHECKINS:
        cur.execute(
            "INSERT OR REPLACE INTO checkin (athlete_id, date, time, energy, sleep, soreness, motivation, note) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?)",
            (athlete_id, checkin_date, energy, sleep, soreness, motivation, note),
        )

    conn.commit()
    count = cur.execute("SELECT COUNT(*) FROM checkin").fetchone()[0]
    print(f"✅ {count} total check-ins in DB")
    conn.close()

if __name__ == "__main__":
    seed()
