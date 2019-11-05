import parseVariables from './parser'

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
                    uniqueKey = temp.replace('{', '').trim();
                }
            }
        }

        else if (query[i] === '}') {
            braceStack.pop()
            if (braceStack.length === 1) {
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

export default keyedQueries