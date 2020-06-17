/*
---------------------------------------------------------------------------------------------------------
Impressive!  So far so good.
You have earned your instructor's trust and so he has given you the solution to the questions.  Don't let him down and get him the marks for each student as soon as possible!
---------------------------------------------------------------------------------------------------------
*/

// The appropriate modules have already been added as follows:
const fs = require('fs')
const path = require('path')

// For this task you will be using ONLY 'callbacks()' <--------- IMPORTANT!!!!!!!!!!!
// You will need the following function to help you:
// fs.readdir(path, callback(err,list))
// fs.readFile(path,'utf8',callback(err,data))
// path.join(path, filename) 
// JSON.parse()

// Tip: Feel free to use code from the previous part

// questions is the path to the directory with questions, solutions is the file containing solutions, and callback is the function to be called with the associtive array containing student roll numbers as keys and their scores as values
const get_student_scores = (questions, solutions, callback) => {
	//add code here
	fs.readdir(questions, (err,list)=> { // callback
		if (err) {
			console.log("Error while reading directory: " + err);
		}
		else {
			list.sort();
			const studentScores = {};
			let filesLeft = list.length;
			// first read the solutions file, before comparing students
			fs.readFile(solutions, 'utf8', (err,soldata)=> {
				if (err){
					console.log("Error reading solutions file. " + err)
				}
				else
				{	
					solJSON = JSON.parse(soldata);
					list.forEach(rollnum => {
						const qpath = path.join(questions, rollnum); //qs path for that rollnum	
						fs.readFile(qpath, 'utf8', (err, qdata)=> {
							if (err){
								console.log(qpath + " - Error reading file. " + err)
							}
							else{
								const qJSON = JSON.parse(qdata);
								score = 0;
								for (var key in qJSON){
									// if corresponding q's value in soldata matches that of student's, add to score
									if (qJSON[key] == solJSON[key]){
										score++;
									}
								}
								studentScores[rollnum] = score;
								if (--filesLeft == 0){ // on the last file and it has been read
									callback(studentScores);
								}
							}
						});
					});
				}
			});
		}
	});
}

get_student_scores ('questions','solution/key.txt',function(x){ 
	console.log(x);
})

module.exports = get_student_scores

