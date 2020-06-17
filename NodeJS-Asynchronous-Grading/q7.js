/*
---------------------------------------------------------------------------------------------------------
The instructor doesn't like the style of your programming.  So he asks you to redo the last exercise.
---------------------------------------------------------------------------------------------------------
*/

//The appropriate modules have already been added as follows:
const fs = require('fs')
const path = require('path')

// For this task you will be async/await <-------------- IMPORTANT!!
// You may use code from the previous parts BUT NO CODE USING CALLBACKS/PROMISES
// You can use Promise.all but no use of the "then" handler or of "new Promise"

//You may use the following function to help you:
//JSON.parse()
//Math.min()
//Math.max()
const readDir = d => new Promise((res, rej) => fs.readdir(d, (e, files) => e?rej(e):res(files)))
const readFile = f => new Promise((res, rej) => fs.readFile(f, 'utf8', (e, data) => e?rej(e):res(data)))

// sections is the path to directory containing student quizzes organized by section, solution is the path to solution file.  the function should return a promise that is resolved with an associative array where the keys are sections and each value is an associative array with two keys, "min" and "max" and the corresponding minimum or maximum score of that section as the value.  See the test case below for example format.

const get_max_min = async (sections, solution) => {
	//add code here
	const sectArray = {};
	solstr = await readFile(solution);
	solJSON = JSON.parse(solstr);
	slist = await readDir(sections);
	await Promise.all(slist.map(async sfolder =>{
		rollNumList = await readDir(path.join(sections, sfolder));
		fileList = await Promise.all(rollNumList.map(async rollNum =>{
				qs = await readFile(path.join(path.join(sections,sfolder),rollNum));
				qJSON = JSON.parse(qs);
				score = 0;
				for (var key in qJSON)
					if (qJSON[key] == solJSON[key])
						score++;
				return score;
			})
		)	
		minOfList = fileList[0];
		maxOfList = fileList[0];
		for(i = 0; i < fileList.length; i++){
			minOfList = Math.min(minOfList, fileList[i]);
			maxOfList = Math.max(maxOfList, fileList[i]);
		}
		sectArray[sfolder] = {min : minOfList, max : maxOfList};
	}))
	return sectArray;
}




module.exports = get_max_min

get_max_min('sections', 'solution/key.txt').then((d) => console.log(d))
