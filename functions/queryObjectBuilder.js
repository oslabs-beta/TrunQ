import parser from './parser'

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
  
let searchTrunQ = (trunQVariables, limits) => {
    let trunQNum = 0;
    limits.forEach(limit => {
        if(trunQVariables[limit]) trunQNum = trunQVariables[limit]
    })
    return trunQNum 
}
  
function innerTrunQify (output, levels, trunQSize, keysArr, i, uniques, limits, latestQuery) {
    let curr = keysArr[i]
    let dummyObj = output
    for (let z = 0; z < levels.length; z += 1) {
        dummyObj = dummyObj[levels[z]];
        // console.log(dummyObj, levels[z]);
    }
    for (let k = 0; k < trunQSize; k += 1) {
        let temp = ''
        let tempObj = {}
        let innertrunQSize = 0;
        for (let j = 0; j < curr.length; j += 1) {
            if (curr[j] === ' ') {
                tempObj[temp] = {}
                latestQuery = temp
                temp = ''
            }
            else if(curr[j] === '(') {
  
                let parsedArr = parser.parseVariables(curr, uniques, limits)
                let trunQVars = trunqifyVariables(parsedArr)
                tempObj[latestQuery].trunQVariables = trunQVars
                //right here - add trunQarray based on size
                    //if within trunqvariables exists a limits variable
                    //create a trunqArray of equivalent size feeding it the correct
                innertrunQSize = searchTrunQ(trunQVars, limits);
                // console.log("TRUNQSIZE", trunQSize)
                j = curr.length + 1
                levels.push(latestQuery)
                if (innertrunQSize > 0) {
                    tempObj[latestQuery].trunQLimits = []
                    i++;
                    i = innerTrunQify (tempObj[latestQuery], levels, innertrunQSize, keysArr, i, uniques, limits, latestQuery)
                    trunQSize = 0;
                }
                //maybe run another iteration of this if innertrunqsize is greater than 0
            }
            else {
                temp += curr[j]
            }
            if(j === curr.length-1) {
                tempObj[temp] = {}
            }
        }
        dummyObj.trunQLimits.push(tempObj)
    }
    levels.pop();
    return i;
  }
  
  
  
let queryObjectBuilder = (arr, uniques=[], limits = []) => {
    let output = {}
    let levels = []
    let previousLevel = 0;
    let trunQSize = 0;
  
    for (let z =0; z<arr.length; z++) {
        let latestQuery = ''
        let input = arr[z]
        let keysArr = Object.keys(input)
        let dummyObj = output
  
        for (let i=0; i<keysArr.length; i++) {
            // console.log('iteration', i)
            let curr = keysArr[i]
            dummyObj = output;
            // console.log(curr);
            if (input[curr] === 1) {
                let parensReg =/\(([^()]*)\)/
                if (parensReg.test(curr)) {
                    let parsedArr = parseVariables(curr, uniques, limits);
                    let uniqueKey = parsedArr[0];
                    output[uniqueKey] = {};
                    levels.push(uniqueKey);
                    let trunQVars = trunqifyVariables(parsedArr);
                    output[uniqueKey].trunQVariables = trunQVars
  //right here - add trunQarray based on size
                    trunQSize = searchTrunQ(trunQVars, limits);
                    // console.log("TRUNQSIZE", trunQSize)
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
            else if (input[curr] > 1 && trunQSize === 0) {
                //if prevlevel is greater than pop
                if (previousLevel > input[curr]) levels.pop();
                let temp = ''
                for (let i = 0; i < levels.length; i += 1) {
                    dummyObj = dummyObj[levels[i]];
                }
                for (let j = 0; j < curr.length; j += 1) {
                    if (curr[j] === ' ') {
                        dummyObj[temp] = {}
                        latestQuery = temp
                        temp = ''
                    }
                    else if(curr[j] === '(') {
                        dummyObj[temp] = {}
                        latestQuery = temp
                        temp = ''
                        let parsedArr = parseVariables(curr, uniques, limits)
                        let trunQVars = trunqifyVariables(parsedArr)
                        dummyObj[latestQuery].trunQVariables = trunQVars
                        //right here - add trunQarray based on size
                            //if within trunqvariables exists a limits variable
                            //create a trunqArray of equivalent size feeding it the correct
                        trunQSize = searchTrunQ(trunQVars, limits);
                        if (trunQSize > 0) dummyObj[latestQuery].trunQLimits = []
                        j = curr.length + 1
                        levels.push(latestQuery)
                    }
                    else {
                        temp += curr[j]
                    }
                    if(j === curr.length-1) {
                        dummyObj[temp] = {}
                        previousLevel = input[curr]
                    }
                }
            }
            else if (input[curr] === 1 && trunQSize > 0) {
  
            }
            else if (input[curr] > 1 && trunQSize > 0) {
                i = innerTrunQify (output, levels, trunQSize, keysArr, i, uniques, limits, latestQuery)
                trunQSize = 0;
            }
        }
        levels=[]
    }
    return output
}

export default queryObjectBuilder  
