import { Router, Request, Response } from 'express';
import { openDbConnection, createTables, logAction} from '../DB/db';
import { encryptData } from '../ENCRYPTION/encryptionMiddleware';

const watchListMoviesRouter = Router();


watchListMoviesRouter.post('/users/:username/moviesWatchlist', async (req, res) => {
    const { username } = req.params;
    const { movieId } = req.body;

    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        // Check if the movie is already in the watchlist
        db.get('SELECT watchList FROM UserData WHERE username = ?', [username], async (err, row: { watchList?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                const watchList = row.watchList? row.watchList.split(','):[];
                if (watchList.includes(String(movieId))) { 
                    const encryptedRow = encryptData({ message: 'Movie is already in the watchlist' });
                    return res.status(200).json({data: encryptedRow});
                } else {
                    // Check if the movie is already in the watched movies list
                    db.get('SELECT moviesWatched FROM UserData WHERE username = ?', [username], async (err, row: { moviesWatched?: string }) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Internal server error' });
                        } else if (row) {
                            const moviesWatched = row.moviesWatched ? row.moviesWatched.split(',') : [];
                            if (moviesWatched.some(movie => {
                                const [id, _] = movie.split(':');
                                return id === String(movieId);
                              }))  {
                                const encryptedRow = encryptData({ message: 'Movie is already in the watched list' });
                                return res.status(200).json({data: encryptedRow});
                            } else {
                                // Update UserData table to insert the movie into the watchlist
                                watchList.push(movieId);
                                await db.run('UPDATE UserData SET watchList = ? WHERE username = ?', [watchList.join(','), username]);

                                // Update UserStats table
                                db.run('UPDATE UserStats SET watchList = watchList + 1 WHERE username = ?', [username], async function(err) {
                                    db.close();
                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({ error: 'Internal server error' });
                                    } else {
                                        await logAction(db, username, 'add_watchlist', `added ${movieId} to your watchlist`);
                                        const encryptedRow = encryptData({ message: 'Movie added to watchlist and stats updated successfully' });
                                        return res.json({data: encryptedRow});
                                    }
                                });
                            }
                        } else {
                            return res.status(404).json({ error: 'User not found or no movies watched yet' });
                        }
                    });
                }
            } else {
                return res.status(404).json({ error: 'User not found or no movies watched yet' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


watchListMoviesRouter.get('/users/:username/moviesWatchlist', async (req: Request, res: Response) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ error: 'Username parameter is required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT watchList FROM UserData WHERE username = ?', [username], (err, row: { watchList?: string }) => {
            db.close();
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
            } else if (row && row.watchList) {
                const watchList = row.watchList.split(',');
                if (watchList.length === 0) {
                    const encryptedRow = encryptData({ message: 'Watchlist is empty' });
                    return res.json({data: encryptedRow});
                }
                const encryptedRow = encryptData({ username, watchList });
                res.json({data: encryptedRow});
            }
            else if (!row){
                res.status(404).json({ error: 'User not found or watchlist is empty' });
                }
            else if (!row.watchList)
                {
                    const encryptedRow = encryptData({  message: 'Watchlist is empty' });
                    return res.json({data: encryptedRow});
                }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



watchListMoviesRouter.post('/users/:username/removeMoviesWatchlist', async (req, res) => {
    const { username } = req.params;
    const { movieId } = req.body;

    if (!username || !movieId) {
        return res.status(400).json({ error: 'Username and movieId parameters are required' });
    }

    try {
        const db = await openDbConnection();
        await createTables(db);

        db.get('SELECT watchList FROM UserData WHERE username = ?', [username], async (err, row: { watchList?: string }) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            } else if (row) {
                let watchList = row.watchList ? row.watchList.split(',') : [];
                
                if (!watchList.includes(String(movieId))) {
                    const encryptedRow = encryptData({ error: 'Movie is not in the watch list' });
                    res.status(400).json({data: encryptedRow});
                }

                watchList = watchList.filter(id => String(id) !== String(movieId));

                await db.run('UPDATE UserData SET watchList = ? WHERE username = ?', [watchList.join(','), username]);

                db.run('UPDATE UserStats SET watchList = watchList - 1 WHERE username = ?', [username], function(err) {
                    if (err) {
                        console.error(err);
                        db.close();
                        return res.status(500).json({ error: 'Internal server error' });
                    } else {
                        // Delete the log entry
                        db.run('DELETE FROM logs WHERE username = ? AND action = ? AND data LIKE ?', [username, 'add_watchlist', `%${movieId}%`], function(err) {
                            db.close();
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ error: 'Internal server error' });
                            } else {
                                const encryptedRow = encryptData({ message: 'Movie removed from watch list, stats updated, and log entry deleted successfully' });
                                return res.json({data: encryptedRow});
                            }
                        });
                    }
                });
            } else {
                return res.status(404).json({ error: 'User not found or no movies watch yet' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



export default watchListMoviesRouter;
