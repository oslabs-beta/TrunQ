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

export default partialMatcher  
