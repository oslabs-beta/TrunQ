let pokeButton1 = document.querySelector('#pokebutton1')
let pokeButton2 = document.querySelector('#pokebutton2')
//test query

const query = `{
  pokemon(name: "Pikachu") {
    attacks {
      special {
        name
      }
    }
  }
}`

//build poke graphql api functionality into an event listener
pokeButton1.addEventListener('click', ()=>{
    fetchDatafromFrontend();
})

pokeButton2.addEventListener('click', ()=>{
    fetchDatafromBackend();
})

function fetchDatafromFrontend () {
    console.log("pokebutton clicked");
    fetch('https://graphql-pokemon.now.sh/', {
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