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
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.send('hello from express and typescript');
});
router.get('/logs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    try {
        const db = yield (0, db_1.openDbConnection)();
        yield (0, db_1.createTables)(db);
        db.all('SELECT * FROM logs WHERE username = ? ORDER BY timestamp DESC', [username], (err, rows) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            }
            else {
                const encryptedRow = (0, encryptionMiddleware_1.encryptData)(rows);
                return res.json({ data: encryptedRow });
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
