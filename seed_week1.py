#!/usr/bin/env python3
"""Seed the performance coach DB with the first week's training plan."""

import sqlite3
from datetime import date, datetime

DB = "/home/infinitespark2/Performance-Coach/data/performance.db"
ATHLETES = ["tristan", "kennedy"]

# ── Week 1: May 11 - May 17 ──
# Mon=Speed, Tue=Rest, Wed=Strength, Thu=Rest, Fri=Mixed, Sat=Match, Sun=Recovery

SESSIONS = [
    {
        "id": "w1_mon",
        "date_label": "Monday, May 11",
        "date": "2026-05-11",
        "blocks": [
            {
                "name": "ATG Warm-up",
                "duration": "12 min",
                "tag": "Coach-led",
                "accent": None,
                "sort_order": 0,
                "exercises": [
                    ("Tibialis raises", "2 × 25", 0),
                    ("KOT calf raises", "2 × 10/side", 1),
                    ("ATG split squat", "2 × 5/side · BW", 2),
                    ("Couch stretch", "60s/side", 3),
                ],
            },
            {
                "name": "Speed Block",
                "duration": "28 min",
                "tag": "On-field",
                "accent": "speed",
                "sort_order": 1,
                "exercises": [
                    ("20m acceleration", "3 sets · rest 90s", 0),
                    ("30m fly-in", "3 sets · rest 2 min", 1),
                    ("Pro-agility shuttle", "4 sets · rest 60s", 2),
                ],
            },
        ],
    },
    {
        "id": "w1_wed",
        "date_label": "Wednesday, May 13",
        "date": "2026-05-13",
        "blocks": [
            {
                "name": "ATG Warm-up",
                "duration": "12 min",
                "tag": "Coach-led",
                "accent": None,
                "sort_order": 0,
                "exercises": [
                    ("Tibialis raises", "2 × 25", 0),
                    ("KOT calf raises", "2 × 10/side", 1),
                    ("ATG split squat", "2 × 5/side · BW", 2),
                    ("Couch stretch", "60s/side", 3),
                ],
            },
            {
                "name": "Strength Block",
                "duration": "35 min",
                "tag": "Weight room",
                "accent": "strength",
                "sort_order": 1,
                "exercises": [
                    ("Front squat", "3 × 5 @ RPE 7", 0),
                    ("Bulgarian split squat", "3 × 8/side", 1),
                    ("Nordic curl", "3 × 6", 2),
                    ("Hanging leg raise", "3 × 10", 3),
                ],
            },
        ],
    },
    {
        "id": "w1_fri",
        "date_label": "Friday, May 15",
        "date": "2026-05-15",
        "blocks": [
            {
                "name": "ATG Warm-up",
                "duration": "12 min",
                "tag": "Coach-led",
                "accent": None,
                "sort_order": 0,
                "exercises": [
                    ("Tibialis raises", "2 × 25", 0),
                    ("KOT calf raises", "2 × 10/side", 1),
                    ("ATG split squat", "2 × 5/side · BW", 2),
                    ("Couch stretch", "60s/side", 3),
                ],
            },
            {
                "name": "Speed Block",
                "duration": "20 min",
                "tag": "On-field",
                "accent": "speed",
                "sort_order": 1,
                "exercises": [
                    ("20m acceleration", "2 sets · rest 90s", 0),
                    ("30m fly-in", "2 sets · rest 2 min", 1),
                    ("Pro-agility shuttle", "3 sets · rest 60s", 2),
                ],
            },
            {
                "name": "Strength Block",
                "duration": "25 min",
                "tag": "Weight room",
                "accent": "strength",
                "sort_order": 2,
                "exercises": [
                    ("Front squat", "3 × 5 @ RPE 6", 0),
                    ("Nordic curl", "2 × 6", 1),
                    ("Hanging leg raise", "2 × 10", 2),
                ],
            },
        ],
    },
]

def seed():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    # Clear existing session data
    cur.execute("DELETE FROM exercise")
    cur.execute("DELETE FROM block")
    cur.execute("DELETE FROM session")

    for ses in SESSIONS:
        cur.execute(
            "INSERT INTO session (id, date_label, date) VALUES (?, ?, ?)",
            (ses["id"], ses["date_label"], ses["date"]),
        )
        for block in ses["blocks"]:
            cur.execute(
                "INSERT INTO block (session_id, name, duration, status, tag, accent, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (ses["id"], block["name"], block["duration"], "queued", block["tag"], block["accent"], block["sort_order"]),
            )
            block_id = cur.lastrowid
            for ex_name, ex_detail, sort in block["exercises"]:
                cur.execute(
                    "INSERT INTO exercise (block_id, name, detail, sort_order) VALUES (?, ?, ?, ?)",
                    (block_id, ex_name, ex_detail, sort),
                )

    conn.commit()

    # Verify
    sessions = cur.execute("SELECT id, date_label, date FROM session ORDER BY date").fetchall()
    print(f"✅ {len(sessions)} sessions created:")
    for s in sessions:
        blocks = cur.execute("SELECT id, name FROM block WHERE session_id = ?", (s[0],)).fetchall()
        total_ex = sum(
            cur.execute("SELECT COUNT(*) FROM exercise WHERE block_id = ?", (b[0],)).fetchone()[0]
            for b in blocks
        )
        print(f"   {s[0]} ({s[1]}) — {len(blocks)} blocks, {total_ex} exercises")

    conn.close()
    print("Done.")

if __name__ == "__main__":
    seed()
