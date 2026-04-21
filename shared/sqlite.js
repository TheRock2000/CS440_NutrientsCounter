const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function openDatabase(filename, schema) {
  fs.mkdirSync(path.dirname(filename), { recursive: true });

  const db = await new Promise((resolve, reject) => {
    const connection = new sqlite3.Database(filename, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(connection);
    });
  });

  db.configure('busyTimeout', 5000);

  if (schema) {
    await exec(db, schema);
  }

  return db;
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row || null);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

module.exports = {
  all,
  exec,
  get,
  openDatabase,
  run
};
