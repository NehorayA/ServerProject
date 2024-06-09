import { Router } from 'express';
import { Request, Response } from 'express';
import { openDbConnection, createTables, logAction } from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('hello from express and typescript');
});


router.get('/logs', async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }
    
    try {
        const db = await openDbConnection();
        await createTables(db);

        db.all('SELECT * FROM logs WHERE username = ? ORDER BY timestamp DESC', [username], (err, rows) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                const encryptedRow = encryptData(rows);
                return res.json({data: encryptedRow});
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
