const http = require('http')
const fs = require('fs')
const ws = require('ws')

console.log('Starting server...')

const readFile = file => new Promise(resolve => 
    fs.readFile(file, 'utf-8', (_, data) => resolve(data)))

const server = http.createServer(async (req, resp) => {
    if (req.url == '/'){ //for every custom req.url, there is a resp.end
        resp.end(await readFile('connect4.html'))
    }
    else if (req.url == '/vue.js'){
        resp.end(await readFile('vue.js')) 
    }
    else if (req.url == '/connect4Vue.js'){
        resp.end(await readFile('connect4Vue.js'))
    }
    else{ 
        resp.end() 
    }
}).listen(5000) //http server listens on port 5000

const game_list = [] // to store separate game states
let gidcounter = 0 //game id
let cid = 0 //client id, starting from 0 (even)
const starterGrid = [['','','','','','',''],['','','','','','',''],['','','','','','',''],['','','','','','',''],['','','','','','',''],['','','','','','','']]

function getGameID(cl){ //find index of game in game list, where game's p1client or p2client == the given client
    return game_list.findIndex(game => game['p1client'] == cl || game['p2client'] == cl);
}

function updateGameGrid(gid, y, pchar){ //update gameGrid with given player char and column position to drop piece
    //checking all rows (single column y) from bottom to top until empty value found
    for (let x = 5; x >= 0; x--){
        if (game_list[gid]['grid'][x][y] == ''){
            game_list[gid]['grid'][x][y] = pchar;
            return true;
        }
    }
    return false; //no slot found, column full
}

function updateGrid(grid, y, pchar){ //update grid with given player char and column position to drop piece
    for (let x = 5; x >= 0; x--){
        if (grid[x][y] == ''){
            grid[x][y] = pchar;
            return grid;
        }
    }
    return null; //no slot found, column full
}

function getGridStatus(grid){ //check grid for wins/draws
    //horizontal check
    chars = ['x','o'];
    for (let x = 0; x < 6; x++)
        for (let y = 0; y <= 3; y++)
            for (let c = 0; c < 2; c++)
                if (grid[x][y] == chars[c] && grid[x][y+1] == chars[c] && grid[x][y+2] == chars[c] && grid[x][y+3] == chars[c])
                    return c+1; //return 1 for 'x' which is when c == 0 here, 2 for c = 1   

    //vertical check
    for (let y = 0; y < 7; y++)
        for (let x = 0; x <= 2; x++)
            for (let c = 0; c < 2; c++)
                if (grid[x][y] == chars[c] && grid[x+1][y] == chars[c] && grid[x+2][y] == chars[c] && grid[x+3][y] == chars[c])
                   return c+1;

    //diagonally L
    for (let x = 0; x <= 2; x++)
        for (let y = 0; y <= 3; y++)
            for (let c = 0; c < 2; c++)
                if (grid[x][y] == chars[c] && grid[x+1][y+1] == chars[c] && grid[x+2][y+2] == chars[c] && grid[x+3][y+3] == chars[c])
                    return c+1;

    //diagonally R
    for (let x = 0; x <= 2; x++)
        for (let y = 3; y <= 6; y++)
            for (let c = 0; c < 2; c++)
                if (grid[x][y] == chars[c] && grid[x+1][y-1] == chars[c] && grid[x+2][y-2] == chars[c] && grid[x+3][y-3] == chars[c])
                    return c+1;

    //empty slot check
    for (let x = 0; x < 6; x++)
        for (let y = 0; y < 7; y++)
            if (grid[x][y] == '') //still an empty slot, and no has won, game not over yet
                return 0;

    return 3; //no empty slot, draw
}

function predictOpponentWin(grid, pN){ //grid is in the state after the main player has made the move
    let oppchar = 'x'; //if pN == 2
    if (pN == 1) //if pN == 1
        oppchar = 'o';

    //predict all possible moves of the opposing player and see if they can lead to a win
    for (let y = 0; y < 7; y++){ //possible cols
        const testGrid = updateGrid(copyGrid(grid), y, oppchar); //execute test move in a new copied grid EVERY Y
        if (testGrid != null){ //returns null for invalid move
            //console.log(testGrid); looks super cool lol
            const gs = getGridStatus(testGrid);
            if (gs != 0 && gs != pN){ //opposite player will be winning the game
                return 1; //danger
            }
        }
    }

    return 0; //no danger, either no one's winning or you are
}

