let log = console.log
console.log = () => {}

const q1 = require('./q1.js')
const q2 = require('./q2.js')
const q3 = require('./q3.js')
const q4 = require('./q4.js')
const q5 = require('./q5.js')
const q6 = require('./q6.js')
const q7 = require('./q7.js')
const q8 = require('./q8.js')

async function* test() {
    const equal = (e, t) => e === t || e && t && "object" == typeof e && "object" == typeof t && (Array.isArray(e) && Array.isArray(t) && t.every(t => e.includes(t)) && e.length == t.length || Object.keys(t).every(y => equal(e[y], t[y])) && Object.keys(e).length == Object.keys(t).length)

    yield new Promise(resolve => {
        process.on('beforeExit', () => setImmediate(() => resolve(false)))
        q1('questions', students => resolve(students ==
            '21100062, 21100063, 21100120, 21100164, 21100168, 21100174, 21100236, 21100246, 21100273, 21100276'))
    })

    yield new Promise(resolve => {
        process.on('beforeExit', () => setImmediate(() => resolve(false)))
        q2('questions', answers => resolve(equal(answers, {
            "21100062": {
                "Q1": "C",
                "Q3": "A",
                "Q2": "D",
                "Q5": "D",
                "Q4": "A",
                "Q7": "D",
                "Q6": "D",
                "Q9": "B",
                "Q8": "D",
                "Q10": "A"
            },
            "21100063": {
                "Q1": "A",
                "Q3": "A",
                "Q2": "B",
                "Q5": "C",
                "Q4": "B",
                "Q7": "D",
                "Q6": "A",
                "Q9": "A",
                "Q8": "D",
                "Q10": "D"
            },
            "21100120": {
                "Q1": "D",
                "Q3": "A",
                "Q2": "A",
                "Q5": "A",
                "Q4": "C",
                "Q7": "A",
                "Q6": "B",
                "Q9": "B",
                "Q8": "B",
                "Q10": "D"
            },
            "21100164": {
                "Q1": "C",
                "Q3": "C",
                "Q2": "C",
                "Q5": "B",
                "Q4": "D",
                "Q7": "B",
                "Q6": "A",
                "Q9": "B",
                "Q8": "A",
                "Q10": "D"
            },
            "21100168": {
                "Q1": "B",
                "Q3": "B",
                "Q2": "C",
                "Q5": "B",
                "Q4": "C",
                "Q7": "B",
                "Q6": "A",
                "Q9": "A",
                "Q8": "D",
                "Q10": "D"
            },
            "21100174": {
                "Q1": "C",
                "Q3": "D",
                "Q2": "D",
                "Q5": "B",
                "Q4": "A",
                "Q7": "D",
                "Q6": "A",
                "Q9": "D",
                "Q8": "C",
                "Q10": "A"
            },
            "21100236": {
                "Q1": "B",
                "Q3": "C",
                "Q2": "D",
                "Q5": "C",
                "Q4": "D",
                "Q7": "C",
                "Q6": "A",
                "Q9": "D",
                "Q8": "D",
                "Q10": "C"
            },
            "21100246": {
                "Q1": "C",
                "Q3": "A",
                "Q2": "D",
                "Q5": "C",
                "Q4": "B",
                "Q7": "B",
                "Q6": "A",
                "Q9": "A",
                "Q8": "C",
                "Q10": "D"
            },
            "21100273": {
                "Q1": "A",
                "Q3": "B",
                "Q2": "A",
                "Q5": "C",
                "Q4": "A",
                "Q7": "C",
                "Q6": "B",
                "Q9": "A",
                "Q8": "D",
                "Q10": "D"
            },
            "21100276": {
                "Q1": "C",
                "Q3": "B",
                "Q2": "C",
                "Q5": "C",
                "Q4": "D",
                "Q7": "A",
                "Q6": "C",
                "Q9": "A",
                "Q8": "B",
                "Q10": "D"
            }
        })))
    })

    yield new Promise(resolve => {
        process.on('beforeExit', () => setImmediate(() => resolve(false)))
        q3('questions', 'solution/key.txt', answers => resolve(equal(answers, {
            "21100062": 1,
            "21100063": 4,
            "21100120": 4,
            "21100164": 2,
            "21100168": 1,
            "21100174": 2,
            "21100236": 3,
            "21100246": 3,
            "21100273": 0,
            "21100276": 1
        })))
    })

    process.removeAllListeners(['beforeExit'])
    yield Promise.resolve(q4('sections')).then(sections => equal(sections, {
        "section1": ["21100025", "21100034", "21100063", "21100128", "21100130", "21100152", "21100180", "21100205", "21100276"],
        "section2": ["21100065", "21100067", "21100075", "21100082", "21100145", "21100154", "21100167", "21100180", "21100230", "21100261"],
        "section3": ["21100034", "21100037", "21100041", "21100061", "21100082", "21100135", "21100145", "21100168", "21100186", "21100287"],
        "section4": ["21100135", "21100137", "21100143", "21100216", "21100217", "21100237", "21100261", "21100265", "21100270", "21100283"],
        "section5": ["21100012", "21100017", "21100023", "21100034", "21100036", "21100065", "21100068", "21100128", "21100135", "21100165"]
    }, "Correct answer!"))

    yield await equal(q5('sections', 'solution\\key.txt'), {
        "section1": {
            "21100025": 4,
            "21100034": 3,
            "21100063": 3,
            "21100128": 3,
            "21100130": 6,
            "21100152": 2,
            "21100180": 3,
            "21100205": 4,
            "21100276": 3
        },
        "section2": {
            "21100065": 2,
            "21100067": 2,
            "21100075": 3,
            "21100082": 3,
            "21100145": 0,
            "21100154": 3,
            "21100167": 0,
            "21100180": 0,
            "21100230": 1,
            "21100261": 2
        },
        "section4": {
            "21100135": 3,
            "21100137": 1,
            "21100143": 6,
            "21100216": 4,
            "21100217": 1,
            "21100237": 2,
            "21100261": 2,
            "21100265": 1,
            "21100270": 2,
            "21100283": 5
        },
        "section3": {
            "21100034": 2,
            "21100037": 4,
            "21100041": 1,
            "21100061": 3,
            "21100082": 0,
            "21100135": 3,
            "21100145": 4,
            "21100168": 3,
            "21100186": 2,
            "21100287": 2
        },
        "section5": {
            "21100012": 3,
            "21100017": 1,
            "21100023": 3,
            "21100034": 0,
            "21100036": 3,
            "21100065": 4,
            "21100068": 2,
            "21100128": 6,
            "21100135": 1,
            "21100165": 3
        }
    })

    yield await equal(q6('sections', 'solution\\key.txt'), {
        "section1": {
            "min": 0,
            "max": 6
        },
        "section4": {
            "min": 1,
            "max": 6
        },
        "section3": {
            "min": 0,
            "max": 4
        },
        "section2": {
            "min": 0,
            "max": 3
        },
        "section5": {
            "min": 0,
            "max": 6
        }
    })

    yield await equal(q7('sections', 'solution\\key.txt'), {
        "section1": {
            "min": 0,
            "max": 6
        },
        "section4": {
            "min": 1,
            "max": 6
        },
        "section3": {
            "min": 0,
            "max": 4
        },
        "section2": {
            "min": 0,
            "max": 3
        },
        "section5": {
            "min": 0,
            "max": 6
        }
    })

    yield equal(await q8('sections', 'solution\\key.txt'), {
        "section1": [],
        "section4": [],
        "section2": [
            ["21100067", "21100180"],
            ["21100167", "21100230"],
            ["21100180", "21100067"],
            ["21100230", "21100167"]
        ],
        "section3": [],
        "section5": []
    })
}

(async() => {
    let part = 0
    for await (b of test()) {
        log(`Part ${++part} ${b?'passes':'does not pass'} the test case`)
    }
    log('\nRemember that passing the test case does not mean that the solution is correct.  You have to satisfy all requirements in the question and your code must not be hard-coded for this one example.')
})()

