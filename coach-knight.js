//Coach Knight
//Brian Morris
//07-15-2024

//Coach Knight
//
//main loop interaction with user

// NOTE FOR DEVELOPERS
// Not including 'secure.js' in git enforces security of program when ported
// HOWEVER
// Because it isn't included, package requires you implement 'secure.js' yourself
import { encrypt, decrypt, getApiKey } from './secure.js';

import { updateEnv, getValue } from './config.js';
import { getInput, putText, callIsValid, closeInterface } from './terminal.js';
import { getUserGames, getUserURLs } from './game-manager.js';
import { generateReport } from './reports.js';

//define 'help' text
const helpText = 'Usage for Coach Knight chess bot:\n'
    + '--------------------------------\n'
    + 'default use: \"npm start\"\n'
    + 'User must log in to establish a profile with Coach Knight.\n'
    + '--------------------------------\n'
    + 'Coach Knight accepts commands until the user exits.\n'
    + 'Commands:\n'
    + '\t\"q\" or \"quit\"\t\texit the program.\n'
    + '\t\"h\" or\"help\"\t\tsee this menu.\n'
    + '\t\"d\" or\"download\"\tdownload your games and generate reports.\n'
    + '\t\"v\" or\"view\"\t\tview generated reports.\n'
    + '\t\"l\" or\"logout\"\t\texit program AND log user out.\n'
    + '\t\"r\" or \"remove\"\t\tdelete the logged in user\'s data AND exit the program.';

async function startup(){
    //ensure valid call
    if (!callIsValid()) {
        await putText('Invalid usage...');
        await putText(helpText);
        await closeInterface();
    };

    //ensure user is logged in
    //if not, redirect to log - in first
    if (!getValue('LOGGED_PLAYER')) {
        await logInUser();
    }

    //redirect to main use loop
    await handleUserInteraction();

    //after loop ends we need to close program
    await closeInterface();
};

async function logInUser() {
    const players = getValue('PLAYERS') || [];
    const passwords = getValue('PASSWORDS') || {};

    //user is not logged in
    await putText('Logging into Coach Knight... (type \"quit\" to stop)');

    //get user name
    const username = await getInput('Enter your username:');

    //quit exit
    if (username === 'quit') {
        await putText('Exiting Coach Knight...');
        await closeInterface();
    }

    //does user exist?
    let userExists = false;
    if (!!players) {
        if (players.includes(username)) {
            userExists = true;
        }
    }

    if (userExists) {
        await putText('Enter your password:');
    } else {
        await putText(`Greetings, new user \"${username}\"!`);
        await putText('Create your new password:');
    }

    let password = await getInput();

    //quit exit
    if (password === 'quit') {
        await putText('Exiting Coach Knight...');
        await closeInterface();
    }

    //limit user guesses
    const tryNumbers = 3;
    let tryCount = 0;

    //if the user exists we must validate their password
    if (userExists && !!passwords && !!passwords[username]) {
        while (password !== decrypt(passwords[username])) {
            await putText('Error: incorrect password!');

            if (tryCount === tryNumbers) {
                await putText('Password attempts exhausted... Shutting down.');
                await closeInterface();
            };

            await putText(`Tries remaining: ${tryNumbers - tryCount}`);
            tryCount++;

            password = await getInput();

            if (password === 'quit') {
                await putText('Exiting Coach Knight...');
                await closeInterface();
            }
        }
    }

    //we have username / password combo: time to update
    if (!players.includes(username)) {
        players.push(username);
    };
    passwords[username] = encrypt(password);

    updateEnv({
        LOGGED_PLAYER: username,
        PLAYERS: players,
        PASSWORDS: passwords
    });
};
    


//function to handle interaction with a logged-in user
//based on user command, redirects code execution
async function handleUserInteraction() {
    while(true) {
        const userCommand = await getInput('Type a command for Coach Knight chess bot:');

        if (userCommand === 'quit' || userCommand === 'q') {
            await putText('Thank you for using Coach Knight chess bot! Have a nice day!');
            await closeInterface();
        } else if (userCommand === 'download' || userCommand === 'd') {
            await downloadGames();
        } else if (userCommand === 'view' || userCommand === 'v') {
            await viewGames();
        } else if (userCommand === 'logout' || userCommand === 'l') {
            await logOutUser();
        } else if (userCommand === 'remove' || userCommand === 'r') {
            await deleteUser();
        } else if (userCommand === 'help' || userCommand === 'h') {
            await putText(helpText);
        } else {
            await putText(`Command of \"${userCommand}\" is not a valid command.`);
            await putText('Try \"help\" to see valid commands.');
        }

        await putText('================================');
    }
};

