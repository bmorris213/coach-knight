//Coach Knight
//Brian Morris
//06-23-2024

//Main
//
//Helps spot weakness in your play as a chess player
//and reports them to you while recommending where to focus in study
//using your games from your favorite website

import { parseStartup, closeInterface } from './terminal.js';
import { isApiKeyStored, storeEncryptedApiKey } from './config.js';

//program execution entry point
async function main() {
    //ensure api key exists
    const apiKey = 'chess-api-COACH-KNIGHT-007';
    if (!isApiKeyStored()) {
        storeEncryptedApiKey(apiKey);
    }

    //redirect to terminal interaction
    await parseStartup();

    //exit terminal interface
    closeInterface();
}

main();