/**
* ***********************************
*
* @module trunQify
* @author Ben Ray, Brian Haller 
* @date 11/5/2019
* @params query (string), uniques (array), limits(array)
*           endpoint (string), storageLocation (string)
*
* @description takes a graphQL query from a client and checks the query against tagged keys
*           in sessionStorage, rebuilds a new graphQL request based on data found in sessionStorage
*           and then performs a fetch to the route specified in parameters. If the query is tagged
*           for front end caching, the results of the query are then cached in sessionStorage
*           This function returns a Promise.all resolution of both cached and fetched data as an array.
*           The returned response is formatted indentically to the graphIQL of the API.
*
* ***********************************
*/

// Import parser functionalities.
import keyedQueries from './keyedQueries'
import stitchResponses from './stitchResponses.js'
import partialMatcher from './partialMatcher.js'

const trunQify = (query, uniques, limits, endpointName, storageLocation) => {

    //array that will hold cached results to combine later
    let cachedResults = []

    //trunQKey holds everything that needs to be fetched
    let trunQKey = {}

    //at the end this will be the objet that we are returning, the combination of cached responses and fetches
    let fetchedPromises = [];

    // get unique keys based on query, use these keys to check against local cache
    const keyedQueriesArray = keyedQueries(query, uniques, limits);

    //loop over the unique keys
    for (let i = 0; i < keyedQueriesArray.length; i += 1) {

        //the current key
        let currentKey = Object.keys(keyedQueriesArray[i])

        //we search into the frontEnd cache to see if it already exists - it might now
        let cachedResult = sessionStorage.getItem(currentKey)

        //if the cachedResult does exist then that means we matched uniqueKeys and we want to run partial
        //query to scan over it
        if (cachedResult !== null) {
            
            //partial matcher here ----- it takes in the query, the cachedResult, currentKey, uniques, limits
            const { partialQuery, filledSkeleton, futureQueries } = partialMatcher(query, JSON.parse(cachedResult), currentKey, uniques, limits)

            // check partialQuery against stringified filledSkeleton. If every single one is truthy,
            // we are refetching limits.
            if (!futureQueries.every(query => cachedResult.includes(query))) {
                trunQKey[currentKey] = partialQuery;
            }

            //the cached results are current stringified data objects so we do need to parse them into real objects again
            // cachedResults.push(JSON.parse(cachedResult))
            cachedResults.push(filledSkeleton)
            console.log("trunqkey", trunQKey)
            console.log("cachedResults", cachedResults)
            
        }
        //if it doesn't exist in the cache we just add it trunQKey so that we know we need to look fetch it later
        else {
            trunQKey[currentKey] = keyedQueriesArray[i][currentKey];
        }
    }

    //if the length of trunQKey greater than 0 that means we have keys to go fetch because they weren't in cache 
    // remember (trunQKey holds not found items)
    if (Object.keys(trunQKey).length > 0) {
        //declare the promise to be pushed - it returns the result of a fetch
        //standard fetch, other than the body, which will contain a flag for passing along the storage options selected
        //the fetch is built as a promise that we can then push into the fetchedPromises array
        //we do this so that we can combine them plus the cached results into a Promise.All to return a final array of all the responses
        let fetchingPromise = new Promise(function (resolve, reject) {
            fetch(endpointName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    trunQKey: trunQKey,
                    flag: storageLocation
                })
            })
                .then(res => res.json())
                .then(res => {
                    let returnDataObj = [];
                    for (let i = 0; i < Object.keys(res.trunQKey).length; i += 1) {
                        returnDataObj.push(res);
                    }
                    return resolve(returnDataObj);
                })
                .catch(error => {
                    console.log('ERROR FETCHING IN TRUNQIFY', error)
                })
        })

        //push the promise into the fetchedPromises array
        fetchedPromises.push(fetchingPromise)
    }
    //if all of the keys are found in the cache we can actually just return the cachedResults
    else {
        return stitchResponses(cachedResults);
    }

    //this pushed into fetchedPromise all the cached items that we found earlier - the fetched are already in there
    // for (let j = 0; j < Object.keys(cachedResults).length; j += 1) {
        // fetchedPromises.push(cachedResults[Object.keys(cachedResults)[j]])
    // }
    fetchedPromises.push(cachedResults)


    //return a Promise.all array of all the resolved fetched and cached results
    return Promise.all([...fetchedPromises])
        .then(function (values) {
            
            return stitchResponses(values.reduce((arr, val) => {
                if (Array.isArray(val)) {
                    arr.push(...val);
                } else {
                    arr.push(val);
                }
                return arr;
            }, []), storageLocation);
        })
        .catch(err => {
            console.log("ERROR IN RESOLVING PROMISE.ALL", err);
        })
}

export default trunQify;

//1. successfully stitch the response back togeth
//2. correctly cache that stiched response at hte right time
