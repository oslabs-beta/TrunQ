// const keyedQueries = require('../functions/keyedQueries.js');
// const parseVariables = require('../functions/parser.js');

import keyedQueries from '../functions/keyedQueries.js';
import parseVariables from '../functions/parser.js';
import partialMatcher from '../functions/partialMatcher.js';
import layerQueryFields from '../functions/layerQueryFields.js'
import queryObjectBuilder from '../functions/queryObjectBuilder.js'

// functions to test:
  // keyedQueries -> done
  // partialMatcher -> partially done
  // stitchResponses

describe('keyedQueries', () => {
  
  let queries = {};
  let uniques1;
  let uniques2;
  let limits;

  // store of queries to use for tests
  beforeEach(() => {
    queries = {
      oneLevelDeep1: 'query { pokemon(name: "Pikachu") {name image types attacks {special {name} } }s',
      oneLevelDeep2: 'query { pokemons(first: 20) {name image types attacks { special {name}} maxHP } }s',
      getAll: '',
      getWhereOneCondition: ''
    }
    uniques1 = ["name"];
    uniques2 = [];
    limits = ['first', 'last', 'after', 'size'];
  })
  
  // keyedQueries(query, uniques, limits)
  describe('return a unique key for a query one level deep', () => {
    it('key for one pokemon query', () => {
      
      expect(keyedQueries(queries.oneLevelDeep1, uniques1, limits)).toEqual([{"pokemon-Pikachu": "query{  pokemon(name: \"Pikachu\") {name image types attacks {special {name} } } }"}])
    })
  })

  // keyedQueries(query, uniques, limits)
  describe('return a key for a query one level deep', () => {
    it('key for top n number of pokemon', () => {
      expect(keyedQueries(queries.oneLevelDeep2, uniques2, limits)).toEqual([{"pokemons": "query{  pokemons(first: 20) {name image types attacks { special {name}} maxHP } }"}])
    })
  })

  describe('partialMatcher', () => {

    let cachedResult = {"data":{"pokemon":{"name":"Pikachu","image":"https://img.pokemondb.net/artwork/pikachu.jpg","types":["Electric"],"attacks":{"special":[{"name":"Discharge"},{"name":"Thunder"},{"name":"Thunderbolt"}]}}}}
    let currentKey = ["pokemon-pikachu"];
    let query = 'query{  pokemon(name: "pikachu") { name image types attacks { special { name } }} }';

    // partialMatcher (query, cachedResult, currentKey, uniques=[], limits=[])
    it('check partialMatcher', () => {
      expect(partialMatcher(query, cachedResult, currentKey, uniques1)).toEqual('')
    })

  })

})


