
let query = `query {
  artist(id: "mark-rothko") {
    name
    shows {
      test
    }
    artworks (size: 2) {
      id
      imageUrl
    }
  }
}`

let query2 = `query {
  artist {
    name
    shows {
      id
    }
    artworks(id: 'name') {
      id
      imageUrl
    }
  }
}`

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

const createUniqueKey = (queryVariablesObject) => {
  let keyString = queryVariablesObject.query;

  Object.values(queryVariablesObject.uniques).forEach(uniqueValue => {
      keyString += "-" + uniqueValue;
  })
  return keyString.replace(/[\s]/g, '')
}


//step 1 - pull a unique key out using regex from the top of the query
  //use a regex that will only match ** ('anything inside') **
  //developer inputs unique arguments that will be attached to the key
let parseVariables = (query, uniques=[], limits=[]) => {

  //return this object full of variables and queryName
  let output = {
      uniques: {},
      limits: {},
      'query': ''
  }

  //declare our regex
  let varFinder = /[\w]* *\(([^()]+)\)/
  
  //run match and use the first value of the array because match acts weird

  //if there are no variables we can keep it simple and return it as the simple query string parsed and nothing else
  //the unique key will end up just being a single word like 'artist' or 'pikachu'
  if (uniques.length === 0 && limits.length === 0) return 'hi'

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

// console.log('result from parseVariables', parseVariables(query, ['id'], []))


const layerQueryFields = (query, uniques = [], limits = []) => {

  let temp = '';
  let cacheObj = {};
  const globalCacheArr = []
  let level = -1;
  let whiteSpaceBeforeParenRegex = /(?<=[\w]) (?=\()/;

  for (let i = 0; i < query.length; i += 1) {
      if (query[i] === '{') {
          level += 1;
          temp = temp.replace(/[\n]/g, '').trim();
          temp = temp.replace(/[\s]+/g, ' ');
          temp = temp.replace(whiteSpaceBeforeParenRegex, '');

          if (temp !== "") {
              cacheObj[temp] = level;
          }
          temp = ''
      }
      else if (query[i] === '}') {
          temp = temp.replace(/[\n]/g, '').trim();
          temp = temp.replace(/[\s]+/g, ' ');
          temp = temp.replace(whiteSpaceBeforeParenRegex, '');
          if (temp !== "") {
              cacheObj[temp] = level + 1;
          }
          temp = ''
          level -= 1;
          if (level === 0) {
              globalCacheArr.push(cacheObj)
              cacheObj = {}
          }
      }
      else if (level > -1) {
          temp += query[i];
      }
  }
  return globalCacheArr;
}

// console.log('result from layerQueryFields',layerQueryFields(query, ['id'], ['size']))

function keyedQueries(query, uniques, limits) {
  const braceStack = [];
  const arrayofQueries = [];
  let temp = '';
  let typeofQuery = '';
  let containsParens = false;
  let uniqueKey = '';
  query[0] === 'q' ? typeofQuery = 'query' : typeofQuery = 'mutation';


  for (let i = 0; i < query.length; i += 1) {

      if (braceStack.length > 0) {
          temp += query[i];
      }

      if (query[i] === '{') {
          braceStack.push(query[i]);
          if (braceStack.length === 2) {
              let varFinder = /[\w]* *\(([^()]+)\)/
              containsParens = varFinder.test(temp)
              if (containsParens) {
                  uniqueKey = parseVariables(temp, uniques, limits)[0];
              }
              else {
                  // console.log(braceStack.length)
                  uniqueKey = temp.replace('{', '').trim();
              }
          }
      }

      else if (query[i] === '}') {
          braceStack.pop()
          if (braceStack.length === 1) {
              // console.log(temp)
              let queryObj = {}
              temp = temp.replace(/[\n]( )+/g, ' ');
              queryObj[uniqueKey] = typeofQuery + "{ " + temp + " }";
              arrayofQueries.push(queryObj)
              temp = '';
              uniqueKey = '';
          }
      }
  }

  return arrayofQueries;
}

// console.log('result from keyedQueries', keyedQueries(query, ['id'], ['size']))


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
                  //on a special case where you hit the end of a query without any parens that means you've finished or that we have a query
                  //thats about to become a nest but shows no indication of it. We have to test for whether the next level is deeper or not here
                  if(j === curr.length-1) {

                    //find the next element's level make sure we don't go undefined
                    let nextLevel = input[keysArr[i+1]]

                    //this case where you've hit an end but the next level is greater indicating a nested query
                    if (nextLevel !== undefined && nextLevel > input[curr]) {

                      //set the key value pair to an empty object
                      dummyObj[temp] = {}
                      
                      //the previous level becomes the current level
                      previousLevel = input[curr]
                      latestQuery = temp
                      //since we're moving down a level push that level in so we can use it
                      levels.push(latestQuery)
                    }
                    else {
                      //set the key value pair to an empty object
                      dummyObj[temp] = {}
                      
                      //the previous level becomes the current level
                      previousLevel = input[curr]
                    }
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
// console.log('result from queryObjectBuilder', queryObjectBuilder(layerQueryFields(query), ['id'], ['size'])['artist-mark-rothko'])



//this function only works with queries with limits that are smaller than what is in the cache - all primitives work
let recursiveHelper = (skeleton, skeletonKeys, limits, uniques, futureQueries, cachedObj, size=0) => {

  size = 0
  for (let i=0; i<skeletonKeys.length; i++) {
    let skeletonKey = skeletonKeys[i]

  // ------- THIS SECTION DEALS WITH PARSING THE TRUNQVARIABLES OBJECT ------ //

  //if we run into a trunQVariables we have to parse those uniques and match them to uniques from the array

    //if they match we continue through
    if (skeletonKey === 'trunQVariables') {
    
      //loop over and make sure all the variables are valid - aka they are in uniques or limits
      let trunQVariables = Object.keys(skeleton.trunQVariables)

      for (let j=0; j<trunQVariables.length; j++) {
        let curr = trunQVariables[j]
        //search within limits
        //when we hit a size limit we want to be wary that the next thing to parse will be an array called trunQArrays
        //we will know the size if we read the value off of the trunQVariables
          if (limits.indexOf(curr) !== -1) {
              size = skeleton.trunQVariables[curr]
          }
  
          //then search within uniques, 
          else if (uniques.indexOf(curr) !== -1) {

          }

        //if we don't get a match in either we have to throw this out - continue to the next key
          else {
              return('invalid')
          }
      } 
      continue;
    }
    else if(skeletonKey === 'trunQLimits') {

      if (size > cachedObj.length) {
        futureQueries.push(skeleton.trunQLimits)
        continue;
      }
      for (let i=0; i<size; i++) {
        recursiveHelper(skeleton.trunQLimits[i], Object.keys(skeleton.trunQLimits[i]), limits, uniques, futureQueries, cachedObj[i], size)
      }
      continue;      
    }

    //if we get a match, store that value - matches will be found in the cached object
    if (cachedObj[skeletonKey] !== undefined) {
      //now find out if its a primitive or an object
        //if it is an object you'll want to recurse through
      if (typeof cachedObj[skeletonKey] === 'object') {
        let newKeys = Object.keys(skeleton[skeletonKey])

        futureQueries.push(skeletonKey)
        recursiveHelper(skeleton[skeletonKey], newKeys, limits, uniques, futureQueries, cachedObj[skeletonKey])
      }
      //if it's not an object you want to replace the corresponding skeleton value with that primitive
      else {
        skeleton[skeletonKey] = cachedObj[skeletonKey]
      }
    }
    //else put it into a query object for the future - build out new queries
    else {
      futureQueries.push(skeletonKey)
    }
  } 
  return futureQueries
}



function partialMatcher (query, cachedResult, currentKey, uniques=[], limits=[]) {
  let layers = layerQueryFields(query, uniques, limits)
  let skeleton = queryObjectBuilder(layers, uniques, limits);

  let futureQueries = [];
  //get to layer one of the reponse object
  cachedObj = cachedResult.data 

  //parse through the skeleton - match keys one by one - recursion will be decided later
  //if skeletonKeys here becomes undefined that means we couldn't match the key to the skeleton and the cache is bad
  if (skeleton[currentKey] === undefined) return 'broken'
  
  //at this point we know that the unique key already matches the cache and we can go one layer deeper
  let skeletonKeys = Object.keys(skeleton[currentKey])

  //loops over all of the skeleton keys to see what we can match up
  recursiveHelper(skeleton[currentKey], skeletonKeys, limits, uniques, futureQueries, cachedObj)

  let queryToReturn = graphQLQueryMaker(futureQueries, layers, uniques, limits)
  return {
    query: queryToReturn,
    skeleton: skeleton
  }

}

// LAYERS WILL BE AN ARRAY CONTAINING OBJECTS OF EACH GRAPHQL QUERY
// MAKE SURE THIS IS HANDLED

function graphQLQueryMaker (futureQueries, layers, uniques, limits) {debugger;
  //start out the query string using standardized graphQL opening
  let graphQLString = 'query {';

  //q is going to be how we are going to track our position within futureQueries  
  let q = 0
  
  //this loop loops over the layers and gets the process started
  for (let z = 0; z < layers.length; z += 1) {

    //current levels is going to be the keys an independent query layered as an array
    let currentLevels = Object.keys(layers[z])
    
    //loop over the current levels array we just got
    for (let i = 0; i < currentLevels.length; i += 1) {

      //current query is going to be our first pointer within futureQueries, will update as Q updates - currentQuery keeps track of
      //the queries that we are missing
        let currentQuery = futureQueries[q]; // going to be artist
        
        if (currentLevels[i].includes(currentQuery)) {  
            // if the currentQuery exists inside the current level
            // format the current level to be part of graphQLString

            let temp = ''
            for (let j = 0; j < currentLevels[i].length; j += 1) {
                let currentLetter = currentLevels[i][j];
                if (currentLetter === '(' && temp === currentQuery) {
                    temp += currentLevels[i].slice(j)
                    
                    let layerLimits = Object.values(parseVariables(temp, uniques, limits)[1].limits)[0]

                    graphQLString += " " + temp + " {"
                    
                    
                    while (layerLimits > 1) {
                        currentQuery = futureQueries[++q];
                        layerLimits -= 1;
                    }
                    currentQuery = futureQueries[++q];

                    // console.log("query in (", currentQuery)
                    j = currentLevels[i].length
                    temp = '';
                }
                else if (currentLetter === ' ' && temp === currentQuery) {
                    graphQLString += " " + temp;
                    currentQuery = futureQueries[++q];
                    temp = '';
                }
                else if (currentLetter === ' ' && temp !== currentQuery) {
                    temp = '';
                }
                
                else {
                    temp += currentLetter;
                }
                if (j === currentLevels[i].length - 1 && temp === currentQuery) {
                    graphQLString += " " + temp;
                    currentQuery = futureQueries[++q];

                    //if the next layer is higher than this one we need to push a ' { '
                    if (layers[z][currentLevels[i+1]]) {
                      graphQLString += ' { '
                    }
                    temp = '';
                }
            }
        }
        else {
            graphQLString += currentLevels[i] + " }"
        }
    }
    // I am very proud of this.
    let openBrace = /\{/g, closeBrace = /\}/g
    let braceGen = graphQLString.match(openBrace).length - graphQLString.match(closeBrace).length;
    graphQLString += "}".repeat(braceGen);
  }
  return graphQLString
}

let response = 
  {
  "data": {
    "artist": {
      "name": "Mark Rothko",
      "artworks": [
        {
          "id": "mark-rothko-untitled-2",
          "imageUrl": "https://d32dm0rphc51dk.cloudfront.net/TrITRbfwKGs9a4YHf74UJg/square.jpg"
        },
        {
          "id": "mark-rothko-number-10",
          "imageUrl": "https://d32dm0rphc51dk.cloudfront.net/_SJ9ViOWmrEMch8hegHrtg/square.jpg"
        }
      ],
    }
  }
}


query = `query {
  artist(id: "mark-rothko") {
    name
    shows {
      test
    }
    artworks (size: 2) {
      id
      imageUrl
    }
  }
}`

console.log('result from partialMatcher', partialMatcher(query, response, 'artist-mark-rothko', ['id'], ['size']))


/* SKELETON - from layers
{ 'artist-mark-rothko': 
   { trunQVariables: { id: 'mark-rothko' },
     artist: { name: {}, artworks: [Object] } } }

RESPONSE - from cache
  {
  "data": {
    "artist": {
      "name": "Mark Rothko",
      "artworks": [
        {
          "id": "mark-rothko-untitled-2",
          "imageUrl": "https://d32dm0rphc51dk.cloudfront.net/TrITRbfwKGs9a4YHf74UJg/square.jpg"
        },
        {
          "id": "mark-rothko-number-10",
          "imageUrl": "https://d32dm0rphc51dk.cloudfront.net/_SJ9ViOWmrEMch8hegHrtg/square.jpg"
        }
      ]
    }
  }
}
*/

// export default partialMatcher;