//Coach Knight
//Brian Morris
//06-30-2024

//Terminal
//
//Handles terminal i/o

import { argv } from 'process';
import { createInterface } from 'node:readline';

//create a new input/output stream
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

//end input/output stream
async function closeInterface() {
    rl.close();
    process.exit();
};

//function to parse additional commands or incorrect usage
function callIsValid() {
    //accept command line arguments to set up program execution
    const userCommands = []

    //parse commands given to program startup
    argv.forEach((val, index) => {
        if (index > 1) {
            userCommands.push(val);
        }
    });

    //correct usage
    if (userCommands.length === 0) {
        return true;
    }

    //incorrect usage
    return false;
};

//gets input from a user
async function getInput(prompt=null) {
    if (prompt === null) {
        return new Promise((resolve) => rl.question('', resolve));
    } else {
        return new Promise((resolve) => rl.question(`${prompt}\n`, resolve));
    };
};

//reports information to user
//acts as a razor thin wrapper to console.log, but can be replaced if not using the console.
async function putText(text) {
    console.log(text);
};

export { closeInterface, callIsValid, getInput, putText };