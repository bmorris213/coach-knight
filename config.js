//Coach Knight
//Brian Morris
//06-23-2024

//Config
//
//Create and store user profiles
//encrypt passwords, certificates, and api keys
//potentially delete a user and their encrypted files

// config.js
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import 'dotenv/config';
import * as fs from 'fs';

// SECURITY AND ENCRYPTION
const SECRET_PASSPHRASE = 'Under$saTnd T8heCon1s#equ3nce';
const SALT = 'f*u_nK';
const KEY_LENGTH = 32; // 32 bytes = 256 bits
const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16; // AES requires a 16-byte IV
const ITERATIONS = 100000; // Number of iterations for PBKDF2

const generateKey = (passphrase, salt) => {
    return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha256');
};

const encrypt = (text) => {
    const key = generateKey(SECRET_PASSPHRASE, SALT);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (ciphertext) => {
    const key = generateKey(SECRET_PASSPHRASE, SALT);
    const parts = ciphertext.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
};

// CONFIGURATION DETAILS

dotenv.config();

//function to update environment file
function updateEnv() {
    const logged_user = process.env.LOGGED_USER ? JSON.stringify(process.env.LOGGED_USER) : JSON.stringify(false);
    const players = process.env.PLAYERS ? JSON.stringify(process.env.PLAYERS) : JSON.stringify([]);
    const passwords = process.env.PASSWORDS ? JSON.stringify(process.env.PASSWORDS) : JSON.stringify({});
    const data = process.env.GAME_DATA ? JSON.stringify(process.env.GAME_DATA) : JSON.stringify({});
    const api = process.env.CHESS_API_KEY ? JSON.stringify(process.env.CHESS_API_KEY) : JSON.stringify('');

    const updatedEnv = `
LOGGED_USER=${logged_user}
PLAYERS=${players}
PASSWORDS=${passwords}
GAME_DATA=${data}
CHESS_API_KEY=${api}
`;
    fs.writeFileSync('.env', updatedEnv.trim(), 'utf-8');
}

function getAPIKey () {
    return process.env.CHESS_API_KEY ? decrypt(process.env.CHESS_API_KEY) : null;
};

function isApiKeyStored () {
    return !!process.env.CHESS_API_KEY;
}

function storeEncryptedApiKey (apiKey) {
    const encryptedApiKey = encrypt(apiKey);

    if (!process.env.CHESS_API_KEY) {
        fs.appendFileSync('.env', `\nCHESS_API_KEY=${encryptedApiKey}`);
    } else {
        process.env.CHESS_API_KEY = encryptedApiKey;
        updateEnv();
    }
}

function logOutUser () {
    process.env.LOGGED_USER = JSON.stringify(false);
    updateEnv();
}

function authorizeUser (username, password) {
    try {
        const passwords = process.env.PASSWORDS ? JSON.parse(process.env.PASSWORDS) : {};
        const players = process.env.PLAYERS ? JSON.parse(process.env.PLAYERS) : [];

        //if this is a new player
        if (!players.includes(username)) {
            players.push(username);

            //encrypt and store password
            passwords[username] = encrypt(password);
        } else {
            //all we need to do is verify password
            if (encrypt(password) !== passwords[username]) {
                throw new Error('Password does not match...');
            }
        }
        
        //finally set new LOGGED_USER variable
        if (!process.env.LOGGED_USER) {
            fs.appendFileSync('.env', `\nLOGGED_USER=${username}`);
        } else {
            process.env.LOGGED_USER = username;
        }

        //download changes
        process.env.PLAYERS = JSON.stringify(players);
        process.env.PASSWORDS = JSON.stringify(passwords);
        updateEnv();
    } catch (err) {
        console.log(`Log in error:\n${err}`);
    }
}

//remove all stored variables for current player
function deleteUser() {
    if (!process.env.LOGGED_USER) {
        //there is no logged in player
        return;
    }

    //ensure env variables exist
    if (!process.env.PLAYERS || !process.env.PASSWORDS) {
        //there is no data to delete
        return;
    }

    const players = process.env.PLAYERS ? JSON.parse(process.env.PLAYERS) : null;
    const passwords = process.env.PASSWORDS ? JSON.parse(process.env.PASSWORDS) : null;
    
    if (players === null || passwords === null) {
        throw new Error('Deleting falsy players/passwords...');
    }

    //unset variables
    players = players.filter(player => player !== process.env.LOGGED_USER);
    delete passwords[process.env.LOGGED_USER];
    process.env.PLAYERS = JSON.stringify(players);
    process.env.PASSWORDS = JSON.stringify(passwords);

    //log out player, which also updates environment
    logOutUser();
}

function getCurrentUser() {
    return process.env.LOGGED_USER ? process.env.LOGGED_USER : null;
}

function storeGameData(username, data) {
    if (!process.env.GAME_DATA) {
        const gameData = {};
        fs.appendFile('.env', `\nGAME_DATA=${gameData}`);
    }

    const gameData = process.env.GAME_DATA ? JSON.parse(process.env.GAME_DATA) : {};

    //retrieve what is already stored
    const oldData = gameData[username] ? gameData[username] : {};

    //remove duplicates already stored
    for (const item of data) {
        if (item in oldData) {
            delete data[item];
        }
    }

    //combine and store game data under username
    const combinedData = Object.assign({}, oldData, data);
    process.env.GAME_DATA[username] = combinedData;

    updateEnv();
}

export { isApiKeyStored, storeEncryptedApiKey,
    authorizeUser, logOutUser, getAPIKey, deleteUser,
    storeGameData, getCurrentUser };