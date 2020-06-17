/*
---------------------------------------------------------------------------------------------------------
Ok since the instructor has gone out of his way to do all the documentations himself for you.  You feel kinda nice.  So you have decided to make his grading even easier.  You will be calculating the highest and minimum score for each section. 
---------------------------------------------------------------------------------------------------------
*/

//The appropriate modules have already been added as follows:
const fs = require('fs')
const path = require('path')

//For this task you will be using ONLY 'Promise' <--------- IMPORTANT!!!!!!!!!!!
//Make sure you DO NOT use async/await <--------- IMPORTANT!!!!!!!!!!!

//You may use the following function to help you:
//JSON.parse()
//Math.min()
//Math.max()
const readDir = d => new Promise((res, rej) => fs.readdir(d, (e, files) => e?rej(e):res(files)))
const readFile = f => new Promise((res, rej) => fs.readFile(f, 'utf8', (e, data) => e?rej(e):res(data)))

//Tip: Feel free to use code from the previous part BUT NO CODE USING CALLBACKS

// sections is the path to directory containing student quizzes organized by section, solution is the path to solution file.  the function should return a promise that is resolved with an associative array where the keys are sections and each value is an associative array with two keys, "min" and "max" and the corresponding minimum or maximum score of that section as the value.  See the test case below for example format.

const get_max_min = (sections, solution) => {
	//add code here
	const sectArray = {}
	return readFile(solution).then(solstr =>{
		solJSON = JSON.parse(solstr);
		return readDir(sections).then(slist=>
			Promise.all(slist.map(sfolder =>
				readDir(path.join(sections, sfolder)).then(rollNumList =>
					Promise.all(rollNumList.map(rollNum =>
							readFile(path.join(path.join(sections,sfolder),rollNum)
							).then(qs => {
								qJSON =JSON.parse(qs);
								score = 0;
								for (var key in qJSON)
									if (qJSON[key] == solJSON[key])
										score++;
								return score;
							})
						)
					).then(fileList =>{
						minOfList = fileList[0];
						maxOfList = fileList[0];
						for(i = 0; i < fileList.length; i++){
							minOfList = Math.min(minOfList, fileList[i]);
							maxOfList = Math.max(maxOfList, fileList[i]);
						}
						sectArray[sfolder] = {min : minOfList, max : maxOfList};
					})
				)
			)).then(_ => sectArray)
		);
	});
}

module.exports = get_max_min

get_max_min('sections', 'solution/key.txt').then((d) => console.log(d))
