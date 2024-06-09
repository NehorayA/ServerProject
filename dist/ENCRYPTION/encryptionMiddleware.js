"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = exports.decryptMiddleware = exports.encryptMiddleware = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
// Define your encryption key
const encryptionKey = 'v8nq3JfO2gT0R5rDz8XeYk6mT2sW8n1P';
// Encryption middleware function
const encryptMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = (0, exports.encryptData)(req.body);
    }
    next();
};
exports.encryptMiddleware = encryptMiddleware;
// Decryption middleware function
const decryptMiddleware = (req, res, next) => {
    if (req.body && req.body.data) {
        try {
            console.log('Encrypted Body Data:', req.body.data);
            req.body = decryptData(req.body.data);
            console.log('Decrypted Body Data:', req.body);
        }
        catch (error) {
            console.error('Decryption failed:', error);
            return res.status(400).json({ error: 'Invalid encrypted data' });
        }
    }
    if (req.query && req.query.data) {
        try {
            console.log('Encrypted Query Data:', req.query.data);
            req.query = decryptData(req.query.data);
            console.log('Decrypted Query Data:', req.query);
        }
        catch (error) {
            console.error('Decryption failed:', error);
            return res.status(400).json({ error: 'Invalid encrypted data' });
        }
    }
    next();
};
exports.decryptMiddleware = decryptMiddleware;
const encryptData = (data) => {
    const encryptedData = crypto_js_1.default.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
    return encryptedData;
};
exports.encryptData = encryptData;
const decryptData = (encryptedData) => {
    const decryptedBytes = crypto_js_1.default.AES.decrypt(encryptedData, encryptionKey);
    const decryptedData = decryptedBytes.toString(crypto_js_1.default.enc.Utf8);
    return JSON.parse(decryptedData);
};
