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
    //declare object to output
    let dummyObj = {}
    let output = {}
    let levels = []
    let count = -1
    //declare current level we are on
    for (let z =0; z<arr.length; z++) {
        let latestQuery = ''
        let input = arr[z]
        let keysArr = Object.keys(input)
        
        for (let i=0; i<keysArr.length; i++) {
            let curr = keysArr[i]
            //if level 1 run parser and set the result as a key
               //declare the top key as the level 1 string that we just put in
            if (input[curr] === 1) {
        
                //if there are parenthesis -fill that unique key object with trunqified variables
                    //regex test for (anythinginside)
                let parensReg =/\(([^()]*)\)/
                if (parensReg.test(curr)) {
                    let parsedArr = parser.parseVariables(curr, uniques, limits)
                    let uniqueKey = parsedArr[0]
                    output[uniqueKey] = {}
                    output[uniqueKey].trunQVariables = trunqifyVariables(parsedArr)
                    output[parsedArr[1].query] = {}
                }
                else {
                    //lastly give it the original query aka "artist"
                    output[curr] = {}
                    output[curr][curr] = {}
                }
            }
    
            if (input[curr] > 1) {
                //loop through letter by letter until you hit a space
                //on spaces push your temp string into the output object with the value {}
                    //also update latestQuery to the temp and reset temp
                let temp = ''
                for (let j=0; j<curr.length; j++) {
                    if (curr[j] === ' ') {
                        output[temp] = {}
                        latestQuery = temp
                        temp = ''
                    }
                    //if you hit the parens you're at the end. parse and input into trunqify the result
                    //trunqify will give you an object to set as the value 
                    //the key will be your stored latestQuery
                    else if(curr[j] === '(') {
                        let parsedArr = parser.parseVariables(curr, uniques, limits)
                        output[latestQuery].trunQVariables = trunqifyVariables(parsedArr)
                        j = curr.length+1
                        levels.push(latestQuery)
                    }
                    else {
                        temp += curr[j]
                    }

                    if(j === curr.length-1) {
                        output[temp] = {}
                    }

                }
            }
        }      
    }
    return output
}

let test = fieldsToObject(input, ['id', 'name'], ['size'])
console.log(test['artist-mark-rothko'])

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
        }
    }
      
    },
    "jazzsaxartist": {
      data: {
          name: {}
      }
    }
  }