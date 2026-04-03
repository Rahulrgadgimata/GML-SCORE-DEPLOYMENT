const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'gm_league.db'));

db.transaction(() => {
    db.prepare('DELETE FROM players').run();
    db.prepare('DELETE FROM teams').run();
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM settings').run();
})();

console.log('Database wiped successfully. Restart the app or hit /api/data to re-seed.');
