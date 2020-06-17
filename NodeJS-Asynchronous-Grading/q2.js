/*
---------------------------------------------------------------------------------------------------------
Great Job!
Next up, the instructor wants you to work even more.  Now he wants to see if you are able to open files and somehow make sense of them.
---------------------------------------------------------------------------------------------------------
*/

// The appropriate modules have already been added as follows:
const fs = require('fs')
const path = require('path')

// For this task you will be using ONLY 'callbacks' (no PROMISES or ASYNC/AWAIT)
// You will need the following function to help you:
// fs.readdir(path, callback(err,list))
// fs.readFile(path,'utf8',callback(err,data))
// path.join(path, filename) 
// JSON.parse()
// Remember that Javascript has indexed arrays created like this:
// const a = []
// and associative arrays (called objects in Javascript) created like this:
// const b = {}
// You can add elements using a similar syntax but indexed arrays only allow integers as indices whereas associative array can be indexed with any string e.g.
// b['this-element'] = a[0]
// You can read more about both of them in the provided documentation

// Tip: Feel free to use code from the previous part

// questions is the path to the directory with questions.  Call the callback with an associative array where the keys are students' roll numbers and value is the parsed JSON data read from the corresponding file.
const get_student_answers = (questions, callback) => {
	//add code here
	fs.readdir(questions, (err,list)=> { // callback
		if (err) {
			console.log("Error while reading directory: " + err);
		}
		else {
			list.sort();
			const parsedQs = {};
			let filesLeft = list.length;
			list.forEach(rollnum => {
				fs.readFile(path.join(questions, rollnum), 'utf8', (err,data)=> {
					if (err){
						console.log(qpath + " - Error reading file. " + err)
					}
					else{
						parsedQs[rollnum] = JSON.parse(data);
						if (--filesLeft == 0){ // on the last file and it has been read
							callback(parsedQs);
						}
					}
				});
			});
		}
	});
}

get_student_answers ('questions',function(x){ 
	console.log(x);
})

module.exports = get_student_answers

