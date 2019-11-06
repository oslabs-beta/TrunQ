/**
* ***********************************
*
* @module keyedQueries
* @author Ben Ray, Brian Haller 
* @date 11/5/2019
* @params query (string), uniques (array), limits(array)
* 
* @description takes a graphQL query from a client and deconstructs it into basic info within an array. It will take a shape like:
*            
*                   UniqueKey              Array of Unique Values          Array of Limit Values    The Original Query   
*              [ 'artist-mark-rothko', { uniques: { id: 'mark-rothko' },    limits: {size: 2},        query: 'artist' } ]
*               
*               With this array you will now have access to our generated unique key at the first element, then the unique variables
*               and their respective values, limit variables and their unique variables, and lastly, the original query that start
*               all of it.
*
*               Note: For best understanding start from the bottom parseVariables function and then go to helpers above as needed
*
*
* ***********************************
*/


//this is a helper function that will take in two parameters
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


//another helper function that handles the actual creation of the unique key. Pretty straightforward but the inputs are:
//
const createUniqueKey = (queryVariablesObject) => {
    let keyString = queryVariablesObject.query;

    Object.values(queryVariablesObject.uniques).forEach(uniqueValue => {
        keyString += "-" + uniqueValue;
    })
    return keyString.replace(/[\s]/g, '')
}

//this is the main function
let parseVariables = (query, uniques=[], limits=[]) => {

    //we will return this object full of variables and queryName later on as part of an array
    let output = {
        uniques: {},
        limits: {},
        query: ''
    }

    //if there are no variables we can keep it simple and return it as the simple query string parsed and nothing else
    //the unique key will end up just being a single word like 'artist' or 'pikachu'
    //need brian's help tomorrow - can't come up with a solution that works
    if (uniques.length === 0 && limits.length === 0) return 'broken for now'

    //varFinder is a regex that will look for parens with anything inside them aka, '(id : "mark-rothko")' and then it
    //will also capture everything behind it up to one word so: artist(id: "mark-rothko"). With artist included
    let varFinder = /[\w]* *\(([^()]+)\)/
    
    //run match and use the first value of the array because match acts weird
    let varString = query.match(varFinder)[0]
    
    //now we have a string 'pokemon(name: "pikachu")'.
    //this splits along the opening parens and turns it into an array like [ 'pokemon', 'name: "pikachu")' ]
    let variableArray = varString.split('(') 

    //here we set the output query to the original query which we just split out of the regex at element 0
    output.query = variableArray[0]

    //now we parse out all the search variables included like "name" or other variables - not sure what the point of the substring part is
    let varStr = variableArray[1].substring(0,variableArray[1].length-1)

    //we need the variables sorted by length to deal with edge case: matching similar values like ("id", "ssid") returning bad searches
    //find the starting index of each variable - you'll know when you've gotten the full variable when you hit the next starting index
    let indexes = startIndexFinder(varStr, [...uniques, ...limits])

    //storage container for stringified key values
    let stringifiedKeyValues = []
    
    //loop through the array of starting indexes pushing strings as we go - these starting indexes are how we are going to seperate
    //the uniques from the limits within the variables 
    for (var i=0; i<indexes.length; i++) {
        //the current index from starting indexes. It will properly indentify where the uniques live
        let curr = indexes[i]

        //if we are at the end we just push into the array the value of the unique variable using the current index
        if (i === indexes.length-1) stringifiedKeyValues.push(varStr.substring(curr).trim())
        //otherwise we push from the beginning of the current starting position and the current index + 1
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
        //if the limit includes the current string push it into limits
        if (limits.includes(temp[0])) {
            output.limits[temp[0]] = temp[1]
        }
        //if the current string is a unique string push it into uniques
        else {
            output.uniques[temp[0]] = temp[1];
        }
    })
    //return a final array by creating the unique key and giving it the output object we've been setting this whole time.
    return [createUniqueKey(output), output];
}

export default parseVariables  



