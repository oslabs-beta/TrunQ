/**
* ***********************************
*
* @module keyedQueries
* @author Ben Ray, Brian Haller 
* @date 11/5/2019
* @params query (string), uniques (array), limits(array)
* 
* @description Really a massive helper function. Takes in a layered query from layerQueryFields and constructs a 'trunQified' object
*              skeleton of a graphQL query. Basically turns a graphQL query string into a useable javascript object. The best explanation
*              is that we have created a mold of the query that can then be recursed over and filled in (or not filled in) during
*              partial matching against the cache. It spits out an object looking like:
*            
*              { 'artist-mark-rothko': 
*                   {
*                       trunQVariables: { id: 'mark-rothko' },
*                       artist: { name: {}, shows: {}, id: {} },
*                       artworks: 
*                           { 
*                               trunQVariables: { size: 2 } 
*                               trunQLimits: [ { id: {}, imageUrl: {} }, { id: {}, imageUrl: {} } ]
*                           } 
*                   } 
*              }
*               
*               Notice the special new keys trunQVariables and trunQLimits. They are key to converting the graphQL query language into an
*               actual javascript object. 
*                   -trunQVariables holds the variables that defined the query. Unique's that identify a unique query, and limits which define
*                       a certain size for graphQL to return as an array
*                   -trunQLimits holds an array that contains the inner queries as objects duplicated the correct amount of times
*
*               Note: For best understanding start from the bottom queryObjectBuilder and follow from there
*
*
* ***********************************
*/


import parser from './parser'


//turns the uniques and variables into key value pairs within a trunQVariables object
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
  
//searching the trunQ finds any limits that might be within the parens
let searchTrunQ = (trunQVariables, limits) => {
    let trunQNum = 0;
    limits.forEach(limit => {
        if(trunQVariables[limit]) trunQNum = trunQVariables[limit]
    })
    return trunQNum 
}
  
