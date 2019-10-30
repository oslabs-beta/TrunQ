import React, { Component } from 'react'

const PokeCard = props => {
    return (
        <div style={{border: "3px solid black", height: "200px", width: "200px"}}>
            <h1>{props.pokeInfo.data.pokemon.name}</h1>
            
            <img src={props.pokeInfo.data.pokemon.image} style={{height: 50, width: 50}} />
            {/* <p>{props.pokeInfo.data.pokemon.attacks.special[0]}</p> */}
            <p>Time to Fetch: {props.fetchTime} ms</p>
        </div>
    )
}

export default PokeCard