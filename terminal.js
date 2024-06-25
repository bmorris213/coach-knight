//Coach Knight
//Brian Morris
//06-23-2024

//Terminal
//
//Handles terminal i/o
//parses optional arguments
//prompts and receives input from user

import { argv } from 'process';
import { createInterface } from 'node:readline';
import { authorizeUser, logOutUser, deleteUser, getCurrentUser, storeGameData } from './config.js';
import { getGameData } from './game-manager.js';

//define helper structs for user interaction
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

const closeInterface = () => {
    rl.close();
};

//accept initial command line arguments and redirect
async function parseStartup() {
    //accept command line arguments to set up program execution
    const userCommands = []

    //parse commands given to program startup
    argv.forEach((val, index) => {
        if (index > 1) {
            userCommands.push(val);
        }
    });

    // handle default execution
    if (userCommands.length === 0) {
        if (getCurrentUser() === null) {
            console.log('Must log in before accessing default function');
            return 1;
        }

        await handleUserInteraction();
        return 0;
    }

    //only one optional parameter can be handled
    if (userCommands.length > 1) {
        console.log('Too many parameters: can only take one optional parameter at a time.');
        return 1;
    }
    let command = userCommands[0];

    //handle optional parameters
    if (command === 'help' || command === 'h') {
        printHelpScript();
        return 0;
    } else if (command === 'login' || command === 'l') {
        await logInUser();
        return 0;
    } else if (command === 'remove' || command === 'r') {
        if (getCurrentUser() === null) {
            console.log('Must log in to account before removing data.');
            return 1;
        }

        deleteUser();
        return 0;
    } else {
        console.log(`Unknown optional parameter: ${userCommands[0]}`);
        console.log('Start with optional parameter h or help for usage.');
        return 1;
    }
}

//helper function to show command usage
function printHelpScript() {
    console.log('Usage for Coach Knight chess bot');
    console.log('================================');
    console.log('default use: npm start');
    console.log('\tIf the user is \"logged in\", this launches default operation of program.');
    console.log('Program reads data from user\'s website and compiles reports for you to use.');
    console.log('Here users can \"download\" to download all games from their website,');
    console.log('use \"report\" to generate reports on user games, or \"view\" to view these reports,');
    console.log('or finally use \"quit\" to gracefully exit program.');
    console.log('--------------------------------');
    console.log('To specify optional arguments use: npm start [enter option here]');
    console.log('\tOptions are as follows:');
    console.log('h or help\t\tList program usage text.');
    console.log('l or login\t\tlog user into a website for analysis.');
    console.log('r or remove\tRemove the current login information and game data.');
    console.log('--------------------------------');
}

//helper function to get domain name only
function stripURL(urlString) {
    if (urlString.includes('https://')) {
        urlString = urlString.replace(/https:\/\//, '');
    }
    else if (urlString.includes('http://')) {
        urlString = urlString.replace(/http:\/\//, '');
    }

    if (urlString.includes('www.')) {
        urlString = urlString.replace(/www./, '');
    }

    if (urlString.endsWith('/')) {
        urlString = urlString.slice(0, -1);
    }

    if (urlString.endsWith('.com')) {
        urlString = urlString.replace(/.com/, '');
    } else if (urlString.endsWith('.net')) {
        urlString = urlString.replace(/.net/, '');
    } else if (urlString.endsWith('.org')) {
        urlString = urlString.replace(/.org/, '');
    }

    return urlString;
}

//helper function to either 1.) establish a new user
//or 2.) switch active user to an already established user
async function logInUser() {
    try {
        console.log('Logging in with Coach Knight chess bot!');

        const username = await askQuestion('Enter your username:\n');
        const password = await askQuestion('Enter your password:\n');

        authorizeUser(username, password);
    } catch (err) {
        console.log(err);
    }
}

//function to handle interaction with a logged in user to:
//  download games from site
//  read general or specific reports
async function handleUserInteraction() {
    while(true) {
        const userCommand = await askQuestion('Type a command for Coach Knight chess bot:\n > ');

        if (userCommand === 'quit') {
            console.log('Logging out...');
            logOutUser();
            console.log('Thank you for using Coach Knight chess bot! Have a nice day!');
            process.exit();
        } else if (userCommand === 'download') {
            await downloadGames();
        } else if (userCommand === 'report') {
            console.log('Generating reports...');
        } else if (userCommand === 'view') {
            console.log('Viewing reports...');
        } else if (userCommand === 'help') {
            console.log('Type \"quit\" to exit the program.');
            console.log('Type \"help\" to see this menu.');
            console.log('Type \"download\" to download your games.');
            console.log('Type \"report\" to generate reports for downloaded games.');
            console.log('Type \"view\" to view generated reports.');
        } else {
            console.log(`Command of \"${userCommand}\" is not a valid command.`);
            console.log('Try \"help\" to see valid commands.');
        }

        console.log('--------------------------------');
    }
}

async function downloadGames() {
    const supportedSites = [ 'https://www.chess.com/', 'https://www.lichess.org/' ];
    const strippedSupportedSites = supportedSites.map(stripURL);

    let strippedSite = '';
    while (!(strippedSite in strippedSupportedSites)) {
        const targetSite = askQuestion('From which site will you download games?');

        strippedSite = stripURL(targetSite);

        if (!(strippedSite in strippedSupportedSites)) {
            console.log(`Website of ${targetSite} not supported by Coach Knight.`);
            console.log(`Supported sites: ${supportedSites}`);
        }
    }

    //chosen site matches supported site object
    //grab appropriate url
    let url = '';
    for (const supportedSite of supportedSites) {
        if (stripURL(supportedSite) === strippedSite) {
            url = supportedSite;
            break;
        }
    }

    if (url === '') {
        throw new Error(`Supported site of ${strippedSite} not actually supported!`);
    }

    const username = getCurrentUser();

    if (username === null) {
        throw new Error('User not logged in!');
    }

    const gameData = await getGameData(url, username);

    if (gameData === null) {
        throw new Error('No data to retrieve!');
    }

    //store downloaded game data
    storeGameData(username, gameData);
}

export { parseStartup, closeInterface };