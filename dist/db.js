"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = exports.createTables = exports.openDbConnection = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const openDbConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    return new sqlite3_1.default.Database('./database.db', sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE);
});
exports.openDbConnection = openDbConnection;
const runQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
const createTables = (db) => __awaiter(void 0, void 0, void 0, function* () {
    yield runQuery(db, `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            username TEXT,
            password TEXT,
            name TEXT,
            familyName TEXT,
            location TEXT,
            website TEXT,
            bio TEXT,
            profileImage BLOB 
        )
    `);
    yield runQuery(db, `
        CREATE TABLE IF NOT EXISTS UserStats (
            userId INTEGER PRIMARY KEY,
            username TEXT,
            moviesWatched INTEGER DEFAULT 0,
            watchList INTEGER DEFAULT 0,
            lists INTEGER DEFAULT 0
        )
    `);
    yield runQuery(db, `
        CREATE TABLE IF NOT EXISTS UserData (
            userId INTEGER PRIMARY KEY,
            username TEXT,
            moviesWatched TEXT,
            watchList TEXT,
            lists TEXT,
            favoriteMovies TEXT
        )
    `);
    yield runQuery(db, `
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            data TEXT
        )
    `);
});
exports.createTables = createTables;
const logAction = (db, username, action, data = '') => __awaiter(void 0, void 0, void 0, function* () {
    return runQuery(db, 'INSERT INTO logs (username, action, data) VALUES (?, ?, ?)', [username, action, data]);
});
exports.logAction = logAction;
