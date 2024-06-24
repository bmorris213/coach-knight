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
import 'dotenv/config';
import * as fs from 'fs';

const SECRET_PASSPHRASE = 'Under$saTnd T8heCon1s#equ3nce'; // Change this to your secret passphrase
const SALT = 'f*u_nK yB6ushn3s'; // Change this to your salt value
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

const getConfig = () => {
    return {
        apiKey: decrypt(process.env.CHESS_API_KEY),
    };
};

const isApiKeyStored = () => {
    return !!process.env.CHESS_API_KEY;
}

const storeEncryptedApiKey = (apiKey) => {
    const encryptedApiKey = encrypt(apiKey);
    fs.appendFileSync('.env', `\nCHESS_API_KEY=${encryptedApiKey}`);
}

export { encrypt, decrypt, getConfig, isApiKeyStored, storeEncryptedApiKey };