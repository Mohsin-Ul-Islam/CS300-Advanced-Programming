/*
---------------------------------------------------------------------------------------------------------
Not bad for a rookie.  Instructor has decided to hire you now and that too as his research assistant but he still has his doubts.  So now he has given you quizzes from a couple of sections.  He wants you to figure out a way to list down student rollnumbers and categorise them under relevant sections.  Having progressed this far, you accept. 
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
// promise based readDir with lambda function
const readDir = d => new Promise((res, rej) => fs.readdir(d, (e, files) => e?rej(e):res(files)))
const readFile = f => new Promise((res, rej) => fs.readFile(f, 'utf8', (e, data) => e?rej(e):res(data)))

// Tip: Feel free to use code from the previous part BUT NO CODE USING CALLBACKS

// sections is the path to directory where all student quizzes are stored organized by their sections.  You can explore the directory to see the structure.  You return a Promise which is resolved with a single associative map where the keys are section names (which are just directory names inside the sections directory) and values are arrays of student roll numbers (which are just file names inside the respective section's directory).
const get_student_sections = sections => {
	//add code here
	const sectArray = {};
	return readDir(sections).then(slist=>
		Promise.all(
			slist.map(sfolder => readDir(path.join(sections, sfolder)
			).then(fileList =>{
				sectArray[sfolder] = fileList;
			}))
		).then(() => sectArray)
	);
}
	
module.exports = get_student_sections

get_student_sections('sections').then(x=>console.log(x))