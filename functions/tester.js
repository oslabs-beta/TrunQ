let parser = {}

let createUniqueKey = (queryVariablesObject) => {
    let keyString = queryVariablesObject.query;

    Object.values(queryVariablesObject.uniques).forEach(uniqueValue => {
        keyString += "-" + uniqueValue;
    })
    return keyString.replace(/[\s]/g, '')
}

let startIndexFinder = (varStr, varsArr) => {
    //first sort the varsArr by length of string
    varsArr.sort((a,b) => b.length - a.length)
    //second find starting index of longest string
    let indexArr = []
    let blackList = []
    for (var i=0; i<varsArr.length; i++) {
        let currStr = varsArr[i]
        let startingI = varStr.indexOf(currStr)

        //if the variable doesn't even exist move on to the next one
        if (startingI === -1) continue;
        //while startingI is not blackListed push it into indexArr
        while (blackList.includes(startingI)) {
            startingI = varStr.indexOf(currStr, startingI+1)
        }
        indexArr.push(startingI)

        //loop over and blackList the indexes that are part of the str
        for (var j=0; j<currStr.length; j++) {
            blackList.push(startingI+j)
        }
    }
    return indexArr.sort((a,b) => a-b)
}

parser.startIndexFinder = (varStr, varsArr) => {
    //first sort the varsArr by length of string
    varsArr.sort((a,b) => b.length - a.length)
    //second find starting index of longest string
    let indexArr = []
    let blackList = []
    for (var i=0; i<varsArr.length; i++) {
        let currStr = varsArr[i]
        let startingI = varStr.indexOf(currStr)

        //if the variable doesn't even exist move on to the next one
        if (startingI === -1) continue;
        //while startingI is not blackListed push it into indexArr
        while (blackList.includes(startingI)) {
            startingI = varStr.indexOf(currStr, startingI+1)
        }
        indexArr.push(startingI)

        //loop over and blackList the indexes that are part of the str
        for (var j=0; j<currStr.length; j++) {
            blackList.push(startingI+j)
        }
    }
    return indexArr.sort((a,b) => a-b)
}

parser.createUniqueKey = (queryVariablesObject) => {
    let keyString = queryVariablesObject.query;

    Object.values(queryVariablesObject.uniques).forEach(uniqueValue => {
        keyString += "-" + uniqueValue;
    })
    return keyString.replace(/[\s]/g, '')
}


//step 1 - pull a unique key out using regex from the top of the query
    //use a regex that will only match ** ('anything inside') **
    //developer inputs unique arguments that will be attached to the key
parser.parseVariables = (query, uniques=[], limits=[]) => {

    //return this object full of variables and queryName
    let output = {
        uniques: {},
        limits: {}
    }

    //declare our regex
    let varFinder = /[\w]* *\(([^()]+)\)/
    
    //run match and use the first value of the array because match acts weird

    // edge case of if no variables
    // something like if (uniques.length === 0 && limits.length === 0) don't execute variable stuff

    let varString = query.match(varFinder)[0]
    
    //now we have a string 'pokemon(name: "pikachu")'.
    //step 1 is to take out pokemon as the first part of the var
    let variableArray = varString.split('(') 
    output.query = variableArray[0]

    //step 2 is to parse out all the search variables included
    let varStr = variableArray[1].substring(0,variableArray[1].length-1)
    // console.log(varStr)
    //variables now equals the string "name: "pikachu" id:2size:2)"

    //we need the variables sorted by length to deal with edge case ("id", "ssid") returning bad searches
    //find the starting index of each variable - you'll know when you've gotten the full
        //variable when you hit the next starting index
    let indexes = startIndexFinder(varStr, [...uniques, ...limits])

    //loop through the array with the starting indexes pushing temps as we go
    let stringifiedKeyValues = []
    for (var i=0; i<indexes.length; i++) {
        let curr = indexes[i]
        if (i === indexes.length-1) stringifiedKeyValues.push(varStr.substring(curr).trim())
        else stringifiedKeyValues.push(varStr.substring(curr,indexes[i+1]).trim())
    }

    //now that we have an array that looks like [ 'name: "pikachu"', 'id:2', 'size:2' ]
    //we should split this along the ":" colons, trim, then set our output object
    //keys and values
    stringifiedKeyValues.forEach(str => {
        let temp = str.split(':').map(x => {
            x = x.trim().replace(/"/g, '')
            if (!isNaN(Number(x))) x = Number(x)
            return x
        })
        if (limits.includes(temp[0])) {
            output.limits[temp[0]] = temp[1]
        }
        else {
            output.uniques[temp[0]] = temp[1];
        }
    })

    return [createUniqueKey(output), output];
}

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
    let output = {}
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
                    
                    output[uniqueKey].trunQVariables = trunqifyVariables(parsedArr)
                }
                else {
                    //lastly give it the original query aka "artist"
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
                    }
                    else {
                        temp += curr[j]
                    }

                    if(j === curr.length-1) output[temp] = {}

                }
            }
        }        
    }
    return output
}

console.log(fieldsToObject(input, ['id', 'name'], ['size']))
