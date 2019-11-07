import React, { Component } from 'react'

const PokeCard = props => {
    
    return (
        <div style={{ border: "3px solid black", height: "240px", width: "200px" }}>
            <h1>{props.pokecards2Pokemon.name}</h1>
            <img src={props.pokecards2Pokemon.picture} style={{ height: 50, width: 50 }} />
            <p>Evolutions </p>
            <p>Time to Fetch: {props.pokecards2Pokemon.delay} ms</p>
            <p>Caching type: {props.pokecards2Pokemon.cacheType}</p>
        </div>

    )
}

export default PokeCard