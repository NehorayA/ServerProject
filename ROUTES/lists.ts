import { Router } from 'express';
import { openDbConnection, createTables } from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';

const listsRouter = Router();

listsRouter.post('/users/:username/lists/addMovie', async (req, res) => {
    const { username} = req.params;
    const { listId, movieId} = req.body;

    if (!username || !listId || !movieId) {
        return res.status(400).json({ error: 'Username, listId, and movieId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT movies FROM UserLists WHERE id = ? AND username = ?', [listId, username], async (err, row: { movies?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                let movies = row.movies ? row.movies.split(',') : [];

                if (movies.includes(String(movieId))) {
                    return res.status(400).json({ error: 'Movie is already in the list' });
                }

                movies.push(movieId);
                await db.run('UPDATE UserLists SET movies = ? WHERE id = ? AND username = ?', [movies.join(','), listId, username]);

                db.close();
                const encryptedRow = encryptData({ message: 'Movie added to list successfully' });
                return res.json({ data: encryptedRow });
            } else {
                return res.status(404).json({ error: 'List not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


listsRouter.get('/users/:username/lists', async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.all('SELECT * FROM UserLists WHERE username = ?', [username], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (rows.length > 0) {
                const encryptedRows = encryptData({ lists: rows });
                return res.json({ data: encryptedRows });
            } else {
                return res.status(404).json({ error: 'No lists found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a specific list
listsRouter.get('/users/:username/lists/:listId', async (req, res) => {
    const { username, listId } = req.params;

    if (!username || !listId) {
        return res.status(400).json({ error: 'Username and listId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT * FROM UserLists WHERE id = ? AND username = ?', [listId, username], (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const encryptedRow = encryptData(row);
                return res.json({ data: encryptedRow });
            } else {
                return res.status(404).json({ error: 'List not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a movie from a list
listsRouter.post('/users/:username/lists/removeMovie', async (req, res) => {
    const { username } = req.params;
    const { listId, movieId } = req.body;

    if (!username || !listId || !movieId) {
        return res.status(400).json({ error: 'Username, listId, and movieId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT movies FROM UserLists WHERE id = ? AND username = ?', [listId, username], async (err, row: { movies?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                let movies = row.movies ? row.movies.split(',') : [];

                const movieIndex = movies.indexOf(String(movieId));
                if (movieIndex === -1) {
                    return res.status(400).json({ error: 'Movie is not in the list' });
                }

                movies.splice(movieIndex, 1);
                await db.run('UPDATE UserLists SET movies = ? WHERE id = ? AND username = ?', [movies.join(','), listId, username]);

                db.close();
                const encryptedRow = encryptData({ message: 'Movie removed from list successfully' });
                return res.json({ data: encryptedRow });
            } else {
                return res.status(404).json({ error: 'List not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new list
listsRouter.post('/users/:username/lists/create', async (req, res) => {
    const { username } = req.params;
    const { listName, description, isPublic } = req.body;

    if (!username || !listName) {
        return res.status(400).json({ error: 'Username and listName parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.run('INSERT INTO UserLists (username, listName, description, public) VALUES (?, ?, ?, ?)', [username, listName, description, isPublic], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else {
                db.close();
                const encryptedRow = encryptData({ message: 'List created successfully', listId: this.lastID });
                return res.json({ data: encryptedRow });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a list
listsRouter.post('/users/:username/lists/delete', async (req, res) => {
    const { username} = req.params;
    const { listId} = req.body;


    if (!username || !listId) {
        return res.status(400).json({ error: 'Username and listId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.run('DELETE FROM UserLists WHERE id = ? AND username = ?', [listId, username], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else {
                db.close();
                const encryptedRow = encryptData({ message: 'List deleted successfully' });
                return res.json({ data: encryptedRow });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default listsRouter;
