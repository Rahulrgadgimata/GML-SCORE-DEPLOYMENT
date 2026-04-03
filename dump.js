const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'gm_league.db'));

const teams = db.prepare('SELECT * FROM teams').all();
const matches = db.prepare('SELECT * FROM matches').all();
const players = db.prepare('SELECT * FROM players').all();

console.log('--- DB DUMP ---');
console.log('Teams:', teams.length);
console.log('Matches:', matches.length);
console.log('Players:', players.length);
console.log('--- First Team ---');
console.log(teams[0]);
console.log('--- First Match ---');
console.log(matches[0]);
