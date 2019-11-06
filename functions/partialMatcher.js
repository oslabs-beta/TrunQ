// import keyedQueries from './keyedQueries'
const parser = require ('./parser')
const layerQueryFields = require ('./layerQueryFields')
const queryObjectBuilder = require ('./queryObjectBuilder')

function partialMatcher (query, limits, uniques) {
    return queryObjectBuilder(query, limits, uniques);

}

const query = `query {
    artist(id: "${artist}") {
      name
      artworks (size: ${number}) {
        id
        imageUrl
      }
    }
  }`

console.log(partialMatcher(query, ["id"], ["size"]))

// export default partialMatcher;