function copyGrid(grid){
    let gridcopy = []
    for (let x = 0; x < 6; x++){
        gridcopy.push([...grid[x]]) //spread operator
    }
    return gridcopy;
}

function gridToStr(grid){ //string format for sending
    let gridStr = "";
    for (let x = 0; x < 6; x++){
        for (let y = 0; y < 7; y++){
            gridStr += grid[x][y] + ',';    
        }   
    }
    return gridStr;
}

function genericMessageHandler(pN, pchar, p1, p2, msg){
    let gid;
    if (pN == 1)
        gid = getGameID(p1);
    else
        gid = getGameID(p2);
    
    const msgParam = msg.split('%');
    const todo = msgParam[0]; //s or c
    const y = Number(msgParam[1]);
    if (todo == 'c'){ //just check and send back status
        const newGrid = updateGrid(copyGrid(game_list[gid]['grid']), y, pchar);
        if (newGrid != null){ //returns true for a valid move
            const ghint = predictOpponentWin(newGrid, pN);
            if (pN == 1)
                p1.send('%%'+ghint);
            else
                p2.send('%%'+ghint);
        }
        return;
    }
    if (game_list[gid]['turn'] == 0){ //someone pinged, and game was over, time to RESTART
        game_list[gid]['turn'] = 2;
        game_list[gid]['grid'] = copyGrid(starterGrid);
        const newGrid = game_list[gid]['grid'];
        const newGridStr = gridToStr(newGrid);
        p1.send('Game restarted! Player 2\'s turn.%'+newGridStr);
        p2.send('Game restarted! Your turn.%'+newGridStr);
        return;
    }
    else if (game_list[gid]['turn'] == pN){ //if player N's turn, make this true for debugging
        if (updateGameGrid(gid, y, pchar)){ //returns [] for an invalid move otherwise
            const newGrid = game_list[gid]['grid'];
            const newGridStr = gridToStr(newGrid);
            if (pN == 1){ //player 1's turn
                p1.send('Player 2\'s turn.%'+newGridStr);
                p2.send('Your turn.%'+newGridStr);
                game_list[gid]['turn'] = 2; //turn done
            }
            else{ //player 2's turn
                p1.send('Your turn.%'+newGridStr);
                p2.send('Player 1\'s turn.%'+newGridStr);
                game_list[gid]['turn'] = 1; 
            }

            const gs = getGridStatus(newGrid); //gameStatus
            if (gs == 1){
                p1.send('Player 1 has won!%');
                p2.send('Player 1 has won!%');
                game_list[gid]['turn'] = 0; //no one's turn (game over check)
            }
            else if (gs == 2){
                p1.send('Player 2 has won!%');
                p2.send('Player 2 has won!%');
                game_list[gid]['turn'] = 0;
            }
            else if (gs == 3){
                p1.send('It was a draw!%');
                p2.send('It was a draw!%');
                game_list[gid]['turn'] = 0;
            }
        }
    }
}

new ws.Server({server}).on('connection',client => { 
    if (cid % 2 != 0){ //second of the pair, ODD CLIENT
        let currgame_state = game_list[gidcounter] //get current game from games list, by using the cid (client num 4 would be in game 2 (3rd game)) 
        currgame_state['p2client'] = client; //update game with new client
        currgame_state['playing'] = true;
        game_list[gidcounter] = currgame_state; //update current game's state with any changes
        gidcounter++; //increment game ID for the next game to be added
        console.log(`Client ${cid} connected.`);
        
        const p1 = currgame_state['p1client']; //get corresponding player1 client for the game
        const p2 = client; // current client is p2 
        p1.send('Game started! Your turn.%');
        p2.send('Game started! Player 1\'s turn.%');

        p1.on('message', msg => { //received message from player 1
            genericMessageHandler(1, 'x', p1, p2, msg);
        })

        p2.on('message', msg => { //msg from player 2
            genericMessageHandler(2, 'o', p1, p2, msg);
        })

    }
    else{ //first of the pair connected, EVEN CLIENT only
        game_list.push({'p1client': client, 'p2client': null, 'playing': false, 'grid': copyGrid(starterGrid), 'turn': 1}); //gameID = even client id
        console.log(`Client ${cid} connected.`);
        
        client.on('message', _ => {
            if (!game_list[getGameID(client)]['playing']){ //if game is not playing, second player has not connected
                client.send('Please wait for someone to play with...%');
            }
        })
    }

    cid++
})