import keyedQueries from './keyedQueries'
import parser from './parser'
import layerQueryFields from './layerQueryFields'
import queryObjectBuilder from './queryObjectBuilder'
import partialMatcher from './partialMatcher.js'

const trunQify = (query, uniques, limits, endpointName, storageLocation) => {
    let cachedResults = []
    let trunQKey = {}
    let fetchedPromises = [];
    // get unique keys based on query, use these keys to check against local cache
    const keyedQueriesArray = keyedQueries(query, uniques, limits);
    for (let i = 0; i < keyedQueriesArray.length; i += 1) {
        let currentKey = Object.keys(keyedQueriesArray[i])
        let cachedResult = sessionStorage.getItem(currentKey)
        if (cachedResult !== null) {
            cachedResults.push(JSON.parse(cachedResult))
        }
        else {
            trunQKey[currentKey] = keyedQueriesArray[i][currentKey];
        }
    }

    //if the length is greater than 0 that means we have keys to go fetch because they weren't in cache (trunQKey holds not found items)
    if (Object.keys(trunQKey).length > 0) {
        //declare the promise to be pushed - it returns the result of a fetch
        let fetchingPromise = new Promise (function (resolve, reject) {
            fetch(endpointName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trunQKey: trunQKey })
            })
            .then(res => res.json())
            .then(res => {
                console.log("\nRESPONSE FROM SERVER:", res);
                let outputObj = {}
                for (let i = 0; i < Object.keys(res.trunQKey).length; i += 1) {
                    if (storageLocation === 'bow') sessionStorage.setItem(Object.keys(res.trunQKey)[i], JSON.stringify(res.trunQKey[Object.keys(res.trunQKey)[i]]));
                    outputObj.data = res.trunQKey[Object.keys(res.trunQKey)[i]].data
                }
                return resolve(outputObj);
            })
            .catch(error => {
                console.log('ERROR FETCHING IN TRUNQIFY', error)
            })
        })
        fetchedPromises.push(fetchingPromise)
    }
    else {
        return cachedResults;
    }

    console.log("CACHED RESULTS", cachedResults, "\n\nTRUNQKEY", trunQKey)

    for (let j = 0; j < Object.keys(cachedResults).length; j += 1) {
        fetchedPromises.push(cachedResults[Object.keys(cachedResults)[j]])
    }

    return Promise.all([...fetchedPromises])
    .then(function(values) {
        return values;
    })
    .catch(err => {
        console.log(err);
    })
} 

export default trunQify;