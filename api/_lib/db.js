const { createClient } = require('@libsql/client');

let db;

function getDb() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

async function query(sql, args = []) {
  const result = await getDb().execute({ sql, args });
  return result.rows;
}

async function execute(sql, args = []) {
  const result = await getDb().execute({ sql, args });
  return result;
}

module.exports = { getDb, query, execute };
