"""
Таблица лидеров из реальной БД.
GET / — топ игроков
GET /?player_id=xxx — позиция конкретного игрока
"""
import json
import os
import psycopg2

SCHEMA = "t_p82308312_brawl_stars_clone"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    player_id = params.get("player_id", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute(
            f"""SELECT id, name, trophies, wins, losses, level,
                       CASE WHEN wins + losses > 0
                            THEN ROUND(wins * 100.0 / (wins + losses))
                            ELSE 0 END as winrate
                FROM {SCHEMA}.players
                ORDER BY trophies DESC
                LIMIT 50"""
        )
        rows = cur.fetchall()

        leaders = []
        my_rank = None
        for i, r in enumerate(rows):
            entry = {
                "rank": i + 1,
                "id": str(r[0]),
                "name": r[1],
                "trophies": r[2],
                "wins": r[3],
                "losses": r[4],
                "level": r[5],
                "winrate": int(r[6]),
                "is_me": str(r[0]) == player_id,
            }
            leaders.append(entry)
            if str(r[0]) == player_id:
                my_rank = i + 1

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "leaders": leaders,
                "my_rank": my_rank,
                "total": len(rows),
            })
        }

    finally:
        cur.close()
        conn.close()
