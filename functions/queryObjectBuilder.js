const parser = require('./parser')
let tester = parser.parseVariables('artist(id: "mark-rothko")', ['id', 'name'], ['size'])

//the goal of trunqify variables is to take the variables out of the parenthesis and turn it into the appropriate object
let trunqifyVariables = (parserOutput) => {
    //start with an empty object
    let trunQVariables = {}
    //loop over these guys and put them into trunQ
    let uniques = Object.keys(parserOutput[1].uniques)
    let limits = Object.keys(parserOutput[1].limits)

    uniques.forEach(key => {
        trunQVariables[key] = parserOutput[1].uniques[key]
    })
    limits.forEach(key => {
        trunQVariables[key] = parserOutput[1].limits[key]
    })
    return trunQVariables
}

let input = [ 
    { 'artist(id: "mark-rothko")': 1,
        'name artworks (name: "chapel" size: 2)': 2,
            'id imageUrl': 3,
        bullshit: 2 
    },

    { jazzsaxartist: 1, 
        name2: 2 
    } 
]

let fieldsToObject = (arr, uniques=[], limits = []) => {
    let output = {}
    let levels = []
    let previousLevel = 0;

    for (let z =0; z<arr.length; z++) {
        let latestQuery = ''
        let input = arr[z]
        let keysArr = Object.keys(input)
        let dummyObj = output

        for (let i=0; i<keysArr.length; i++) {
            console.log('iteration', i)
            let curr = keysArr[i]
            dummyObj = output;
            // console.log(curr);
            if (input[curr] === 1) {
                let parensReg =/\(([^()]*)\)/
                if (parensReg.test(curr)) {
                    let parsedArr = parser.parseVariables(curr, uniques, limits);
                    let uniqueKey = parsedArr[0];
                    output[uniqueKey] = {};
                    levels.push(uniqueKey);
                    output[uniqueKey].trunQVariables = trunqifyVariables(parsedArr);
//right here - add trunQarray based on size

                    output[uniqueKey][parsedArr[1].query] = {};
                    levels.push(parsedArr[1].query);
                    
                }
                else {
                    //lastly give it the original query aka "artist"
                    output[curr] = {};
                    output[curr][curr] = {};
                    levels.push(curr);
                    levels.push(curr);
                }
            }
            else if (input[curr] > 1) {
                //if prevlevel is greater than pop

                if (previousLevel > input[curr]) levels.pop();
                let parensReg =/\(([^()]*)\)/
                let objectReferencefromArray = levels[input[curr] - 1]
                let temp = ''
                for (let i = 0; i < levels.length; i += 1) {
                    // console.log("LEVELS IN LOOP", levels[i])
                    // console.log("Before", dummyObj);
                    dummyObj = dummyObj[levels[i]];
                    // console.log("After", dummyObj);
                }
                for (let j = 0; j < curr.length; j += 1) {
                    if (curr[j] === ' ') {
                        dummyObj[temp] = {}
                        latestQuery = temp
                        temp = ''
                    }
                    else if(curr[j] === '(') {
                        let parsedArr = parser.parseVariables(curr, uniques, limits)
                        dummyObj[latestQuery].trunQVariables = trunqifyVariables(parsedArr)
                        //right here - add trunQarray based on size
                            //if within trunqvariables exists a limits variable
                            //create a trunqArray of equivalent size feeding it the correct
                        j = curr.length+1
                        levels.push(latestQuery)
                    }
                    else {
                        temp += curr[j]
                    }

                    if(j === curr.length-1) {
                        dummyObj[temp] = {}
                    }
                }
                // console.log("dummy", levels[levels.length-1], dummyObj);
            }
            // console.log("OUTPUT", output);
            console.log(levels)

            previousLevel = input[curr];
        }
        levels=[]
    }
    return output
}

let test = fieldsToObject(input, ['id', 'name'], ['size'])
console.log(test)

//this is the final output
const emptyCacheObjFromQuery2 = { 
    "artist-mark-rothko": {
        trunQVariables: {
            id: 'mark-rothko'
        },
        artist: {
            name: {},
            artworks: {
                trunQVariables: {
                    id: "chapel",
                    size: 2
                },
                trunQarrays: 
                    [{id: {}, imageUrl1: {}},
                    {id2: {}, imageUrl2: {}}]
            },
            bullshit: {}
        }
    },
    "jazzsaxartist": {
      jazzsaxartist: {
          name2: {}
      }
    }
  }