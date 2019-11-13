/**
* ***********************************
*
* @module keyedQueries
* @author Ben Ray, Brian Haller 
* @date 11/11/2019
* @params query (string), uniques (array), limits(array)
* 
* @description  stitchResponses takes in the array of responses from trunQify and compares the uniqueKeys
*               on the response. If there is more than one uniqueKey in the array, it runs the recursive
*               function stitcher on the two responses to turn them into one response. Therefore,
*               even if data for a query is gathered from cache and from fetch the developer will only get
*               one response for each query.
*
* ***********************************
*/

// main function
let stitcher = (obj1, obj2, uniqueKey) => {
    //first thing to do is find which one is the skeleton
    let skeleton, fetched;

    if (obj1[uniqueKey]) {
        skeleton = obj1;
        fetched = obj2.data;
    }
    else {
        skeleton = obj2;
        fetched = obj1.data;
    }
    
    //Recursive search function that removes trunQVariables and fills empty objects
    let keySearcher = (skeleton, fetched) => {
   
        //get the keys off at the current level we are on
        let keys = Object.keys(skeleton);
        if (!keys.length) return;

        //loop over - if we find trunQVariables remove it
        //if we find an empty object fill it
        //if we find a filled object - recurse
        //loop will skip over primitives and arrays
        for (let i=0; i<keys.length; i++) {
            let currKey = keys[i];
            
            //if the skeleton at currKey is a primitive continue on
            if (typeof skeleton[currKey] === 'string' || 
                typeof skeleton[currKey] === 'boolean' ||
                typeof skeleton[currKey] === 'number'
                ) {
                continue;
            }
            //if we hit an array do a fill in cause we always query new arrays
            else if (Array.isArray(skeleton[currKey]) && fetched[currKey]) {
                skeleton[currKey] = fetched[currKey];
            }
            //delete trunQVars
            else if (currKey === 'trunQVariables') {
                delete skeleton[currKey];
            }
            //fill empty object by testing if it has any keys or not
            else if(Object.keys(skeleton[currKey]).length === 0 && fetched[currKey]) {
                skeleton[currKey] = fetched[currKey];
            }
            //if we find an object with keys we gotta go in
            else if (Object.keys(skeleton[currKey]).length > 0) {
                keySearcher(skeleton[currKey], fetched[currKey]);
            }
        }
    }
    // runs keySearcher - recursive function that will 
    keySearcher(skeleton[uniqueKey], fetched);
    return skeleton[uniqueKey];
}

//results is an array from the promise.alls
function stitchResponses (results, storageLocation) {
    let stitchedQueries = [];
    let obj = {};
    //loop over the results and pull the unique key off
    for (let i=0; i<results.length; i++) {
        let currentQueryResponse = results[i].trunQKey || results[i];
        let uniqueKey = Object.keys(currentQueryResponse)[0];
        //if uniqueKey is not in cache - cache it
        if (!sessionStorage.getItem(uniqueKey)) {
            if (storageLocation.toLowerCase() === 'client') sessionStorage.setItem(uniqueKey, JSON.stringify(currentQueryResponse[uniqueKey]));  
            stitchedQueries.push(currentQueryResponse[uniqueKey]);  
        }
        //else if it is in cache - but there is not a partial in results array
        //that means we found a full match - probably won't happen as written now 

        //else if there are 2 objects to stich together we need to run sticher
        else {
            
            if (obj[uniqueKey]) {
                obj[uniqueKey] = stitcher(obj[uniqueKey], currentQueryResponse, uniqueKey);
                if (storageLocation.toLowerCase() === 'bow') sessionStorage.setItem(uniqueKey, JSON.stringify({data: obj[uniqueKey]}));
            }
            else {
                obj[uniqueKey] = currentQueryResponse[uniqueKey];
            }
        }
    }
    // remove uniqueKeys from the object and put data: as the first key to keep with
    // graphQL response standards
    for (let y = 0; y < Object.keys(obj).length; y += 1) {
        let curUniKey = Object.keys(obj)[y];
        stitchedQueries.push({ data: obj[curUniKey] })
    }

    return stitchedQueries;
}

export default stitchResponses;