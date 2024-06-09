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
const connectionRouter = (0, express_1.Router)();
connectionRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        username.incl;
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
            else if (row) {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'Login successful' });
                res.json({ data: encryptedRow });
            }
            else {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)({ message: 'User is not exist' });
                res.json({ data: encryptedRow });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
connectionRouter.post('/Sign-up', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, password], function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to sign up' });
            }
            else {
                db.run('INSERT INTO UserStats (userId, userName) VALUES (?, ?)', [this.lastID, username]);
                db.run('INSERT INTO UserData (userId, userName) VALUES (?, ?)', [this.lastID, username]);
                res.json({ message: 'Signup successful' });
            }
            db.close();
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = connectionRouter;
