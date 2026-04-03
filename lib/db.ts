import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { AppData, Team, Match, Player } from './types';
import { defaultData } from './store';

// Allow overriding the DB path for production hosting (like Render's Persistent Disk)
const DB_PATH = process.env.DATABASE_PATH || path.join(os.tmpdir(), 'gm_league_v3.db');

export const db = new Database(DB_PATH);
// Initialize schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sport TEXT NOT NULL,
      gender TEXT NOT NULL,
      color TEXT,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      name TEXT NOT NULL,
      jerseyNumber INTEGER,
      role TEXT,
      FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      sport TEXT NOT NULL,
      teamAId TEXT NOT NULL,
      teamBId TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL,
      venue TEXT,
      round TEXT,
      winnerId TEXT,
      playerOfTheMatch TEXT,
      score TEXT, -- JSON
      playerPerformances TEXT, -- JSON
      createdAt TEXT,
      updatedAt TEXT
    );
  `);

  // Check DB version to force re-seed if we cleaned defaultData
  const CURRENT_VER = 'v5';
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('db_version') as any;
  const dbVer = row ? row.value : null;
  
  if (dbVer !== CURRENT_VER) {
      console.log('--- DB VERSION MISMATCH: FORCE RESETTING ---');
      resetDb();
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('db_version', CURRENT_VER);
  }

  // Ensure admin password is set
  const adminRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('adminPassword') as any;
  if (!adminRow) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('adminPassword', defaultData.adminPassword);
  }
}

export function seedData(data: AppData) {
    const insertSettings = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    insertSettings.run('adminPassword', data.adminPassword);

    const insertTeam = db.prepare(`
        INSERT OR REPLACE INTO teams (id, name, sport, gender, color, wins, losses, draws, points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertPlayer = db.prepare(`
        INSERT OR REPLACE INTO players (id, teamId, name, jerseyNumber, role)
        VALUES (?, ?, ?, ?, ?)
    `);
    const insertMatch = db.prepare(`
        INSERT OR REPLACE INTO matches (id, sport, teamAId, teamBId, status, date, venue, round, winnerId, playerOfTheMatch, score, playerPerformances, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
        // Clear existing data to sync deletions
        db.prepare('DELETE FROM players').run();
        db.prepare('DELETE FROM teams').run();
        db.prepare('DELETE FROM matches').run();

        for (const team of data.teams) {
            insertTeam.run(team.id, team.name, team.sport, team.gender, team.color, team.wins, team.losses, team.draws, team.points);
            for (const player of team.players) {
                insertPlayer.run(player.id, team.id, player.name, player.jerseyNumber || null, player.role || null);
            }
        }
        for (const match of data.matches) {
            insertMatch.run(
                match.id,
                match.sport,
                match.teamAId,
                match.teamBId,
                match.status,
                match.date,
                match.venue,
                match.round,
                match.winnerId || null,
                match.playerOfTheMatch || null,
                JSON.stringify(match.score || null),
                JSON.stringify(match.playerPerformances || []),
                match.createdAt,
                match.updatedAt
            );
        }
    })();
}

export function resetDb() {
    db.transaction(() => {
        db.prepare('DELETE FROM players').run();
        db.prepare('DELETE FROM teams').run();
        db.prepare('DELETE FROM matches').run();
        db.prepare('DELETE FROM settings').run();
    })();
    seedData(defaultData);
}

export function clearDb() {
    db.transaction(() => {
        db.prepare('DELETE FROM players').run();
        db.prepare('DELETE FROM teams').run();
        db.prepare('DELETE FROM matches').run();
    })();
}

export function getAllData(): AppData {
    const teamsRows = db.prepare('SELECT * FROM teams').all() as any[];
    const playersRows = db.prepare('SELECT * FROM players').all() as any[];
    const matchesRows = db.prepare('SELECT * FROM matches').all() as any[];
    const adminPassword = (db.prepare('SELECT value FROM settings WHERE key = ?').get('adminPassword') as any)?.value || 'gmleague2025';

    const teams: Team[] = teamsRows.map(t => ({
        ...t,
        players: playersRows.filter(p => p.teamId === t.id).map(p => ({
            id: p.id,
            name: p.name,
            jerseyNumber: p.jerseyNumber,
            role: p.role
        }))
    }));

    const matches: Match[] = matchesRows.map(m => ({
        ...m,
        score: JSON.parse(m.score || 'null'),
        playerPerformances: JSON.parse(m.playerPerformances || '[]'),
    }));

    return {
        teams,
        matches,
        adminPassword
    };
}

// Initialization on load
initDb();
