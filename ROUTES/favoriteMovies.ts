import { Router } from 'express';
import { openDbConnection, createTables, logAction } from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';

const favoriteMoviesRouter = Router();

favoriteMoviesRouter.post('/users/:username/addFavoriteMovie', async (req, res) => {
    const { username } = req.params;
    const { movieId, index } = req.body;

    if (!username || !movieId || typeof index !== 'number') {
        return res.status(400).json({ error: 'Username, movieId, and index parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT favoriteMovies FROM UserData WHERE username = ?', [username], async (err, row: { favoriteMovies?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
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

                await db.run('UPDATE UserData SET favoriteMovies = ? WHERE username = ?', [favoriteMovies.join(','), username]);

                db.close();
                const encryptedRow = encryptData({ message: 'Movie added to favorite list successfully' });
                return res.json({ data: encryptedRow });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

favoriteMoviesRouter.post('/users/:username/removeFavoriteMovie', async (req, res) => {
    const { username } = req.params;
    const { movieId } = req.body;

    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT favoriteMovies FROM UserData WHERE username = ?', [username], async (err, row: { favoriteMovies?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                let favoriteMovies = row.favoriteMovies ? row.favoriteMovies.split(',') : [];

                const movieIndex = favoriteMovies.indexOf(String(movieId));
                if (movieIndex === -1) {
                    return res.status(400).json({ error: 'Movie is not in the favorite list' });
                }

                favoriteMovies[movieIndex] = '0'; // Replace the movie ID with an empty string
                await db.run('UPDATE UserData SET favoriteMovies = ? WHERE username = ?', [favoriteMovies.join(','), username]);

                db.close();
                const encryptedRow = encryptData({ message: 'Movie removed from favorite list successfully' });
                return res.json({ data: encryptedRow });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


favoriteMoviesRouter.get('/users/:username/favoriteMovies', async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT favoriteMovies FROM UserData WHERE username = ?', [username], async (err, row: { favoriteMovies?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const favoriteMovies = row.favoriteMovies ? row.favoriteMovies.split(',') : [];
                db.close();
                const encryptedRow = encryptData({ favoriteMovies });
                return res.json({ data: encryptedRow });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default favoriteMoviesRouter;
