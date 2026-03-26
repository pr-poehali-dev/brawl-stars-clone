"""
Матчмейкинг: регистрация игрока, поиск противника, создание матча.
POST / — join queue (body: {player_name, character_id})
GET /?player_id=xxx — проверить статус поиска
"""
import json
import os
import random
import psycopg2

SCHEMA = "t_p82308312_brawl_stars_clone"

CHARACTERS = {
    1: {"name": "ТАЙФУН", "hp": 2800},
    2: {"name": "ВЕКТОР", "hp": 1800},
    3: {"name": "ТЕНЬ", "hp": 1600},
    4: {"name": "ГОЛИАФ", "hp": 4200},
    5: {"name": "ФЕНИКС", "hp": 2200},
    6: {"name": "РАПИРА", "hp": 1900},
}

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            player_name = (body.get("player_name") or "Игрок").strip()[:30]
            character_id = int(body.get("character_id", 1))
            char = CHARACTERS.get(character_id, CHARACTERS[1])

            # Создаём или находим игрока
            cur.execute(
                f"SELECT id FROM {SCHEMA}.players WHERE name = %s LIMIT 1",
                (player_name,)
            )
            row = cur.fetchone()
            if row:
                player_id = str(row[0])
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.players (name) VALUES (%s) RETURNING id",
                    (player_name,)
                )
                player_id = str(cur.fetchone()[0])

            # Ищем ожидающий матч от другого игрока
            cur.execute(
                f"""SELECT id, player1_id FROM {SCHEMA}.matches
                    WHERE status = 'waiting' AND player1_id != %s::uuid
                    ORDER BY created_at ASC LIMIT 1""",
                (player_id,)
            )
            waiting = cur.fetchone()

            if waiting:
                match_id = str(waiting[0])
                p1_id = str(waiting[1])
                p1_char_id = int(body.get("opponent_char_id", random.randint(1, 6)))

                p1_char = CHARACTERS.get(p1_char_id, CHARACTERS[2])

                cur.execute(
                    f"""UPDATE {SCHEMA}.matches SET
                        player2_id = %s::uuid,
                        player2_character = %s,
                        player2_hp = %s,
                        player2_hp_max = %s,
                        current_turn = %s::uuid,
                        status = 'active',
                        updated_at = now()
                        WHERE id = %s::uuid""",
                    (player_id, char["name"], char["hp"], char["hp"], p1_id, match_id)
                )
                conn.commit()
                return {
                    "statusCode": 200,
                    "headers": CORS,
                    "body": json.dumps({
                        "match_id": match_id,
                        "player_id": player_id,
                        "player_number": 2,
                        "status": "active"
                    })
                }
            else:
                # Создаём новый матч и ждём
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.matches
                        (player1_id, player1_character, player1_hp, player1_hp_max, status)
                        VALUES (%s::uuid, %s, %s, %s, 'waiting')
                        RETURNING id""",
                    (player_id, char["name"], char["hp"], char["hp"])
                )
                match_id = str(cur.fetchone()[0])
                conn.commit()
                return {
                    "statusCode": 200,
                    "headers": CORS,
                    "body": json.dumps({
                        "match_id": match_id,
                        "player_id": player_id,
                        "player_number": 1,
                        "status": "waiting"
                    })
                }

        elif method == "GET":
            params = event.get("queryStringParameters") or {}
            player_id = params.get("player_id", "")
            match_id = params.get("match_id", "")

            if match_id:
                cur.execute(
                    f"""SELECT id, player1_id, player2_id, player1_character, player2_character,
                               player1_hp, player2_hp, player1_hp_max, player2_hp_max,
                               current_turn, status, winner_id, turn_count
                        FROM {SCHEMA}.matches WHERE id = %s::uuid""",
                    (match_id,)
                )
            elif player_id:
                cur.execute(
                    f"""SELECT id, player1_id, player2_id, player1_character, player2_character,
                               player1_hp, player2_hp, player1_hp_max, player2_hp_max,
                               current_turn, status, winner_id, turn_count
                        FROM {SCHEMA}.matches
                        WHERE (player1_id = %s::uuid OR player2_id = %s::uuid)
                          AND status IN ('waiting', 'active')
                        ORDER BY created_at DESC LIMIT 1""",
                    (player_id, player_id)
                )
            else:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "need match_id or player_id"})}

            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}

            match = {
                "match_id": str(row[0]),
                "player1_id": str(row[1]) if row[1] else None,
                "player2_id": str(row[2]) if row[2] else None,
                "player1_character": row[3],
                "player2_character": row[4],
                "player1_hp": row[5],
                "player2_hp": row[6],
                "player1_hp_max": row[7],
                "player2_hp_max": row[8],
                "current_turn": str(row[9]) if row[9] else None,
                "status": row[10],
                "winner_id": str(row[11]) if row[11] else None,
                "turn_count": row[12],
            }

            # Лог действий
            cur.execute(
                f"""SELECT p.name, a.action, a.damage, a.heal, a.description, a.created_at
                    FROM {SCHEMA}.battle_actions a
                    JOIN {SCHEMA}.players p ON p.id = a.player_id
                    WHERE a.match_id = %s::uuid
                    ORDER BY a.created_at DESC LIMIT 20""",
                (str(row[0]),)
            )
            actions = []
            for r in cur.fetchall():
                actions.append({
                    "player_name": r[0],
                    "action": r[1],
                    "damage": r[2],
                    "heal": r[3],
                    "description": r[4],
                    "time": r[5].strftime("%H:%M:%S") if r[5] else ""
                })
            match["actions"] = actions

            return {"statusCode": 200, "headers": CORS, "body": json.dumps(match)}

    finally:
        cur.close()
        conn.close()
