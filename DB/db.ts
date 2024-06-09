import sqlite3 from 'sqlite3';

export const openDbConnection = async (): Promise<sqlite3.Database> => {
    return new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
};

const runQuery = (db: sqlite3.Database, query: string, params: any[] = []): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export const createTables = async (db: sqlite3.Database) => {
    await runQuery(db, `
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

    await runQuery(db, `
        CREATE TABLE IF NOT EXISTS UserStats (
            userId INTEGER PRIMARY KEY,
            username TEXT,
            moviesWatched INTEGER DEFAULT 0,
            watchList INTEGER DEFAULT 0,
            lists INTEGER DEFAULT 0
        )
    `);

    await runQuery(db, `
        CREATE TABLE IF NOT EXISTS UserData (
            userId INTEGER PRIMARY KEY,
            username TEXT,
            moviesWatched TEXT,
            watchList TEXT,
            favoriteMovies TEXT DEFAULT '0,0,0,0'
        )
    `);

    await runQuery(db, `
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            data TEXT
        )
    `);

    await runQuery(db, `
        CREATE TABLE IF NOT EXISTS UserLists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            username TEXT,
            listName TEXT,
            description TEXT,
            movies TEXT DEFAULT '',
            public BOOLEAN DEFAULT FALSE,
            FOREIGN KEY(userId) REFERENCES users(id)
        )
    `);
};

export const logAction = async (db: sqlite3.Database, username: string, action: string, data: string = ''): Promise<void> => {
    return runQuery(db, 'INSERT INTO logs (username, action, data) VALUES (?, ?, ?)', [username, action, data]);
};
