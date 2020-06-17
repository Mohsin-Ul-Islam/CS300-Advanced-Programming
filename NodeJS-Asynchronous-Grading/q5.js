/*
---------------------------------------------------------------------------------------------------------
WOOHHOOOOOO!!!!
The instructor is ready to hire you.  He will be getting the paperwork ready.  While he is at it, he has asked you to mark those sections.  He has given you the key to them as well.  Since you have progressed in life so much in such little time, you will be making sure you get that job.  Let's go!
---------------------------------------------------------------------------------------------------------
*/

// The appropriate modules have already been added as follows:
const fs = require('fs')
const path = require('path')

// For this task you will be using ONLY 'Promise' <--------- IMPORTANT!!!!!!!!!!!
// Make sure you DO NOT use async/await <--------- IMPORTANT!!!!!!!!!!!

// You will need the following function to help you:
// path.join(path, filename) 
// JSON.parse()
const readDir = d => new Promise((res, rej) => fs.readdir(d, (e, files) => e?rej(e):res(files)))
const readFile = f => new Promise((res, rej) => fs.readFile(f, 'utf8', (e, data) => e?rej(e):res(data)))

// Tip: Feel free to use code from the previous part BUT NO CODE USING CALLBACKS

const get_student_grades = (sections, solution) => {
	//add code here
	const sectArray = {}
	return readFile(solution).then(solstr =>{ 	//first read the solution
		solJSON = JSON.parse(solstr);
		return readDir(sections).then(slist=>
			Promise.all(slist.map(sfolder =>
					readDir(path.join(sections, sfolder)).then(rollNumList => {
						const studentScores = {}
						return Promise.all(rollNumList.map(rollNum =>
                            readFile(path.join(path.join(sections,sfolder),rollNum)).then(qs => {
                                qJSON =JSON.parse(qs);
                                score = 0;
                                for (var key in qJSON)
                                    if (qJSON[key] == solJSON[key])
                                        score++;
                                studentScores[rollNum] = score;
                            })
						)).then(()=> {sectArray[sfolder] = studentScores;})
					})
			)).then(() => sectArray)
		);
	});
}

module.exports = get_student_grades

get_student_grades('sections','solution\\key.txt').then(x=>console.log(x))
