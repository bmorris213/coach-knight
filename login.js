import { logInUser } from './terminal.js';

async function waitForLogin() {
    await logInUser();
    
    process.exit();
}

waitForLogin();