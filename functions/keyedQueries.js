/**
* ***********************************
*
* @module keyedQueries
* @author Ben Ray, Brian Haller 
* @date 11/5/2019
* @params query (string), uniques (array), limits(array)
* 
* @description takes a graphQL query from a client and deconstructs it into multiple queries within an array. It will take a shape like:
*              
*               [ { 'artist-mark-rothko': 'query{  artist(id: "mark-rothko") { name shows { id } artworks (size: 2) { id imageUrl } } }' } ]
*               
*               With this array you will now have the graphQL query as a stringified object as a value in an object and most importantly, it
*               now has a unique key attached to it as the object key. This unique key is made by reading the specific parameters on 
*               the query that the developer has passed in as unique paramaters.
*
*               Unique parameters would be something like an id, for example: artist(id: "mark-rothko"), there can only be one artist with
*               the id mark-rothko as that refers to a specific person. These can only be graphQL variables within the parens '()'
*
*               Note: At the moment the main goal of this function was to create cacheable key value pairs for our sessionStorage or to pass
*               along to the server side
*
*               Refactoring Note: A huge speed improvement could be done by regex replace all the useless spaces before we loop through
*
*
* ***********************************
*/

import parseVariables from './parser'

function keyedQueries(query, uniques, limits) {

    //this braceStack keeps track of how many braces we have run into, we take the length of this like a stack structure to see our flow
    //through the query.
    const braceStack = [];
    
    //at the end we will be pushing in our queries built with unique keys into this array
    const arrayofQueries = [];

    //again we write our strings to a temp that starts as an empty string
    let temp = '';

    //This keeps track of query or mutation which are drastically different. We do not handle mutations at the moment
    let typeofQuery = '';
    query[0] === 'q' ? typeofQuery = 'query' : typeofQuery = 'mutation';

    //this flag will keep track of whether a query is going to have unique identifiers on it or not. Crucial for creating the unique keys later
    let containsParens = false;

    //our unique key is going to become the string that we give as a key to the object, each will be gauranteed to be unique to the specific
    //GraphQL query because they are based on the unique identifiers as discussed earlier. 
    let uniqueKey = '';
    

    //this loop is the main function. It reads/writes and parses unique keys out of our query character by character 
    //we'll get into more detail inside the loop but it works by reading the open and closing braces '{', '}'.
    for (let i = 0; i < query.length; i += 1) {

        //if the braceStack length is greater than 0 we know that we have gotten past the first part of the query that isn't useful 
        //to us, aka 'query {'. We can start writing as soon as we pass that marker
        if (braceStack.length > 0) {
            temp += query[i];
        }

        //if the brace is open then we want to start tracking the string we're writing because we're about to pull out a unique key from it
        if (query[i] === '{') {
            //first add to our stack a single brace to update the length
            braceStack.push(query[i]);

            //we wait til length 2 because the parsing is almost backwards looking by use of the regex.
            //at 'query {' we have length 1 but we already know that wasnt useful data, now that we are at length 2 we have captured
            //some valuable strings within temp, the first variables.
            //keep in mind, we only want strings that are exactly at the right level to become independent queries
            //this will be level 2 so we only care about finding a unique key when we are at this level
            if (braceStack.length === 2) {
                
                //varFinder is a regex that will look for parens with anything inside them aka, '(id : "mark-rothko")' and then it
                //will also capture everything behind it up to one word so: artist(id: "mark-rothko"). With artist included
                //we now have everything we need to create a unique key for this query string
                let varFinder = /[\w]* *\(([^()]+)\)/

                //this uses the regex to flag whether parens, aka variables, exist on our query string - sometimes they don't and we can
                //keep it simple
                containsParens = varFinder.test(temp)

                //if it does contain parens or variables we have to go into our parser that will return a unique key based on the string
                //we feed it. Remeber temp is pretty much everything after an open bracket in most cases
                if (containsParens) {
                    uniqueKey = parseVariables(temp, uniques, limits)[0];
                }
                //if not keep it simple and the unique key will infact just be the key itself
                else {
                    uniqueKey = temp.replace('{', '').trim();
                }
            }
        }

        //if the brace is closed
        else if (query[i] === '}') {
            //when the brace is closed we know we can pop off from the stack reducing the length because we're moving down a level in the query object
            braceStack.pop()

            //if the braceStack only has one left we know that we have gotten to the very end of the query and we are closing this
            //independent query. It is impossible for there to be a lot more independent queries if we were to go back up a length of 2
            //so the loop isn't necessarily over. Because of this everything gets pushed, cleaned and reset for the next possible one
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
    //return our final array of one or more object containing key values pairs of {uniqueKey: stringified query}
    return arrayofQueries;
}

export default keyedQueries