//Coach Knight
//Brian Morris
//07-15-2024

//Config
//
//Parse and unparse data to maintain updated environment

import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

//function to update environment file
function updateEnv(updates = {}) {
    //add new values OR rewrite old ones for environment
    for (const [ name, value ] of Object.entries(updates)) {
        process.env[name] = JSON.stringify(value);
    };

    //create new file JSON string for current files
    let updatedEnv = '';
    for (const [ name, value ] of Object.entries(process.env)) {
        updatedEnv += `\n${name}=${value}`;
    };
    
    //overwrite files
    fs.writeFileSync('.env', updatedEnv.trim(), 'utf-8');
};

//function to retrieve environment variable
function getValue(name) {
    try {
        return process.env[name] ? JSON.parse(process.env[name]) : null;
    } catch (e) {
        return process.env[name];
    };
};

export { updateEnv, getValue };