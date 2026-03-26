"""
Выполнение боевых действий в матче.
POST / — action (body: {match_id, player_id, action: 'attack'|'ability'|'ultimate'|'defend'})
"""
import json
import os
import random
import psycopg2

SCHEMA = "t_p82308312_brawl_stars_clone"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

ACTIONS_CONFIG = {
    "attack":   {"dmg_min": 100, "dmg_max": 200, "heal": 0, "label": "⚔️ Атака"},
    "defend":   {"dmg_min": 0,   "dmg_max": 0,   "heal_min": 80, "heal_max": 150, "label": "🛡️ Защита"},
    "ability":  {"dmg_min": 200, "dmg_max": 350, "heal": 0, "label": "✨ Способность"},
    "ultimate": {"dmg_min": 400, "dmg_max": 700, "heal": 0, "label": "💥 УЛЬТА"},
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    match_id = body.get("match_id", "")
    player_id = body.get("player_id", "")
    action = body.get("action", "attack")

    if action not in ACTIONS_CONFIG:
        action = "attack"

    conn = get_conn()
    cur = conn.cursor()

    try:
        # Читаем матч
        cur.execute(
            f"""SELECT id, player1_id, player2_id, player1_hp, player2_hp,
                       player1_hp_max, player2_hp_max, current_turn, status
                FROM {SCHEMA}.matches WHERE id = %s::uuid""",
            (match_id,)
        )
        row = cur.fetchone()
        if not row:
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "match not found"})}

        p1_id = str(row[1])
        p2_id = str(row[2]) if row[2] else None
        p1_hp = row[3]
        p2_hp = row[4]
        p1_hp_max = row[5]
        p2_hp_max = row[6]
        current_turn = str(row[7]) if row[7] else None
        status = row[8]

        if status != "active":
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "match not active"})}

        if current_turn != player_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "not your turn"})}

        cfg = ACTIONS_CONFIG[action]
        is_player1 = (player_id == p1_id)
        opponent_id = p2_id if is_player1 else p1_id

        damage = 0
        heal = 0

        if action == "defend":
            heal = random.randint(cfg["heal_min"], cfg["heal_max"])
            if is_player1:
                p1_hp = min(p1_hp_max, p1_hp + heal)
            else:
                p2_hp = min(p2_hp_max, p2_hp + heal)
            desc = f"{cfg['label']}: восстановлено {heal} HP"
        else:
            damage = random.randint(cfg["dmg_min"], cfg["dmg_max"])
            if is_player1:
                p2_hp = max(0, p2_hp - damage)
            else:
                p1_hp = max(0, p1_hp - damage)
            desc = f"{cfg['label']}: нанесено {damage} урона"

        # Проверяем победителя
        winner_id = None
        new_status = "active"
        if p1_hp <= 0:
            winner_id = p2_id
            new_status = "finished"
        elif p2_hp <= 0:
            winner_id = p1_id
            new_status = "finished"

        # Обновляем матч
        cur.execute(
            f"""UPDATE {SCHEMA}.matches SET
                player1_hp = %s, player2_hp = %s,
                current_turn = %s::uuid,
                status = %s,
                winner_id = %s,
                turn_count = turn_count + 1,
                updated_at = now()
                WHERE id = %s::uuid""",
            (p1_hp, p2_hp, opponent_id if new_status == "active" else None,
             new_status, winner_id, match_id)
        )

        # Логируем действие
        cur.execute(
            f"""INSERT INTO {SCHEMA}.battle_actions
                (match_id, player_id, action, damage, heal, description)
                VALUES (%s::uuid, %s::uuid, %s, %s, %s, %s)""",
            (match_id, player_id, action, damage, heal, desc)
        )

        # Обновляем статистику при завершении
        if new_status == "finished" and winner_id:
            loser_id = p1_id if winner_id == p2_id else p2_id
            trophy_win = random.randint(80, 200)
            trophy_lose = random.randint(30, 100)
            xp_win = random.randint(200, 500)
            xp_lose = random.randint(50, 100)
            coins_win = random.randint(100, 200)
            coins_lose = random.randint(20, 50)

            cur.execute(
                f"""UPDATE {SCHEMA}.players SET
                    wins = wins + 1,
                    trophies = trophies + %s,
                    xp = xp + %s,
                    coins = coins + %s
                    WHERE id = %s::uuid""",
                (trophy_win, xp_win, coins_win, winner_id)
            )
            cur.execute(
                f"""UPDATE {SCHEMA}.players SET
                    losses = losses + 1,
                    trophies = GREATEST(0, trophies - %s),
                    xp = xp + %s,
                    coins = coins + %s
                    WHERE id = %s::uuid""",
                (trophy_lose, xp_lose, coins_lose, loser_id)
            )

        conn.commit()

        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "player1_hp": p1_hp,
                "player2_hp": p2_hp,
                "player1_hp_max": p1_hp_max,
                "player2_hp_max": p2_hp_max,
                "damage": damage,
                "heal": heal,
                "description": desc,
                "current_turn": opponent_id if new_status == "active" else None,
                "status": new_status,
                "winner_id": str(winner_id) if winner_id else None,
            })
        }

    finally:
        cur.close()
        conn.close()