//innerTrunQify really runs the same functionality but the only difference is that it will build an array for you inside the dummyObj
function innerTrunQify (output, levels, trunQSize, keysArr, i, uniques, limits, latestQuery) {
    let curr = keysArr[i]
    let dummyObj = output
    for (let z = 0; z < levels.length; z += 1) {
        dummyObj = dummyObj[levels[z]];
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

                innertrunQSize = searchTrunQ(trunQVars, limits);
                j = curr.length + 1
                levels.push(latestQuery)
                if (innertrunQSize > 0) {
                    tempObj[latestQuery].trunQLimits = []
                    i++;
                    i = innerTrunQify (tempObj[latestQuery], levels, innertrunQSize, keysArr, i, uniques, limits, latestQuery)
                    trunQSize = 0;
                }
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
  
//see the description for an overview of this guy. 
let queryObjectBuilder = (arr, uniques=[], limits = []) => {

    //this is going to be our final output object, 'skeleton'
    let output = {}
    //levels keeps track again of how deep we are into an object
    let levels = []
    //previousLevel will keep track of what level we just were on, this is important for when we starting going down. There will be special
    //operations on down movements
    let previousLevel = 0;
    //trunQSize will keep track of any limits that are going to be put in place at a certain time meaning we need to switch to an Array
    let trunQSize = 0;
  
    //this loop begins the process of looping over the array built by layerQueryFields. Remeber, there could be multiple independent queries
    for (let z =0; z<arr.length; z++) {
        
        //tracking the latestQuery as we read along the strings
        let latestQuery = ''
        //the current element out of the layerQueryFields array
        let input = arr[z]
        //remember, layerQueryFields gives you an object that holds key values pairs of the query and their respective depth - so we want the keys
        let keysArr = Object.keys(input)
        //this is where the magic will happen. As we use dummyObj as a reference to our important output object. We can use this dummy to move
        //in and out levels within output without ever mutating output
        let dummyObj = output
  
        //start the process of iterating over the keys we mentioned earlier
        for (let i=0; i<keysArr.length; i++) {
            
            //the current key
            let curr = keysArr[i]
            
            //making sure our reference is to the top of the output object so we can move in with precision later
            dummyObj = output;

            //input[curr] is really the depth we are withing the object. When we are at 1 we have special trimming to do based on variables
            if (input[curr] === 1) {

                //this reg basically sniffs out parens and anything in between them
                let parensReg =/\(([^()]*)\)/

                //if the parens sniffer finds anything we want to parse it into usable data using the parseVariables
                if (parensReg.test(curr)) {

                    //save the parseVariables array
                    let parsedArr = parseVariables(curr, uniques, limits);
                    
                    //unique key always come as element one from parseVariables array
                    let uniqueKey = parsedArr[0];

                    //remember we are at a depth of 1, the shallowest depth. Here we can just modify the top level and don't need the dummy object
                    output[uniqueKey] = {};
                    
                    //push into levels the string of what object that we are within, we're going to use those strings to move correctly through output
                    levels.push(uniqueKey);

                    //when we know there are parens we know we have to have trunQVariables to store those variables. trunqify handles that object creation
                    let trunQVars = trunqifyVariables(parsedArr);

                    //now the output at our current key will hold inside of it trunQVariables which we set here
                    output[uniqueKey].trunQVariables = trunQVars

                    //right here we search for any sizing variables so that we know if we have to become an Array or not. If we do find any
                    //we set the trunQSize for later 
                    trunQSize = searchTrunQ(trunQVars, limits);

                    //for now, we fill in each query with an empty object to either be moved into later or left empty
                    output[uniqueKey][parsedArr[1].query] = {};

                    //push into levels this next empty object path incase we need to use it
                    levels.push(parsedArr[1].query);
                }
                //if there are no parens life is easy and we can just do this, 
                //we have to be duplicating our actions because of the uniqueKey system
                else {
                    output[curr] = {};
                    output[curr][curr] = {};
                    levels.push(curr);
                    levels.push(curr);
                }
            }
            //if the depth level is greater than 1 and the trunQSize is 0, aka there are no limits telling us to build an Array
            else if (input[curr] > 1 && trunQSize === 0) {
                //if prevlevel is greater than pop off a level because we've gone down a level
                if (previousLevel > input[curr]) levels.pop();

                //temp will be our reader/writer as we loop through strings
                let temp = ''

                //you'll see this loop over and over again, it moved our dummyObj in down the levels path outlined in the array
                //basically taking us down the correct depth through output
                for (let i = 0; i < levels.length; i += 1) {
                    dummyObj = dummyObj[levels[i]];
                }

                //loop through the string here - remember curr is the current key we're reading
                for (let j = 0; j < curr.length; j += 1) {

                    //if we hit a space we know we've hit a query and give it an empty object within the skeleton
                    if (curr[j] === ' ') {
                        //give it the empty object to be possibly filled in later
                        dummyObj[temp] = {}

                        //update the latest query which we'll need later on an opening parens
                        latestQuery = temp

                        //reset temp because we've just set a key value pair
                        temp = ''
                    }

                    //if we hit an opening parens we have hit a query with variables and this becomes a special case
                    else if(curr[j] === '(') {

                        //again set the key value pair to an empty object
                        dummyObj[temp] = {}
                        latestQuery = temp
                        temp = ''

                        //now that we have parens we have to parse this guy as usual
                        let parsedArr = parseVariables(curr, uniques, limits)

                        //read the trunQVariables off of it for future use and set them
                        let trunQVars = trunqifyVariables(parsedArr)
                        dummyObj[latestQuery].trunQVariables = trunQVars

                        //now test if we have any limits like last time but this time we have to set an actual array
                        trunQSize = searchTrunQ(trunQVars, limits);

                        //the latest query has a limit meaning that it will hold the trunQLimits array
                        if (trunQSize > 0) dummyObj[latestQuery].trunQLimits = []
                        
                        //increment j to the end of the loop to kill the loop as parens always indicates that we are moving down another level
                        j = curr.length + 1
                        //since we're moving down a level push that level in so we can use it
                        levels.push(latestQuery)
                    }

                    //if nothing special just keep writing
                    else {
                        temp += curr[j]
                    }
                    //on a special case where you hit the end of a query without any parens that means you've finished
                    if(j === curr.length-1) {
                        //set the key value pair to an empty object
                        dummyObj[temp] = {}
                        //the previous level becomes the current level
                        previousLevel = input[curr]
                    }
                }
            }
            //this case never actually happens but might need it for later
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
