import React, { Component } from 'react'
import PokeCard from './PokeCard.jsx'
import trunQify from '../functions/trunQify'

class PokeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pokeInfo: [],
<<<<<<< HEAD
            pokeName: null,
=======
>>>>>>> frontend-caching
            fetchTime: [],
            evolutionBool: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.pokeQueryBuilder = this.pokeQueryBuilder.bind(this);
        this.handleTruth = this.handleTruth.bind(this)

        this.pokeSection = React.createRef();
    }

<<<<<<< HEAD
    handleClick(event) {
        event.preventDefault()
        const query = this.pokeQueryBuilder(this.state.pokeName, this.state.evolutionBool);
        let startTime = Date.now();
        // TRUNQIFY THIS SHIT
        trunQify(query, ["name"], [], '/graphql');
        // fetch('https://graphql-pokemon.now.sh/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({query: query})
        // })
        // .then(res => res.json())
        // .then(info => {
        //     let pokeArray = [...this.state.pokeInfo, info]
        //     let elapsedTime = Date.now() - startTime;
        //     let timeArray = [...this.state.fetchTime, elapsedTime];
        //     this.setState({ pokeInfo: pokeArray, fetchTime: timeArray })
        // })
=======
    async handleClick (event) {
        event.preventDefault()
        let pokeNames = []
        //step 1: take all the inputs and push them into the pokeNames Array
        let inputArr = document.querySelectorAll('.pokeInput')
        inputArr.forEach(x => pokeNames.push(x.value))

        //step 2: build the query by concatting strings
        let query = 'query {' 
        pokeNames.forEach(name => {
            if (name.length > 0) {
                query += this.pokeQueryBuilder(name, this.state.evolutionBool)
            }
        })
        query += '}'
        
        // const query = this.pokeQueryBuilder(this.state.pokeName, this.state.evolutionBool);
        let startTime = Date.now(); 

        // TRUNQIFY THIS SHIT
        let info;
        
        info = await trunQify(query, ["name"], [], '/graphql', 'bow')
        let elapsedTime = []
        console.log(info)
        info = info.reduce( (a,b) => { 
            if (b.data.pokemon !== null) a.push(b)
            return a
        },[])

        console.log(info)
        info.forEach((res, i) => {
                elapsedTime.push(Date.now() - startTime);
        })
        console.log(elapsedTime)

        let timeArray = [...this.state.fetchTime, ...elapsedTime];
        let pokeArray = [...this.state.pokeInfo, ...info]
        this.setState({ pokeInfo: pokeArray, fetchTime: timeArray })

>>>>>>> frontend-caching
    }

    handleNameChange(e) {
        this.setState({ pokeName: e.target.value });
    }

<<<<<<< HEAD
    handleTruth() {
        let truth
        if (this.state.evolutionBool) truth = false
        else { truth = true }
        this.setState({ evolutionBool: truth })
        console.log(this.state.evolutionBool)
    }

    pokeQueryBuilder(pokeName, evolutions = false) {
        // let query = `query {
        //             pokemon(name: "${pokeName}") {
        //               name
        //               image
        //               attacks {
        //                 special {
        //                   name
        //                 }
        //               }`

        //     if (evolutions) {
        //         query +=(`
        //         evolutions {
        //             name
        //         }
        //       }
        //   }`)
        //     }
        //     else{
        //         query +=(
        //           `  }
        //         }`  
        //         )
        //     }
        // console.log(query)
        // return query      
                // pokemon(name: "Raichu") {
                //     name
                //     image
                // }
                // pokemon(name: "Eevee") {
                //     name
                //     image
                // }
        let query = `query {
            pokemon(name: "charmander") {
                name
                image
=======
    //handles evolution toggle
    handleTruth () {
        let truth
        if (this.state.evolutionBool) truth = false
        else {truth = true}
        this.setState({evolutionBool: truth})
    }

    pokeQueryBuilder (pokeName, evolutions = false) {
          let query = `
                    pokemon(name: "${pokeName}") {
                      name
                      image
                      attacks {
                        special {
                          name
                        }
                      }`

            if (evolutions) {
                query +=`
                evolutions {
                    name
                }
              }`
            }
            else{
                query +=`}`    
>>>>>>> frontend-caching
            }
        console.log(query)
        return query  
    }

    render() {
        const pokeCards = []
        for (let i = 0; i < this.state.pokeInfo.length; i += 1) {
<<<<<<< HEAD
            pokeCards.push(<PokeCard pokeInfo={this.state.pokeInfo[i]} fetchTime={this.state.fetchTime[i]} />)
        }
        return (
            <div className='pokeContainer'>
=======
            pokeCards.push(<PokeCard key={`pokeCard${i}`} pokeInfo={this.state.pokeInfo[i]} fetchTime={this.state.fetchTime[i]}/>)
        }
        return (
            <div className = 'pokeContainer' ref={this.pokeSection}>
>>>>>>> frontend-caching
                <h1>poke card</h1>
                <form>
                    <input id="pokeName1" className="pokeInput"  onChange={this.handleNameChange} type="text" />
                    <input id="pokeName2" className="pokeInput"  onChange={this.handleNameChange} type="text" />
                    <input id="pokeName3" className="pokeInput"  onChange={this.handleNameChange} type="text" />

                    <button onClick={(event) => this.handleClick(event)}>QUERY POKEMON NAME</button>
                    <input type='checkbox' onChange={this.handleTruth}></input>
                </form>
                {pokeCards}
            </div>
        )
    }
}

export default PokeContainer;


// fetch('https://graphql-pokemon.now.sh/', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({query: query})
        // })
        // .then(res => res.json())
        // .then(info => {
        //     let pokeArray = [...this.state.pokeInfo, info]
        //     let elapsedTime = Date.now() - startTime;
        //     let timeArray = [...this.state.fetchTime, elapsedTime];
        //     this.setState({ pokeInfo: pokeArray, fetchTime: timeArray })
        // })
        // .then(info => {
        //     let pokeArray = [...this.state.pokeInfo, info]
        //     let elapsedTime = Date.now() - startTime;
        //     let timeArray = [...this.state.fetchTime, elapsedTime];
        //     this.setState({ pokeInfo: pokeArray, fetchTime: timeArray })
        // })



                  