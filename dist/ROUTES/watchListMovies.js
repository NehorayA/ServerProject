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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../DB/db");
const encryptionMiddleware_1 = require("../ENCRYPTION/encryptionMiddleware");
const watchListMoviesRouter = (0, express_1.Router)();
watchListMoviesRouter.post('/users/:username/moviesWatchlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { movieId } = req.body;
    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        // Check if the movie is already in the watchlist
        db.get('SELECT watchList FROM UserData WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                const watchList = row.watchList ? row.watchList.split(',') : [];
                if (watchList.includes(String(movieId))) {
                    const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Movie is already in the watchlist' });
                    return res.status(200).json({ data: encryptedRow });
                }
                else {
                    // Check if the movie is already in the watched movies list
                    db.get('SELECT moviesWatched FROM UserData WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }
                        else if (row) {
                            const moviesWatched = row.moviesWatched ? row.moviesWatched.split(',') : [];
                            if (moviesWatched.some(movie => {
                                const [id, _] = movie.split(':');
                                return id === String(movieId);
                            })) {
                                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Movie is already in the watched list' });
                                return res.status(200).json({ data: encryptedRow });
                            }
                            else {
                                // Update UserData table to insert the movie into the watchlist
                                watchList.push(movieId);
                                yield db.run('UPDATE UserData SET watchList = ? WHERE username = ?', [watchList.join(','), username]);
                                // Update UserStats table
                                db.run('UPDATE UserStats SET watchList = watchList + 1 WHERE username = ?', [username], function (err) {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        db.close();
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).json({ error: 'Internal server error' });
                                        }
                                        else {
                                            yield (0, db_1.logAction)(db, username, 'add_watchlist', `added ${movieId} to your watchlist`);
                                            const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Movie added to watchlist and stats updated successfully' });
                                            return res.json({ data: encryptedRow });
                                        }
                                    });
                                });
                            }
                        }
                        else {
                            return res.status(404).json({ error: 'User not found or no movies watched yet' });
                        }
                    }));
                }
            }
            else {
                return res.status(404).json({ error: 'User not found or no movies watched yet' });
            }
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
watchListMoviesRouter.get('/users/:username/moviesWatchlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT watchList FROM UserData WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
            else if (row && row.watchList) {
                const watchList = row.watchList.split(',');
                if (watchList.length === 0) {
                    const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Watchlist is empty' });
                    return res.json({ data: encryptedRow });
                }
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ username, watchList });
                res.json({ data: encryptedRow });
            }
            else if (!row) {
                res.status(404).json({ error: 'User not found or watchlist is empty' });
            }
            else if (!row.watchList) {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Watchlist is empty' });
                return res.json({ data: encryptedRow });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
watchListMoviesRouter.post('/users/:username/removeMoviesWatchlist', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { movieId } = req.body;
    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT watchList FROM UserData WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                let watchList = row.watchList ? row.watchList.split(',') : [];
                if (!watchList.includes(String(movieId))) {
                    const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ error: 'Movie is not in the watch list' });
                    res.status(400).json({ data: encryptedRow });
                }
                watchList = watchList.filter(id => String(id) !== String(movieId));
                yield db.run('UPDATE UserData SET watchList = ? WHERE username = ?', [watchList.join(','), username]);
                db.run('UPDATE UserStats SET watchList = watchList - 1 WHERE username = ?', [username], function (err) {
                    if (err) {
                        console.error(err);
                        db.close();
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    else {
                        // Delete the log entry
                        db.run('DELETE FROM logs WHERE username = ? AND action = ? AND data LIKE ?', [username, 'add_watchlist', `%${movieId}%`], function (err) {
                            db.close();
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Internal server error' });
                            }
                            else {
                                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Movie removed from watch list, stats updated, and log entry deleted successfully' });
                                return res.json({ data: encryptedRow });
                            }
                        });
                    }
                });
            }
            else {
                return res.status(404).json({ error: 'User not found or no movies watch yet' });
            }
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = watchListMoviesRouter;
