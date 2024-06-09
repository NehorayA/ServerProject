import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';

// Define your encryption key
const encryptionKey = 'v8nq3JfO2gT0R5rDz8XeYk6mT2sW8n1P';

// Encryption middleware function
export const encryptMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = encryptData(req.body);
    }
    next();
};

// Decryption middleware function
export const decryptMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.data) {
        try {
            console.log('Encrypted Body Data:', req.body.data);
            req.body = decryptData(req.body.data);
            console.log('Decrypted Body Data:', req.body);
        } catch (error) {
            console.error('Decryption failed:', error);
            return res.status(400).json({ error: 'Invalid encrypted data' });
        }
    }

    if (req.query && req.query.data) {
        try {
            console.log('Encrypted Query Data:', req.query.data);
            req.query = decryptData(req.query.data);
            console.log('Decrypted Query Data:', req.query);
        } catch (error) {
            console.error('Decryption failed:', error);
            return res.status(400).json({ error: 'Invalid encrypted data' });
        }
    }

    next();
};

export const encryptData = (data: any): any => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
    return encryptedData;
};

const decryptData = (encryptedData: any): any => {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
};
