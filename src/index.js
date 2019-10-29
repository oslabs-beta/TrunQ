let pokeButton1 = document.querySelector('#pokebutton1')
let pokeButton2 = document.querySelector('#pokebutton2')
let timer = document.querySelector('#time')
let attackText = document.querySelector('#attacks')

let poke
let query
let startTime
let timeElapsed

//build poke graphql api functionality into an event listener
pokeButton1.addEventListener('click', ()=>{
    poke = document.querySelector('#pokeinput').value
    query = `query {
        pokemon(name: "${poke}") {
          attacks {
            special {
              name
            }
          }
          evolutions {
              name
          }
        }
      }`
    fetchDatafromFrontend();
})

pokeButton2.addEventListener('click', ()=>{
    fetchDatafromBackend();
})

function fetchDatafromFrontend () {
    console.log("pokebutton clicked");
    startTime = Date.now()
    //check Cache and see if we can skip fetching
    if (readCacheData(poke)) {
        let pokeObj = JSON.parse(readCacheData(poke))
        timeElapsed = Date.now() - startTime
        timer.innerHTML = `Lookup Time: ${timeElapsed}`
        attacks.innerHTML = `Attacks: ${pokeObj.data.pokemon.attacks.special[0].name}`
    }

    //if no cache send full fetch request
    else {
        fetch('https://graphql-pokemon.now.sh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: query})
        })
        .then(res => res.json())
        .then(response => {
            timeElapsed = Date.now() - startTime
            timer.innerHTML = `Lookup Time: ${timeElapsed}`
            attacks.innerHTML = `Attacks: ${response.data.pokemon.attacks.special[0].name}`

            cacheIntoSession(poke, JSON.stringify(response))
        })
    }
}

//simple cache on frontend into session storage
//key will be the poke variable because all pokemon are unique
//value is the returned data
cacheIntoSession = (poke, data) => {
    sessionStorage.setItem(poke, data)
}

readCacheData = (poke) => {
    return sessionStorage.getItem(poke)
}









//backend stuff


function fetchDatafromBackend () {
    console.log("pokebutton clicked");
    fetch('graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({query: query})
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
    })
}
