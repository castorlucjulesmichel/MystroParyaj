import app from "./worker.js";

async function addColumn(db, table, definition) {
  try {
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${definition}`).run();
  } catch (e) {
    const m = String(e?.message || "").toLowerCase();
    if (!m.includes("duplicate column") && !m.includes("already exists")) throw e;
  }
}

async function migrate(db) {
  if (!db) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tx(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT,
    type TEXT,
    amount REAL,
    currency TEXT,
    status TEXT,
    reference TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`).run();

  for (const def of [
    "uid TEXT",
    "type TEXT",
    "amount REAL DEFAULT 0",
    "currency TEXT DEFAULT 'HTG'",
    "status TEXT DEFAULT 'pending'",
    "reference TEXT",
    "created_at TEXT"
  ]) await addColumn(db, "tx", def);
}

export default {
  async fetch(req, env, ctx) {
    try {
      await migrate(env.DB);
      return await app.fetch(req, env, ctx);
    } catch (e) {
      const raw = Number(e?.status);
      const status = Number.isInteger(raw) && raw >= 400 && raw <= 599 ? raw : 500;
      return new Response(JSON.stringify({ error: e?.message || "Server error" }), {
        status,
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "https://castorlucjulesmichel.github.io",
          "access-control-allow-headers": "Authorization,Content-Type,X-Admin-Session",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "cache-control": "no-store"
        }
      });
    }
  }
};