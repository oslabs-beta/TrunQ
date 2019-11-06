
const query = `query {
  artist(id: "mark-rothko") {
    name
    shows {
      id
    }
    artworks (size: 2) {
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

console.log('result from layerQueryFields',layerQueryFields(query, ['id'], ['size']))

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

//this function only works with queries with limits that are smaller than what is in the cache - all primitives work
let recursiveHelper = (skeleton, skeletonKeys, limits, uniques, futureQueries, cachedObj, size=0) => {

  size = 0
  for (let i=0; i<skeletonKeys.length; i++) {
    let skeletonKey = skeletonKeys[i]
    // console.log('KEY', skeletonKey)

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
          // console.log('found limit:', curr)
          size = skeleton.trunQVariables[curr]
        }

        //then search within uniques, 
        else if (uniques.indexOf(curr) !== -1) {
          // console.log('found unique', curr)
        }

        //if we don't get a match in either we have to throw this out - continue to the next key
        else{
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
        // console.log('its a primitive')
        skeleton[skeletonKey] = cachedObj[skeletonKey]
        // console.log('values should be changed here for', skeletonKey, 'in', skeleton)
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

//   console.log('final skeleton', skeleton['artist-mark-rothko'])
  // console.log('string skeleton', JSON.stringify(skeleton))
  // console.log(layers)
  // console.log('final queries', futureQueries)
  let queryToReturn = graphQLQueryMaker(futureQueries, layers, uniques, limits)
  return {
    query: queryToReturn,
    skeleton: skeleton
  }

}

// LAYERS WILL BE AN ARRAY CONTAINING OBJECTS OF EACH GRAPHQL QUERY
// MAKE SURE THIS IS HANDLED

function graphQLQueryMaker (futureQueries, layers, uniques, limits) {debugger;

  let graphQLString = 'query {';
    let q = 0
    for (let z = 0; z < layers.length; z += 1) {
        let currentLevels = Object.keys(layers[z])
        for (let i = 0; i < currentLevels.length; i += 1) {
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
                        // console.log("query in space match", currentQuery)
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
                        // console.log("query in space match", currentQuery)
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
        // console.log("STRING", graphQLString, "BRACEGEN", braceGen);
        graphQLString += "}".repeat(braceGen);
    }
    return graphQLString
}

let expected = ['query', 'artist(id: "mark-rothko")', 'address', 'bullshit', 'artworks (size: 2)', 'bullshit', 'bullshit']




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


// console.log(keyedQueries(query, ["id"], ["size"]))
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