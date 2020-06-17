/*
---------------------------------------------------------------------------------------------------------
Ok there is a problem now.  Apparently, the administration is busy dealing with multiple DC accusations by TAs, instructors and even students.  There is a mayham everywhere.  So instead of laughing at how things have turned out everywhere, you act responsibly and decided to fix this problem.  You know how world works and after doing some research you figure out some rules where if two students meet the conditions then they might have cheated.

Rules:

-> Two students must of the same section
-> Two students will have more than 80% of their incorrect answers equal
-> Two students will have more than 50% of their overall answers equal

If two student meet these requiremenets, then they are to be investigated.

The one thing you've gotta do is that you need to always do the best you can do, no matter what the given situation, no matter what comes up against you.  You do the best you can do, and you never give up. Never quit.

And so believe, relax and keep moving forward!!!
---------------------------------------------------------------------------------------------------------
*/

// The appropriate modules have already been added as follows:
const fs = require('fs')
const path = require('path')

// For this task you will be async/await <-------------- IMPORTANT!!
// You may use code from the previous parts BUT NO CODE USING CALLBACKS (Promises based code from previous parts is fine)

// You will nee the following function to help you:
// path.join(path, filename) 
// JSON.parse()
const readDir = d => new Promise((res, rej) => fs.readdir(d, (e, files) => e?rej(e):res(files)))
const readFile = f => new Promise((res, rej) => fs.readFile(f, 'utf8', (e, data) => e?rej(e):res(data)))

const countcustom = (assocArr, val) => {
    var c = 0;
    for (var key in assocArr){
        if (assocArr[key][1] == val){
            c++;
        }
    }
    return c;
}

const get_suspects = async (sections, solution) => {
    const solJSON = JSON.parse(await readFile(solution))
	const sectArr = {}
    slist = await readDir(sections);
	await Promise.all(slist.map(async sfolder =>{
        const RFL = {}; // rollnumber marked file list
        rollNumList = await readDir(path.join(sections, sfolder));
		fileList = await Promise.all(rollNumList.map(async rollNum =>{
				qs = await readFile(path.join(path.join(sections,sfolder),rollNum));
				qJSON = JSON.parse(qs);
				for (var key in qJSON){
                    if (qJSON[key] == solJSON[key]){
                        qJSON[key] = [qJSON[key], 1]; //correct
                    }
                    else{
                        qJSON[key] = [qJSON[key], 0]; //incorrect
                    }
                }
				RFL[rollNum] = qJSON;
			})
        );
        //RFL for this section only, so we can now compare student's answers
        var sectionInvList = [] //investigation list for pairs of roll numbers for that section
        for (var rn1 in RFL){
            for (var rn2 in RFL){
                if (rn2 != rn1){ // comparing roll1 with roll2
                    rn1Incorrect = countcustom(RFL[rn1], 0);
                    rn2Incorrect = countcustom(RFL[rn2], 0);
                    incorrEqual = 0; 
                    ansEqual = 0;
                    for (var q in RFL[rn1]){ // for every question in rolll number 1;s list
                        if (RFL[rn1][q][0] == RFL[rn2][q][0]){ // both picked the same choice
                            ansEqual++;
                            if (RFL[rn1][q][1] == 0){ //they both had incorrect answers for this
                                incorrEqual++;
                            }
                        }
                    }
                    rule2 = (incorrEqual/rn1Incorrect) >= 0.75 || (incorrEqual/rn2Incorrect) >= 0.75; 
                    // assuming both must have > 80% of their incorrect answers equal not just one
                    rule3 = ansEqual/10 > 0.5; // 10 == totalQs
                    if (rule2 && rule3){ //we're already checking for students of the same section
                        sectionInvList.push([rn1, rn2]);
                    } 
                    // if (rn1 == "21100067" && rn2=="21100180"){
                    //     console.log ("For",rn1, rn2);
                    //     console.log(RFL[rn1])
                    //     console.log(RFL[rn2])
                    //     console.log(incorrEqual, rn1Incorrect, rn2Incorrect);
                    // }
                }
            }
            // delete RFL[rn1]; // has been checked, can uncommented to produce unique results
        }
        sectArr[sfolder] = sectionInvList;
    }));
    return sectArr;
}

module.exports = get_suspects

get_suspects('sections', 'solution/key.txt').then(x=>console.log(x))
