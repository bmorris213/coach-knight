//Coach Knight
//Brian Morris
//06-30-2024

//Main
//
//Helps spot weakness in your play as a chess player
//and reports them to you while recommending where to focus in study
//using your games from your favorite website

import { startup } from './coach-knight.js';

//program execution entry point
async function main() {
    //redirect to coach knight
    await startup();
}

main();