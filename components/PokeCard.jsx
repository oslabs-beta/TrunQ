import React, { Component } from 'react'

const PokeCard = props => {
    let evolutions = ''
    if (props.pokeInfo.data.pokemon.evolutions) {
        evolutions = props.pokeInfo.data.pokemon.evolutions[0].name
    }

    return (
        <div className='poke-card'>
            <h1>{props.pokeInfo.data.pokemon.name}</h1>

            <img src={props.pokeInfo.data.pokemon.image} style={{ height: 100, width: 100 }} />
            <p>{props.cacheType} lookup time: {props.fetchTime} ms</p>


        </div>
    )
}

export default PokeCard