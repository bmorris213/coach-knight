//Coach Knight
//Brian Morris
//06-23-2024

//Main
//
//Helps spot weakness in your play as a chess player
//and reports them to you while recommending where to focus in study
//using your games from your favorite website

import { argv } from 'process';

//program execution entry point
function main() {
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
        return handleUserInteraction();
    }

    //only one optional parameter can be handled
    if (userCommands.length > 1) {
        console.log('Too many parameters: can only take one optional parameter at a time.');
        return 1;
    }
    let command = userCommands[0];

    //optional parameters are expected to be -e or --example form
    //but since we only ask for one, we can assume to tack these on
    if (!command.includes('-')) {
        if (command.length === 1) {
            command = `-${command}`;
        } else {
            command = `--${command}`;
        }
    }

    //handle optional parameters
    if (command === '--help' || command === '-h') {
        printHelpScript();
        return 0;
    } else if (command === '--login' || command === '-l') {
        return logInUser();
    } else if (command === '--remove' || command === '-r') {
        return removeCurrent();
    } else {
        console.log(`Unknown optional parameter: ${userCommands[0]}`);
        console.log('Start with optional parameter -h or --help for usage.');
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
    console.log('To specify optional arguments use: npm start -- [enter option here]');
    console.log('\tOptions are as follows:');
    console.log('-h or --help\t\tList program usage text.');
    console.log('-l or --login\t\tlog user into a website for analysis.');
    console.log('-r or --remove\tRemove the current login information and game data.');
    console.log('--------------------------------');
}

//helper function to either 1.) establish a new user
//or 2.) switch active user to an already established user
function logInUser() {

}

//helper function to delete all user data for currently logged in user
function removeCurrent() {

}

//function to handle interaction with a logged in user to:
//  download games from site
//  read general or specific reports
function handleUserInteraction() {

}

main();