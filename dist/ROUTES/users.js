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
const usersRouter = (0, express_1.Router)();
usersRouter.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)(row);
                return res.json({ data: encryptedRow });
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
usersRouter.put('/users/:username', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { email, password, name, familyName, location, website, bio } = req.body;
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        const stmt = db.prepare('UPDATE users SET email = ?, password = ?, name = ?, familyName = ?, location = ?, website = ?, bio = ? WHERE username = ?');
        stmt.run(email, password, name, familyName, location, website, bio, username, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update user' });
            }
            else {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'User updated successfully' });
                return res.json({ data: encryptedRow });
            }
            stmt.finalize();
            db.close();
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
usersRouter.get('/users/password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT password FROM users WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ password: row.password });
                return res.json({ data: encryptedRow });
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
usersRouter.put('/users/:username/password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { newPassword } = req.body;
    if (!username || !newPassword) {
        return res.status(400).json({ error: 'Username and newPassword parameters are required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.run('UPDATE users SET password = ? WHERE username = ?', [newPassword, username], function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update password' });
            }
            else {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Password updated successfully' });
                res.json({ data: encryptedRow });
            }
            db.close();
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
usersRouter.put('/users/:username/avatar', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const { avatar } = req.body;
    console.log(avatar);
    if (!avatar) {
        return res.status(400).json({ error: 'Avatar data is missing in the request body' });
    }
    // Convert base64-encoded image data to binary
    const binaryImageData = Buffer.from(avatar, 'base64');
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        const stmt = db.prepare('UPDATE users SET profileImage = ? WHERE username = ?');
        stmt.run(binaryImageData, username, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update profile image' });
            }
            else {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Profile image updated successfully' });
                res.json({ data: encryptedRow });
            }
            stmt.finalize();
            db.close();
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
usersRouter.get('/userStats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT * FROM UserStats WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)(row);
                return res.json({ data: encryptedRow });
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = usersRouter;
