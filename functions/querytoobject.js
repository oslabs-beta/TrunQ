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
    }
    jazzsaxartist {
        name
    }
}`
// artist-mark-rothko: {
//   data: {
//     artist: {
//         name: {}
//         artworks: {
//             trunQlimits: {
//                 id: chapel
//                 size: 2
//             }
//             [{id: {}, imageUrl1: {}},
//             {id2: {}, imageUrl2: {}}]
//         }
//      }
//   }
// }



const layerQueryChildren = (query, uniques = [], limits = []) => {
    const queryObject = {
        data: {}
    }
    let removeVars =  /[\w]* *\(([^()]+)\)/g
    let regexQuery = query.match(removeVars);

    let temp = '';
    let arr = [];

    let parenStack = [];

    for (let i = 0; i < query.length; i += 1) {
        if (query[i] === '}') {
            parenStack.pop();
        }
        else if (query[i] === '{') {
            arr.push([parenStack.length, temp]);
            temp = '';
            parenStack.push('{');
        }
        else if (parenStack.length > 0) {
            temp += query[i];
        }
        if (i === query.length - 1) {
            arr.push([parenStack.length, temp]);
        }
    }

    // let whitespaceRegex = /[\r\n]/g;
    // arr = arr.map(el => {
    //     return el.replace(whitespaceRegex, '').trim();
    // })
    console.log(arr)

    return queryObject;
}

layerQueryChildren(query2, ["id"], ["size"])















// artist-mark-rothko: {
//     "data": {
//       "artist": {
//         "name": "Mark Rothko",
//         "artworks": [
//           {
//             "id": "mark-rothko-untitled-2",
//             "imageUrl": "https://d32dm0rphc51dk.cloudfront.net/TrITRbfwKGs9a4YHf74UJg/square.jpg"
//           },
//           {
//             "id": "mark-rothko-number-10",
//             "imageUrl": "https://d32dm0rphc51dk.cloudfront.net/_SJ9ViOWmrEMch8hegHrtg/square.jpg"
//           }
//         ]
//       }
//     }
//   }
//