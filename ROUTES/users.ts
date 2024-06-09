import { Router, Request, Response } from 'express';
import { openDbConnection, createTables } from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';

const usersRouter = Router();


usersRouter.get('/users', async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const encryptedRow = encryptData(row);
                return res.json({data: encryptedRow});
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

usersRouter.put('/users/:username', async (req, res) => {
    const { username } = req.params;
    const { email, password, name, familyName, location, website, bio } = req.body;

    try {
        const db = await openDbConnection();
        await createTables(db);

        const stmt = db.prepare('UPDATE users SET email = ?, password = ?, name = ?, familyName = ?, location = ?, website = ?, bio = ? WHERE username = ?');
        stmt.run(email, password, name, familyName, location, website, bio, username, function(err: any) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update user' });
            } else {
                const encryptedRow = encryptData({message: 'User updated successfully'});
                return res.json({data: encryptedRow});
            }
            stmt.finalize();
            db.close();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


usersRouter.get('/users/password', async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT password FROM users WHERE username = ?', [username], (err, row: { password: string }) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const encryptedRow = encryptData({ password: row.password});
                return res.json({data: encryptedRow});
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

usersRouter.put('/users/:username/password', async (req, res) => {
    const { username } = req.params;
    const { newPassword } = req.body;

    if (!username || !newPassword) {
        return res.status(400).json({ error: 'Username and newPassword parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.run('UPDATE users SET password = ? WHERE username = ?', [newPassword, username], function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update password' });
            } else {
                const encryptedRow = encryptData({ message: 'Password updated successfully' });
                res.json({data: encryptedRow});
            }
            db.close();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

usersRouter.put('/users/:username/avatar', async (req, res) => {
    const { username } = req.params;
    const { avatar } = req.body;
    
    console.log(avatar);

    


    if (!avatar) {
      return res.status(400).json({ error: 'Avatar data is missing in the request body' });
    }
  
    // Convert base64-encoded image data to binary
    const binaryImageData = Buffer.from(avatar, 'base64');
  
    try {
      const db = await openDbConnection();
      await createTables(db);
  
      const stmt = db.prepare('UPDATE users SET profileImage = ? WHERE username = ?');
      stmt.run(binaryImageData, username, function(err: any) {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to update profile image' });
        } else {
            const encryptedRow = encryptData({ message: 'Profile image updated successfully' });
            res.json({data: encryptedRow});
        }
        stmt.finalize();
        db.close();
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  usersRouter.get('/userStats', async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT * FROM UserStats WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const encryptedRow = encryptData(row);
                return res.json({data: encryptedRow});
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






export default usersRouter;
