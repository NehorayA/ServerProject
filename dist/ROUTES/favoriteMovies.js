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
const favoriteMoviesRouter = (0, express_1.Router)();
favoriteMoviesRouter.post('/users/:username/addFavoriteMovie', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { movieId, index } = req.body;
    if (!username || !movieId || typeof index !== 'number') {
        return res.status(400).json({ error: 'Username, movieId, and index parameters are required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT favoriteMovies FROM UserData WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                let favoriteMovies = row.favoriteMovies ? row.favoriteMovies.split(',') : [];
                if (favoriteMovies.includes(String(movieId))) {
                    return res.status(400).json({ error: 'Movie is already in the favorite list' });
                }
                if (index < 4) {
                    for (let i = 3; i > index; i--) {
                        favoriteMovies[i] = favoriteMovies[i - 1];
                    }
                }
                favoriteMovies[index] = movieId; // Place the new movie at the specified index
                yield db.run('UPDATE UserData SET favoriteMovies = ? WHERE username = ?', [favoriteMovies.join(','), username]);
                db.close();
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Movie added to favorite list successfully' });
                return res.json({ data: encryptedRow });
            }
            else {
                return res.status(404).json({ error: 'User not found' });
            }
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
favoriteMoviesRouter.post('/users/:username/removeFavoriteMovie', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { movieId } = req.body;
    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT favoriteMovies FROM UserData WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                let favoriteMovies = row.favoriteMovies ? row.favoriteMovies.split(',') : [];
                const movieIndex = favoriteMovies.indexOf(String(movieId));
                if (movieIndex === -1) {
                    return res.status(400).json({ error: 'Movie is not in the favorite list' });
                }
                favoriteMovies[movieIndex] = '0'; // Replace the movie ID with an empty string
                yield db.run('UPDATE UserData SET favoriteMovies = ? WHERE username = ?', [favoriteMovies.join(','), username]);
                db.close();
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Movie removed from favorite list successfully' });
                return res.json({ data: encryptedRow });
            }
            else {
                return res.status(404).json({ error: 'User not found' });
            }
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
favoriteMoviesRouter.get('/users/:username/favoriteMovies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT favoriteMovies FROM UserData WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                const favoriteMovies = row.favoriteMovies ? row.favoriteMovies.split(',') : [];
                db.close();
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ favoriteMovies });
                return res.json({ data: encryptedRow });
            }
            else {
                return res.status(404).json({ error: 'User not found' });
            }
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = favoriteMoviesRouter;
