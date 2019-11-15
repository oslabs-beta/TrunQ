import keyedQueries from '../functions/keyedQueries.js';

describe('keyedQueries', () => {
  
  // store of queries to use for tests
  beforeEach(() => {
    queries = {
      oneLevelDeep: 'pokemon(name: "Pikachu") {name image types attacks {special {name}}',
      getAll: '',
      getWhereOneCondition: ''
    }
  })
  
  // keyedQueries(query, uniques, limits)
  describe('return a key for a query one level deep', () => {
    it('one level test for keyedQuries', () => {
      expect(keyedQueries(queries.oneLevelDeep, ["name"], ['first', 'last', 'after', 'size']).toEqual(''))
    })
  })

})






