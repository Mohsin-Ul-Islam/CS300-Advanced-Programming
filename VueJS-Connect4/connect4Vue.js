function strToGrid(gridStr){
    const gridArr = gridStr.split(',');
    const grid = [];
    let i = 0;
    for (let x = 0; x < 6; x++){
        grid.push([]);
        for (let y = 0; y < 7; y++){
            grid[x].push(gridArr[i]);
            i++;     
        }   
    }
    return grid;
}

let lastTarget;

function highlightTargetCol(targ, hlcolor){
    lastTarget = targ;
    const gridtable = targ.parentNode.parentNode;
    const y = targ.cellIndex;
    for (let x = 0; x < 6; x++){
        gridtable.rows[x].cells[y].style.backgroundColor = hlcolor;
    }
}

new Vue({   
    template:`    
    <div>
        <h3>{{gameMsg}}</h3>
        <table>
            <tr v-for="row in grid">
            <td v-on:mouseover='checkCol' v-on:mouseleave='leaveCol' v-on:click='sendPos' v-for="piece in row">
                {{piece}}
            </td>
            </tr>
        </table>
    </div>
    `,

    data: {
        hlcolor: "rgb(91, 173, 135)",
        gameMsg: 'Waiting...',
        grid: [['','','','','','',''],['','','','','','',''],['','','','','','',''],['','','','','','',''],['','','','','','',''],['','','','','','','']], //grid matrix
        //gridHTML: ['','','','','','',''],
        ws: new WebSocket('ws://localhost:5000') 
    },
    methods:{ 
        async sendPos(click){
            //(click.target) == td, get cellIndex for y
            this.ws.send('s%'+click.target.cellIndex);
        },
        async checkCol(mouseover){
            this.ws.send('c%'+mouseover.target.cellIndex);
            highlightTargetCol(mouseover.target, this.hlcolor);
        },
        async leaveCol(mouseleave){
            highlightTargetCol(mouseleave.target, "");
        }
    },
    mounted() { //when the page is loaded (template has been mounted)
        //this.gridHTML = gridToHTML(this.grid);
        this.ws.onmessage = event => { //websocket.onmessage = recieving a message from websocket (server)
            //websocket response == 'event' JSON
            //console.log(event.data);
            gamedata = event.data.split('%');
            if (gamedata.length == 3){ //extra msg for color
                if (gamedata[2] == 1){ //danger
                    this.hlcolor = "rgb(114, 65, 65)"; //red
                    highlightTargetCol(lastTarget, this.hlcolor);
                }
                else{ //no danger
                    this.hlcolor = "rgb(91, 173, 135)";//green
                    highlightTargetCol(lastTarget, this.hlcolor);
                }
            }

            if (gamedata[0] != '')
                this.gameMsg = gamedata[0];
            
        
            if (gamedata[1] != '')
                this.grid = strToGrid(gamedata[1]);
        }
    }

}).$mount(root) //mount this Vue object to tag with id="root"