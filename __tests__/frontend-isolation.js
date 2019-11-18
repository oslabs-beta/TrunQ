
import keyedQueries from '../functions/keyedQueries.js';
import parseVariables from '../functions/parser.js';
import partialMatcher from '../functions/partialMatcher.js';
import layerQueryFields from '../functions/layerQueryFields.js'
import queryObjectBuilder from '../functions/queryObjectBuilder.js'
import stitchResponses from '../functions/stitchResponses.js';

describe('keyedQueries', () => {

  // store of properties of each query required for functions called within TrunQify
  const queries2 = {
    oneLevelDeep1: 
      {
        firstQueryFormat: 'query { pokemon(name: "Pikachu") {name image types attacks {special {name} } }s',
        uniques: ['name'],
        limits: ['first', 'last', 'after', 'size'],
        cachedResult: {"data":{"pokemon":{"name":"Pikachu","image":"https://img.pokemondb.net/artwork/pikachu.jpg","types":["Electric"],"attacks":{"special":[{"name":"Discharge"},{"name":"Thunder"},{"name":"Thunderbolt"}]}}}},
        currentKey: ["pokemon-pikachu"],
        secondQueryFormat: 'query{  pokemon(name: "pikachu") { name image types attacks { special { name } }} }',
        cachedResults2: [{"pokemon-pikachu":{"pokemon":{"name":"Pikachu","image":"https://img.pokemondb.net/artwork/pikachu.jpg","types":["Electric"],"attacks":{"special":[{"name":"Discharge"},{"name":"Thunder"},{"name":"Thunderbolt"}]}}}}],
        storageLocation: 'client', 
      },
    oneLevelDeep2: 
      {
        firstQueryFormat: 'query { pokemons(first: 20) {name image types attacks { special {name}} maxHP } }s',
        uniques: [],
        limits: ['first', 'last', 'after', 'size'],
      }
  }
  
  // keyedQueries(query, uniques, limits)
  describe('return a unique key for one item', () => {
    it('key for one pokemon query', () => {
      expect(keyedQueries(
        queries2.oneLevelDeep1.firstQueryFormat, 
        queries2.oneLevelDeep1.uniques, 
        queries2.oneLevelDeep1.limits)).toEqual([{"pokemon-Pikachu": "query{  pokemon(name: \"Pikachu\") {name image types attacks {special {name} } } }"}])
    })
  })

  // keyedQueries(query, uniques, limits)
  describe('return a key for top n items', () => {
    it('key for top n number of pokemon', () => {
      expect(keyedQueries(
        queries2.oneLevelDeep2.firstQueryFormat, 
        queries2.oneLevelDeep2.uniques, 
        queries2.oneLevelDeep2.limits)).toEqual([{"pokemons": "query{  pokemons(first: 20) {name image types attacks { special {name}} maxHP } }"}])
    })
  })

  describe('partialMatcher', () => {

    const expectResult = {"filledSkeleton": {"pokemon-pikachu": {"pokemon": {"attacks": {"special": [{"name": "Discharge"}, {"name": "Thunder"}, {"name": "Thunderbolt"}]}, "image": "https://img.pokemondb.net/artwork/pikachu.jpg", "name": "Pikachu", "types": ["Electric"]}, "trunQVariables": {"name": "pikachu"}}}, "futureQueries": ["pokemon", "attacks"], "partialQuery": "query { pokemon(name: \"pikachu\") { attacks { special { name } }}}"}

    // partialMatcher (query, cachedResult, currentKey, uniques=[], limits=[])
    it('check partialMatcher', () => {
      expect(partialMatcher(
        queries2.oneLevelDeep1.secondQueryFormat, 
        queries2.oneLevelDeep1.cachedResult, 
        queries2.oneLevelDeep1.currentKey, 
        queries2.oneLevelDeep1.uniques,
        queries2.oneLevelDeep1.limits)).toEqual(expectResult);
    })
  })

  describe('stitchResponses', () => {

    const expectResult = [{"pokemon": {"attacks": {"special": [{"name": "Discharge"}, {"name": "Thunder"}, {"name": "Thunderbolt"}]}, "image": "https://img.pokemondb.net/artwork/pikachu.jpg", "name": "Pikachu", "types": ["Electric"]}}]

    // stitchResponses (results, storageLocation)
    it('check stitchResponses', () => {
      expect(stitchResponses(queries2.oneLevelDeep1.cachedResults2,
        queries2.oneLevelDeep1.storageLocation)).toEqual(expectResult);
    })
  })

})
