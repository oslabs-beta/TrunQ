import React, { Component } from 'react'

const ArtCard = props => {
    let imgGallery = [];
    for(let i = 0; i < props.artistInfo.data.artist.artworks.length; i += 1) {
        imgGallery.push(<img src={props.artistInfo.data.artist.artworks[i].imageUrl} />)
    }
    return (

        <div className="artCard">
            <h1>{props.artistInfo.data.artist.name}</h1>
            {imgGallery}
        </div>
    )
}

export default ArtCard