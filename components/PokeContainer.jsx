import React, { Component } from 'react'
import PokeCard from './PokeCard.jsx'
import trunQify from '../functions/trunQify'
import BoatSelector from './boatSelector.jsx'

class PokeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pokecards2: [],
            pokeInfo: [],
            fetchTime: [],
            evolutionBool: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.pokeQueryBuilder = this.pokeQueryBuilder.bind(this);
        this.handleTruth = this.handleTruth.bind(this)

        this.pokeSection = React.createRef();
    }

    async handleClick(event) {
        event.preventDefault()

        // new variables
        let newPokemonNames = [];
        let cacheSelector;
        let newCards = []; // hold generated cards for new search
        // old variables
        let elapsedTime = [];
        let startTime = Date.now();
        let endTime;
        let pokeNames = [];
        let inputArr = document.querySelectorAll('.pokeInput');
        let info;

        // if there are no cards saved the current search should not be cached
        if (this.state.pokecards2.length > 0) {
            cacheSelector = document.getElementById('cacheType').value;
        } else {
            cacheSelector = 'No Cache';
        }

        //step 1: take all the inputs and push them into the pokeNames Array
        inputArr.forEach(x => {
            pokeNames.push(x.value);
            if (x.value !== '') {
                newPokemonNames.push(x.value);
            }
        })

        //step 2: build the query by concatting strings
        let query = 'query {'
        pokeNames.forEach(name => {
            if (name.length > 0) {
                query += this.pokeQueryBuilder(name, this.state.evolutionBool)
            }
        })
        query += '}'
        
        
        info = await trunQify(query, ["name"], [], '/graphql', cacheSelector);
        endTime = Date.now();

        //push select API data into an array
        info = info.reduce((pokeResArray, pokeResInfo) => {
            if (pokeResInfo.data.pokemon !== null) pokeResArray.push(pokeResInfo)
            return pokeResArray
        }, []);

        //populate array for storing delay times
        for(let i = 0; i < info.length; i += 1) {
            elapsedTime[i] = endTime - startTime;
        }
        
        // create new pokeman card objects for searched pokemon
        for (let i = 0; i < newPokemonNames.length; i += 1) {
            const newPokemonCard = {};

            newPokemonCard.name = newPokemonNames[i];
            newPokemonCard.picture = info[i].data.pokemon.image;
            newPokemonCard.delay = elapsedTime[i];
            newPokemonCard.cacheType = cacheSelector

            newCards.push(newPokemonCard);
        }

        //update state
        let pokecardsArr = [...this.state.pokecards2, ...newCards];
        this.setState({pokecards2: pokecardsArr});

    }

    handleNameChange(e) {
        this.setState({ pokeName: e.target.value });
    }

    //handles evolution toggle
    handleTruth() {
        let truth
        if (this.state.evolutionBool) truth = false
        else { truth = true }
        this.setState({ evolutionBool: truth })
    }

    pokeQueryBuilder(pokeName, evolutions = false) {
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
            query += `
                evolutions {
                    name
                }
              }`
        }
        else {
            query += `}`
        }

        return query
    }


    render() {

        const pokeCards = []
        
        for (let i = 0; i < this.state.pokecards2.length; i += 1) {
            pokeCards.push(<PokeCard pokecards2Pokemon={this.state.pokecards2[i]}/>)
        }

        return (
            
            <div className='pokeContainer' ref={this.pokeSection}>
                <h1>poke card</h1>
                <form>
                    <input id="pokeName1" className="pokeInput" onChange={this.handleNameChange} type="text" />
                    <input id="pokeName2" className="pokeInput" onChange={this.handleNameChange} type="text" />
                    <input id="pokeName3" className="pokeInput" onChange={this.handleNameChange} type="text" />
                    <button onClick={(event) => this.handleClick(event)}>QUERY POKEMON NAME</button>
                    <BoatSelector />
                    <input type='checkbox' onChange={this.handleTruth}></input>
                </form>
                {pokeCards}
            </div>
            
        )
    }
}

export default PokeContainer;                 
