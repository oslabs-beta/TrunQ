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

const parseVariables = require('./parser.js')
const layerQueryFields = require('./layerQueryFields.js')
const queryObjectBuilder = require('./queryObjectBuilder.js')

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
        if (Array.isArray(cachedObj[skeletonKey])) {
          skeleton[skeletonKey] = cachedObj[skeletonKey]
        } 
        //now find out if its a primitive or an object
          //if it is an object you'll want to recurse through
        else if (typeof cachedObj[skeletonKey] === 'object') {
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
  
// main function
function partialMatcher (query, cachedResult, currentKey, uniques=[], limits=[]) {
    let layers = layerQueryFields(query, uniques, limits)
    let skeleton = queryObjectBuilder(layers, uniques, limits);
    let futureQueries = [];
    //get to layer one of the reponse object
    let cachedObj = cachedResult.data 
  
    //parse through the skeleton - match keys one by one - recursion will be decided later
    //if skeletonKeys here becomes undefined that means we couldn't match the key to the skeleton and the cache is bad
    if (skeleton[currentKey] === undefined) return 'broken'
    
    //at this point we know that the unique key already matches the cache and we can go one layer deeper
    let skeletonKeys = Object.keys(skeleton[currentKey])
  
    //loops over all of the skeleton keys to see what we can match up
    recursiveHelper(skeleton[currentKey], skeletonKeys, limits, uniques, futureQueries, cachedObj)
    let queryToReturn = graphQLQueryMaker(futureQueries, skeleton, layers, uniques, limits)
    return {
      partialQuery: queryToReturn,
      filledSkeleton: skeleton,
      futureQueries: futureQueries
    }
}

// this function generates a valid graphQL query from the futureQueries
// i.e. the queries that did not have a data match in cache
function graphQLQueryMaker (futureQueries, skeleton, layers, uniques, limits) {
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

              // this is a reading loop that reads through the graphQL string
              // and find matches with the futureQueries array.
              // when matches occur, the reader adds the match and the nested
              // level to the graphQL string that will be returned
              let temp = ''
              for (let j = 0; j < currentLevels[i].length; j += 1) {
                  let currentLetter = currentLevels[i][j];
                  if (currentLetter === '(' && temp === currentQuery) {
                      temp += currentLevels[i].slice(j);
                      let layerLimits = Object.values(parseVariables(temp, uniques, limits)[1].limits)[0];
                      graphQLString += " " + temp + " {";
                      
                      while (layerLimits > 1) {
                          currentQuery = futureQueries[++q];
                          layerLimits -= 1;
                      }
                      currentQuery = futureQueries[++q];
                      j = currentLevels[i].length;
                      temp = '';
                  }
                  else if (currentLetter === ':' && temp !== currentQuery) {
                    //if the stuff in between the parens contains a limit we write the parens scenario
                    let limitsRegex = /\(((size)*(first)*(last)*(after)*)/
                    if (limitsRegex.test(temp)) {
                      //run temp to the end of the line by incrementing j
                      while(j< currentLevels[i].length) {
                        temp += currentLetter
                        j++
                        currentLetter = currentLevels[i][j]
                      }
                      graphQLString += " " + temp + " {";
                      temp =''
                    }
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
                        graphQLString += ' { ';
                      }
                      temp = '';
                  }
              }
          }
          else {
            // if there is no match in the current level with our currentQuery
            // add the string if the levels are increasing or close off our 
            // level if the level is decreasing
            graphQLString += currentLevels[i]
            if (layers[z][currentLevels[i+1]]) {
              graphQLString += ' { ';
            }
            else {
              graphQLString += ' } ';
            }
          }
      }
      // adding closing braces to finish the graphQL query
      let openBrace = /\{/g, closeBrace = /\}/g;
      let closed = 0;
      if (graphQLString.match(closeBrace)) closed = graphQLString.match(closeBrace).length;
      let braceGen = graphQLString.match(openBrace).length - closed;
      graphQLString += "}".repeat(braceGen);
    }
    
    return graphQLString;
  }

  module.exports =  partialMatcher  
