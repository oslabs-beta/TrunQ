import React, { Component } from 'react'
import PokeCard from './PokeCard.jsx'

class App extends Component {
    constructor(props) {
        super(props);
        this.query = `query {
                    pokemon(name: "Pikachu") {
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
        this.state = {
            pokeInfo: null
        }
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick () {
        fetch('https://graphql-pokemon.now.sh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: this.query})
        })
        .then(res => res.json())
        .then(info => {
            this.setState({pokeInfo: info})
        })
    }

    render() {
        return (
            <div>
                <button onClick={() => this.handleClick()}>WOW I ROCK</button>
                <PokeCard pokeinfo={this.state.pokeInfo} />
            </div>
        )
    }
}

export default App;