import keyedQueries from './keyedQueries'
import parser from './parser'
import layerQueryFields from './layerQueryFields'
import queryObjectBuilder from './queryObjectBuilder'

const trunQify = (query, uniques, limits, endpointName) => {
    let cachedResults = {}
    let trunQKey = {}
    // get unique keys based on query, use these keys to check against local cache
    const keyedQueriesArray = keyedQueries(query, uniques, limits);
    for (let i = 0; i < keyedQueriesArray.length; i += 1) {
        let currentKey = Object.keys(keyedQueriesArray[i])
        let cachedResult = sessionStorage.getItem(currentKey)
        if (cachedResult !== null) {
            cachedResults[currentKey] = cachedResult;
        }
        else {
            trunQKey[currentKey] = keyedQueriesArray[i][currentKey];
        }
    }
    // if (Object.keys(trunQKey)) {
    //     fetch(endpointName, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ trunQKey: trunQKey })
    //     })
    //     .then(res => res.json())
    //     .then(res => {
    //         return Object.values(cachedResults).length !== 0 ? res + cachedResults : res
    //     })
    // }

    if (Object.keys(trunQKey).length > 0) {
        // Object.keys(trunQKey).forEach(key => {
            fetch(endpointName, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trunQKey })
            })
            .then(res => res.json())
            .then(res => {
                console.log(res)   
                sessionStorage.setItem('res', JSON.stringify(res))
            })
        // })
    }
    else {
        console.log(cachedResults)
        return cachedResults
    }
    console.log("CACHED RESULTS", cachedResults, "\n\nTRUNQKEY", trunQKey)
} 

export default trunQify  

