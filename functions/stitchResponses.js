
function stitchResponses (results) {
    let minifiedRes = [];
    console.log(results)

    let resultsKeys = Object.keys(results);
    resultsKeys.forEach(resultKey => {
        if (minifiedRes.includes(results[resultKey])) {
            minifiedRes.push(Object.assign({}, overWriteObj[resultKey], results[resultKey]));
        }
        else {
            minifiedRes.push(results[resultKey])
        }
    });
    
    console.log("WOW THIS WORKED", minifiedRes)
    return minifiedRes
}

export default stitchResponses;