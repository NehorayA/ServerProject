import { Router, Request, Response } from 'express';
import { openDbConnection, createTables, logAction} from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';

const watchedMoviesRouter = Router();

watchedMoviesRouter.post('/users/:username/moviesWatched', async (req, res) => {
    const { username } = req.params;
    const { movieId, rating } = req.body;

    if (!username || !movieId || rating === undefined) {
        return res.status(400).json({ error: 'Username, movieId, and rating parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT watchList, moviesWatched FROM UserData WHERE username = ?', [username], async (err, row: { watchList?: string, moviesWatched?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const watchList = row.watchList ? row.watchList.split(',') : [];
                const moviesWatched = row.moviesWatched ? row.moviesWatched.split(',') : [];
                
                // Check if the movie is in the watchlist
                if (watchList.includes(String(movieId))) {
                    const encryptedRow = encryptData({ message: 'Movie is already in the watchlist'});
                    return res.status(200).json({data: encryptedRow});
                }

                            
                if (moviesWatched.some(movie => {
                    const [id, _] = movie.split(':');
                        return id === String(movieId);
                    }) && rating === 0) {
                        const encryptedRow = encryptData({ message: 'Movie is already watched'});
                        return res.status(200).json({data: encryptedRow});
                    }
                

                // Check if the movie is already in the watched movies list
                let movieIndex = moviesWatched.findIndex(movie => movie.split(':')[0] === String(movieId));
                
                if (movieIndex > -1) {
                    // Update the rating of the existing movie
                    moviesWatched[movieIndex] = `${movieId}:${rating}`;

                    await db.run('DELETE FROM logs WHERE username = ? AND action = ? AND data LIKE ?', [username, 'add_watched', `%${movieId}%`])
                    await logAction(db, username, 'add_watched', `rated ${movieId} ${rating}`);
                        
                    

                } else {
                    // Add the new movie with its rating
                    moviesWatched.push(`${movieId}:${rating}`);
                    await logAction(db, username, 'add_watched', `rated ${movieId} ${rating}`);

                    // Update UserStats table
                    await db.run('UPDATE UserStats SET moviesWatched = moviesWatched + 1 WHERE username = ?', [username]);
                }

                // Update UserData table with the new list of watched movies
                await db.run('UPDATE UserData SET moviesWatched = ? WHERE username = ?', [moviesWatched.join(','), username]);

                db.close();
                const encryptedRow = encryptData({ message: 'Movie added/updated in the watched list and stats updated successfully'});
                return res.json({data: encryptedRow});
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


watchedMoviesRouter.get('/users/:username/moviesWatched', async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT moviesWatched FROM UserData WHERE username = ?', [username], (err, row: { moviesWatched?: string }) => {
            db.close();
            console.log(row)
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row && row.moviesWatched) {
                const moviesWatched = row.moviesWatched.split(',');
                if (moviesWatched.length === 0) {
                    const encryptedRow = encryptData({ message: 'Watched list is empty'});
                    return res.status(200).json({data: encryptedRow});
                    
                }


                // Extract movie IDs and ratings from the stored data
                const watchedMoviesWithRatings = moviesWatched.map(entry => {
                    const [movieId, rating] = entry.split(':');
                    return { movieId, rating: rating ? rating : null };
                });

                const encryptedRow = encryptData({ username, watchedMovies: watchedMoviesWithRatings });
                return res.json({data: encryptedRow});
            } else {
                const encryptedRow = encryptData({ message: 'Watched list is empty' });
                return res.json({data: encryptedRow});
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


watchedMoviesRouter.post('/users/:username/removeWatchedMovie', async (req, res) => {
    const { username } = req.params;
    const { movieId } = req.body;

    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT moviesWatched FROM UserData WHERE username = ?', [username], async (err, row: { moviesWatched?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                let moviesWatched = row.moviesWatched ? row.moviesWatched.split(',') : [];

                if (!moviesWatched.some(entry => entry.startsWith(`${movieId}:`))) {
                    const encryptedRow = encryptData({ message: 'Movie is not in the watched list' });
                    return res.status(400).json({data: encryptedRow});
                }

                moviesWatched = moviesWatched.filter(entry => !entry.startsWith(`${movieId}:`));

                await db.run('UPDATE UserData SET moviesWatched = ? WHERE username = ?', [moviesWatched.join(','), username]);

                db.run('UPDATE UserStats SET moviesWatched = moviesWatched - 1 WHERE username = ?', [username], function(err) {
                    if (err) {
                        console.error(err);
                        db.close();
                        return res.status(500).json({ error: 'Internal server error' });
                    } else {
                        db.run('DELETE FROM logs WHERE username = ? AND action = ? AND data LIKE ?', [username, 'add_watched', `%${movieId}%`], function(err) {
                            db.close();
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Internal server error' });
                            } else {
                                const encryptedRow = encryptData({ message: 'Movie removed from watched list, stats updated, and log entry deleted successfully' });
                                return res.json({data: encryptedRow});
                            }
                        });
                    }
                });
            } else {
                return res.status(404).json({ error: 'User not found or no movies watched yet' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


export default watchedMoviesRouter;