async function downloadGames() {
    const username = getValue('LOGGED_PLAYER');

    if (!username) {
        await putText('No user logged in!');
        return;
    };

    //ensure we have api key
    if (!getValue('CHESS_API_KEY')) {
        updateEnv ({
            CHESS_API_KEY: getApiKey()
        });
    }
    const apiKey = decrypt(getValue('CHESS_API_KEY'));

    //get reference to all of a user's games
    const userURLs = getUserURLs(username, apiKey);

    //update environment variable for game data
    let gameData = getValue('GAME_DATA');
    if (!gameData) {
        gameData = {};
    };

    const currentData = gameData[username] || {};

    gameData[username] = {...currentData, ...userURLs};

    updateEnv({
        GAME_DATA: gameData
    });

    await putText('User game data downloaded! Try \"view\" to see a report on your games!');
};

//compiles a report on user games and displays the report to the user
async function viewGames() {
    //retrive game data
    const username = getValue('LOGGED_PLAYER');
    const gameData = getValue('GAME_DATA');
    if (!gameData || !username || !gameData.hasOwnProperty(username)) {
        await putText('There is no data to view! Try \"download\" to get some game data.');
        return;
    };

    //ensure we have api key
    if (!getValue('CHESS_API_KEY')) {
        updateEnv ({
            CHESS_API_KEY: getApiKey()
        });
    }
    const apiKey = decrypt(getValue('CHESS_API_KEY'));

    //begin loop of analyzing a few games at a time
    let userResponse = '';
    const analysis = [];
    const bufferNumber = 10;
    const gameURLs = gameData[username];
    
    await putText(`Analyzing ${bufferNumber} games at a time...`);
    await putText('To stop, just type something and hit enter. Hitting enter without typing anything will keep going until done.');
    
    while (!userResponse) {
        userResponse = await getInput();

        if (!userResponse) {
            //get the BUFFER NUMBER next games
            const newData = await getUserGames(gameURLs, apiKey, bufferNumber, username);

            if (typeof newData === 'Error') {
                await putText(newData);
                return;
            } else if (!newData) {
                await putText(`Could not retrive data for you, \"${username}\"...`);
                return;
            };

            analysis = {...analysis, ...newData};
        };
    };

    //compile report
    const report = generateReport(analysis);

    //display report
    await putText(report);
};

//exits program while removing current logged player
async function logOutUser() {
    await putText('Logging out...');

    //update logged player to nothing
    updateEnv({
        LOGGED_PLAYER: null
    });

    //exit program
    await closeInterface();
};

//deletes all of the user's data, then logs them out
async function deleteUser() {
    //verify user wants to delete data
    let canDelete = '';
    const yesAnswers = [ 'yes', 'y', 'sure', 'confirm' ];
    const noAnswers = [ 'no', 'n', 'quit', 'exit', 'stop' ];

    const username = getValue('LOGGED_PLAYER');
    if (!username) {
        await putText('No user to delete...');
        return;
    };

    while (!yesAnswers.includes(canDelete) && !noAnswers.includes(canDelete)) {
        canDelete = await getInput(`Are you sure you want to delete all data for user \"${username}\"?`);

        if (yesAnswers.includes(canDelete)) {
            //unset values
            let players = getValue('PLAYERS');
            let passwords = getValue('PASSWORDS');
            let gameData = getValue('GAME_DATA');

            if (!players || !passwords || !players.includes(username) || !passwords.hasOwnProperty(username)) {
                await putText('No user to delete...');
                return;
            };
            
            await putText('Deleting user...');
            players = players.filter(player => player !== username);
            delete passwords[username];

            if (!!gameData && gameData.hasOwnProperty(username)) {
                delete gameData[username];
            };

            updateEnv({
                PLAYERS: players,
                PASSWORDS: passwords,
                GAME_DATA: gameData
            });

            await putText('User deleted!');

            //log out
            await logOutUser();
        } else if (noAnswers.includes(canDelete)) {
            await putText('Understood!');
            return;
        } else {
            await putText('Only valid responses are \"yes\" or \"no\".');
        };
    };
};

//helper function to strip to domain name only
function stripURL(urlString) {
    //ensure urlString IS a string
    urlString = String(urlString);
    
    //strip protocol
    if (urlString.includes('https://')) {
        urlString = urlString.replace(/https:\/\//, '');
    }
    else if (urlString.includes('http://')) {
        urlString = urlString.replace(/http:\/\//, '');
    }

    //strip www subdomain
    if (urlString.includes('www.')) {
        urlString = urlString.replace(/www\./, '');
    }

    //strip root path
    if (urlString.endsWith('/')) {
        urlString = urlString.slice(0, -1);
    }

    return urlString;
};

export { startup };