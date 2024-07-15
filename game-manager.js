//Coach Knight
//Brian Morris
//07-15-2024

//Game manager
//
//Downloads games from a user's website using their authentication
//Stores the 'Key Moments' from every game that it finds for later use
//Can delete all of a user's downloaded games

import { getAnalysis } from './chess-analysis.js';

//generator to step through user URLS one at a time
function* getNextGame(userURLs) {
    for (const url of userURLs) {
        yield url;
    };
};

//get all of a user's game urls from all of the sites that they are registered for
async function getUserURLs(username, apiKey) {
    //confirm user exists for the websites
    const isChessCom = await isChessComUser(username, apiKey);
    const isLichess = await isLichessUser(username, apiKey);
    
    //fetch all game url references
    const chessGames = isChessCom ? await getChessComURLs(username, apiKey) : [];
    const lichessGames = isLichess ? await getLichessURLs(username, apiKey) : [];

    return {...chessGames, ...lichessGames};
};

//functions to validate user presence on the given website
async function isChessComUser(username, apiKey) {
    try {
        const response = await fetch(`https://api.chess.com/pub/player/${username}`, {
            mode: 'cors',
            headers: {
                'x-api-key': apiKey
            }
        });
        return response.ok;
    } catch (err) {
        return false;
    };
};

async function isLichessUser(username, apiKey) {
    try {
        const response = await fetch(`https://lichess.org/api/user/${username}`, {
            mode: 'cors',
            headers: {
                'x-api-key': apiKey
            }
        });
        return response.ok;
    } catch (err) {
        return false;
    };
};

//functions to retrieve game URLs
async function getChessComURLs(username, apiKey) {
    try {
        const response = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`, {
            mode: 'cors',
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Https request unsuccessful. Status: ${response.status}`);
        };

        const data = await response.json();

        let gameURLs = [];

        for (const archiveUrl of data.archives) {
            const gamesResponse = await fetch(archiveUrl);
            const gamesData = await gamesResponse.json();
            gameURLs = gameURLs.concat(gamesData.games.map(game => game.url));
        };

        return gameURLs;
    } catch (err) {
        return new Error(err);
    };
};

async function getLichessURLs(username, apiKey) {
    try {
        let gameURLs = [];
        let nextPage = 1;
        let hasMoreGames = true;

        while(hasMoreGames) {
            const response = await fetch(`https://lichess.org/api/games/user/${username}?max=100&page=${nextPage}`, {
                mode: 'cors',
                headers: {
                    'x-api-key': apiKey,
                    'Accept': 'application/x-chess-pgn'
                }
            });

            if (!response.ok) {
                throw new Error(`Lichess fetch failed, status: ${response.status}`);
            };

            const data = await response.json();
            if (data.length > 0) {
                gameURLs = gameURLs.concat(data.map(game => game.url));
                nextPage++;
            } else {
                hasMoreGames = false;
            }
        };
    } catch (err) {
        return new Error(err);
    };
};

//retrieves the next N games and analyzes them, returning their analysis
async function getUserGames(userURLs, apiKey, bufferNumber, username) {
    nextURLs = [];
    for (i = 0; i < bufferNumber; i++) {
        const { value: gameURL, done } = getNextGame(userURLs).next();
        if (done) {
            break;
        };

        nextURLs.push(gameURL);
    };

    if (!nextURLs) {
        return null;
    };

    const allAnalysis = [];

    try {
        for (const url of nextURLs) {
            const response = await fetch(url, {
                mode: 'cors',
                headers: {
                    'x-api-key': apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`Status: ${response.status} Cannot fetch game from ${url}`);
            };

            const png = await response.text();

            const analysis = await getAnalysis(png, username);

            allAnalysis.push(analysis);
        };

        return allAnalysis || null;
    } catch (err) {
        return new Error(err);
    };
};

export { getUserURLs, getUserGames, getNextGame };