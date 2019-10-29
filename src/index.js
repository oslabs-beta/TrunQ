let pokeButton = document.querySelector('#pokebutton')

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
pokeButton.addEventListener('click', ()=>{
    fetch("graphql-pokemon.now.sh",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    })
    .then(res=>res.json())
    .then(data=>console.log(data))
})
