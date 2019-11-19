/**
* ***********************************
*
* @module keyedQueries
* @author Ben Ray, Brian Haller 
* @date 11/5/2019
* @params query (string), uniques (array), limits(array)
* 
* @description takes a graphQL query from a client and deconstructs it into multiple queries within an array. It will take a shape like:
*              [ { 'artist(id: "mark-rothko")': 1,
*                  'name shows': 2,
*                  id: 3,
*                  'artworks(size: 2)': 2,
*                  'id imageUrl': 3 } ]
*               
*               With this array you will now have the broken out structure of a graphQL query organized by depth. The keys are the exact
*               queries saved as string and the values will be their exact depth within the object. The end goal of this is to make an 
*               iterable object that can be used to create our special TrunQ query objects.
*
*               Refactoring Note: A huge speed improvement could be done by regex replace all the useless spaces before we loop through
*
* ***********************************
*/

const layerQueryFields = (query, uniques = [], limits = []) => {

    //temp will become each string that shows up as keys within the object - we'll get to using it to 'read/write' later
    let temp = '';
    
    //the cacheObj will be the object of layered queries that we will be pushing to the array we want to return
    let cacheObj = {};
    
    //this globalCacheArr is what we want to return, containing layered queries
    const globalCacheArr = []

    //level starts at negative one because we don't want to start writing until after the "query {" part that leads all graphQL strings
    //this will be more clear later when you see we increment on '{'s to increase our levels.
    let level = -1;

    //this regex is for format integrity and consistency in our queries. it will find any space between a character and a parens like
        // "a (". It will then replace it later on with nothing to remove the space.
    let whiteSpaceBeforeParenRegex = /(?<=[\w]) (?=\()/;
  
    //this loop will do all the heavy work. Reading, Writing, and Formatting with regexes
    //temp does not start writing until the level is greater than -1. This will happen right after the first '{'
    for (let i = 0; i < query.length; i += 1) {

        //when we hit an open brace we want to start writing to our temp object. This is how we differentiate between levels of our query
        //braces indicate that you've moved deeper into an object like normal javascript objects and we follow that
        if (query[i] === '{') {
            
            //increment the level both starting the writing process and allowing us to track which level we set our key value pairs to in the obj
            level += 1;

            //this section trims all the uneccessary return spaces whitespaces all of it and reformats in between queries where it needs to
            //to produce standardized lines we can work with later
            temp = temp.replace(/[\n]/g, '').trim();
            temp = temp.replace(/[\s]+/g, ' ');
            temp = temp.replace(whiteSpaceBeforeParenRegex, '');
  
            //the temp only equals "" when it is on the very first like 'query {'
            //when it's not blank and we already know we're going to move deeper because we hit a '{' we 'push'/add to our object
            //reset temp so we can start writing a new line
            if (temp !== "") {
                cacheObj[temp] = level;
            }
            //reset temp
            temp = ''
        }

        //on a closing brace we know we're going to be moving down a level, so we do some trimming and adding of our temp string,
        //decrementing the level, resetting temp. Very similar to the case above, the main difference is the decrementing and most
        //importantly, we check here if we have finished a whole independent query. If so we can push it to the caching array.
        else if (query[i] === '}') {

            //trimming actions, same as above
            temp = temp.replace(/[\n]/g, '').trim();
            temp = temp.replace(/[\s]+/g, ' ');
            temp = temp.replace(whiteSpaceBeforeParenRegex, '');

            //adding temp to our cacheObj
            if (temp !== "") {
                cacheObj[temp] = level + 1;
            }
            //resetting temp
            temp = ''
            //decrementing the level, aka moving one back in the object depth
            level -= 1;
            
            //this is the biggest difference, if we detect that we have hit a level 0, this means that we have completed a whole query
            //aka we've reached a fully independent query, so we can push that to the globalCacheArr and continue if we need to
            //making sure to reset the cacheObj so we can use it again
            if (level === 0) {
                globalCacheArr.push(cacheObj)
                cacheObj = {}
            }
        }

        //this case is a basic writing scenario. As long as we are above level -1, aka past 'query {', temp is continuously writing a string
        else if (level > -1) {
            temp += query[i];
        }
    }
    
    //finally return the array of independent query object that we've given depth layer values to
    return globalCacheArr;
  }

  module.exports =  layerQueryFields  




