const query1 = `query {
    pokemon(name: "pikachu" id:2 size:2) {
        name
        image
        attacks {
            special {
                name
            }
        }
    }
}`


const parserOutput = [ 'artist-mark-rothko',
{ uniques: { id: 'mark-rothko' }, limits: {}, query: 'artist' } ]


const query3 = `query {
    artist(id: "mark-rothko") {
        name
        deathday
    }
}`

const query2 = `query {
    artist(id: "mark-rothko") {
        name
        artworks (id: "chapel" size: 2) {
            id
            imageUrl
        }
        bullshit
    }
    jazzsaxartist {
        name
    }
}`

const cache = { 
  "artist-mark-rothko": {
    data: {
      artist: {
        name: "Mark Rothko",
        artworks: {
            trunQlimits: {
                id: "chapel",
                size: 2
            },
            trunQarrays: 
                [{id: "UntitledMasterpiece", imageUrl1: "www.awesomeart.com"},
                {id2: "EvenBetterPainting", imageUrl2: "www.radArt.com"}]
        }
      }
    }
  },
  "jazzsaxartist": {
    data: {
        name: "Ron Swanson"
    }
  }
}

const emptyCacheObjFromQuery2 = { 
    "artist-mark-rothko": {
      data: {
        artist: {
          name: {},
          artworks: {
              trunQlimits: {
                  id: "chapel",
                  size: 2
              },
              trunQarrays: 
                  [{id: {}, imageUrl1: {}},
                  {id2: {}, imageUrl2: {}}]
          }
        }
      }
    },
    "jazzsaxartist": {
      data: {
          name: {}
      }
    }
  }

// "THE 20%"

const layerQueryFields = (query, uniques = [], limits = []) => {

    let temp = '';
    let cacheObj = {};
    const globalCacheArr = []
    let level = -1;

    for (let i = 0; i < query.length; i += 1) {
        if (query[i] === '{') {
            level += 1;
            temp = temp.replace(/[\n]/g, '').trim();
            temp = temp.replace(/[\s]+/g, ' ');
            if (temp !== "") {
                cacheObj[temp] = level;
            }
            temp = ''
        }
        else if (query[i] === '}') {
            temp = temp.replace(/[\n]/g, '').trim();
            temp = temp.replace(/[\s]+/g, ' ');
            if (temp !== "") {
                cacheObj[temp] = level + 1;
            }
            temp = ''
            level -= 1;
            if (level === 0) {
                globalCacheArr.push(cacheObj)
                cacheObj = {}
            }
        }
        else if (level > -1) {
            temp += query[i];
        }

    }

    console.log(globalCacheArr);

    return globalCacheArr;
}

layerQueryFields(query2, ["id"], ["size"]);



