import React, { Component } from 'react'
import PokeCard from './PokeCard.jsx'
import { findDeprecatedUsages } from 'graphql';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pokeInfo: [],
            pokeName: null, 
            fetchTime: []   
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.queryBuilder = this.queryBuilder.bind(this);

    }

    handleClick (event) {
        event.preventDefault()
        const query = this.queryBuilder(this.state.pokeName);
        let startTime = Date.now(); 
        fetch('https://graphql-pokemon.now.sh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: query})
        })
        .then(res => res.json())
        .then(info => {
            let pokeArray = [...this.state.pokeInfo, info]
            let elapsedTime = Date.now() - startTime;
            let timeArray = [...this.state.fetchTime, elapsedTime];
            this.setState({ pokeInfo: pokeArray, fetchTime: timeArray })
        })
    }

    handleNameChange (e) {
        this.setState({pokeName: e.target.value});
    }

    queryBuilder (pokeName) {
        return  `query {
                    pokemon(name: "${pokeName}") {
                      name
                      image
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
    }

    render() {
        const pokeCards = []
        for (let i = 0; i < this.state.pokeInfo.length; i += 1) {
            pokeCards.push(<PokeCard pokeInfo={this.state.pokeInfo[i]} fetchTime={this.state.fetchTime[i]}/>)
        }
        return (
            <div>
                <form>
                    <input id="pokeName" value={this.state.pokeName} onChange={this.handleNameChange} type="text" />
                    <button onClick={(event) => this.handleClick(event)}>QUERY POKEMON NAME</button>
                </form>
                    {pokeCards}
            </div>
        )
    }
}

export default App;