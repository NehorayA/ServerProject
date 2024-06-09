import { Router, Request, Response } from 'express';
import { openDbConnection, createTables } from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';


const connectionRouter = Router();

connectionRouter.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        username.incl
        const db = await openDbConnection();
        await createTables(db);
        db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const encryptedRow = encryptData({ message: 'Login successful'});
                res.json({data: encryptedRow});
            } else {
                const encryptedRow = encryptData({ message: 'User is not exist'});
                res.json({data: encryptedRow});
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

connectionRouter.post('/Sign-up', async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    try {
        const db = await openDbConnection();
        await createTables(db);
        db.run('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, password], function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to sign up' });
            } else {
                db.run('INSERT INTO UserStats (userId, userName) VALUES (?, ?)', [this.lastID, username]);
                db.run('INSERT INTO UserData (userId, userName) VALUES (?, ?)', [this.lastID, username]);
                res.json({ message: 'Signup successful' });
            }
            db.close();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default connectionRouter;
