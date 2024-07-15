//Coach Knight
//Brian Morris
//07-15-2024

//Chess Analysis
//
//the Brain of Coach Knight

/*
import { Chess } from 'chess.js';
import { stockfish } from 'stockfish';
import { promisify } from 'util';

//create the stockfish engine
const stockFish = wakeStockfish();

//initializes the stockfish object
async function wakeStockfish() {
    const engine = stockfish();

    engine.onmessage = (message) => console.log(message);

    const send = promisify(engine.postMessage.bind(engine));

    async function evaluate(fen) {
        await send('ucinewgame');
        await send(`position fen ${fen}`);
        await send('go depth 20');

        return new Promise((resolve) => {
            engine.onmessage = (message) => {
                const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                if (scoreMatch) {
                    const scoreType = scoreMatch[1];
                    const scoreValue = parseInt(scoreMatch[2], 10);
                    resolve({ scoreType, scoreValue});
                };
            };
        });
    };

    async function getBestMove(fen) {
        await send('ucinewgame');
        await send(`position fen ${fen}`);
        await send('go depth 20');

        let bestMove;
        return new Promise((resolve) => {
            engine.onmessage = (message) => {
                if (message.startsWith('bestmove')) {
                    bestMove = message.split(' ')[1];
                    resolve(bestMove);
                };
            };
        });
    };

    async function getEvalAfterBest(fen, bestMove) {
        await send('ucinewgame');
        await send(`position fen ${fen} moves ${bestMove}`);
        await send('go depth 20');

        return new Promise((resolve) => {
            engine.onmessage = (message) => {
                if (message.includes('info depth 20')) {
                    const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
                    if (scoreMatch) {
                        const scoreType = scoreMatch[1];
                        const scoreValue = parseInt(scoreMatch[2], 10);
                        resolve({ scoreType, scoreValue });
                    };
                };
            };
        });
    };

    return {
        evaluate,
        getBestMove,
        getEvalAfterBest
    };
};

//analyze game, returning all key moments
async function getAnalysis(pgn, username) {
    //convert pgn to chess object
    const chess = new Chess();
    chess.loadPgn(pgn);

    const moves = chess.history();

    let keyMoments = {};

    //begin looping through moves and reading analysis
    for (let i = 0; i < moves.length - 1; i++) {
        //check if current move is played by the user
        if ((chess.header().White === username && i % 2 === 1) || (chess.header().White !== username && i % 2 === 0)) {
            continue;
        };

        //position before the move
        const fenBefore = chess.fen();
        
        //make the move
        chess.move(moves[i]);

        //position after the move
        const fenAfter = chess.fen();

        //analyze this snapshot of the game
        const analysis = await analyzeMoment(fenBefore, moves[i], fenAfter, chess.header().White === username);

        //only continue if this move is important
        if (!!change && !!analysis) {
            keyMoments.push({
                move: moves[i],
                change: analysis.change,
                explanation: analysis.explanation
            });
        };
    }

    //if it can't find any key moments, you must not have made any glaring mistakes
    if(!keyMoments) {
        keyMoments = 'There were no obvious mistakes or oversights in this game.';
    };

    //return the game analysis
    return {
        opening: chess.header().Event,
        result: chess.header().Result,
        keyMoments
    };
};

//looks at a moment in the game to see if it is a key moment
//and if it is, returns the analysis
//returns [ change, analysis ]
async function analyzeMoment(fenBefore, move, fenAfter, isWhite) {
    //get stockfish evals
    let evalBefore = await stockFish.evaluate(fenBefore);
    let evalAfter = await stockFish.evaluate(fenAfter);
    const bestMove = await stockFish.getBestMove(fenBefore);
    let bestEval = await stockFish.getEvalAfterBest(fenBefore, bestMove);

    //if you had mate before, but not after, you missed your chance to force mate
    if (evalBefore.scoreType === 'mate' && evalAfter.scoreType !== 'mate') {
        return {
            change : 'Missed Mate',
            explanation : analyzeMissedMate(fenBefore, move, bestMove)
        };
    };

    //if the eval is mate, multiply by 10,000 to ensure it's
    //greater than any other eval
    const MATE_BUFFER = 10000;
    evalBefore = evalBefore.scoreType === 'mate' ? evalBefore.scoreValue * MATE_BUFFER : evalBefore.scoreValue;
    evalAfter = evalAfter.scoreType === 'mate' ? evalAfter.scoreValue * MATE_BUFFER : evalAfter.scoreValue;
    bestEval = bestEval.scoreType === 'mate' ? bestEval.scoreValue * MATE_BUFFER : bestEval.scoreValue;

    let change = evalBefore - evalAfter;

    //reverse score if black to keep both perspectives the same
    if (!isWhite) {
        change = -change;
        bestEval = -bestEval;
    };

    //check if this is a key moment
    if (change <= -200) {
        //user has made a mistake
        return {
            change,
            explanation : analyzeMistake(fenBefore, move, bestMove)
        };
    } else if (bestEval - change >= 200) {
        //user has missed a chance to improve their position
        return{
            change,
            explanation : analyzeMiss(fenBefore, move, bestMove)
        };
    };
};

//helper function to use stockfish to analyze a mistake made, and why it was a mistake
async function analyzeMistake(fen, move, bestMove) {

};

//helper function to use stockfish to analyze a missed opportunity, and why it was a miss
async function analyzeMiss(fenBefore, move, bestMove) {

};

//helper function to use stockfish to analyze a missed checkmating attack
async function analyzeMissedMate(fenBefore, move, bestMove) {

};

*/
async function getAnalysis(png, username) {
    return {
        username, png,
        keyMoments : [
            'this is an analysis'
        ]
    };
};

export { getAnalysis };