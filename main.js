//Coach Knight
//Brian Morris
//06-23-2024

//Main
//
//Helps spot weakness in your play as a chess player
//and reports them to you while recommending where to focus in study
//using your games from your favorite website

import { parseStartup, closeInterface } from './terminal.js'

//program execution entry point
async function main() {
    //redirect to terminal interaction
    await parseStartup();

    //exit terminal interface
    closeInterface();
}

main();