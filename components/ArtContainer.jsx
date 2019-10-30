import React, { Component } from 'react'
import ArtCard from './ArtCard.jsx'

class ArtContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            artistName: null,
            numPaintings: null,
            artistInfo: []
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleNumChange = this.handleNumChange.bind(this);
        this.queryBuilder = this.queryBuilder.bind(this);

    }

    handleClick () {
        event.preventDefault()
        const query = this.queryBuilder(this.state.artistName, this.state.numPaintings)
        let startTime = Date.now(); 
        fetch('https://metaphysics-production.artsy.net', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: query})
        })
        .then(res => res.json())
        .then(info => {
            console.log(info)
            this.setState({ artistInfo: [...this.state.artistInfo, info] })
        })

    }

    handleNumChange (e) {
        this.setState({numPaintings: e.target.value});
    }

    handleNameChange (e) {
        this.setState({artistName: e.target.value});
    }

    queryBuilder (artist, number) {
        return `query {
            artist(id: "${artist}") {
              name
              artworks (size: ${number}) {
                id
                imageUrl
              }
            }
          }`
    }

    render() {
        let artCardArray = [];
        for (let i = 0; i < this.state.artistInfo.length; i += 1) {
            artCardArray.push(<ArtCard artistInfo={this.state.artistInfo[i]} />)
        }
        return (
            <div className = "artContainer">
                <h1>art card</h1>
                <form>
                    <input id="artistName" value={this.state.artistName} onChange={this.handleNameChange} type="text" />
                    <input id="numPaintings" value={this.state.numPaintings} onChange={this.handleNumChange} type="text" />
                    <button onClick={(event) => this.handleClick(event)}>QUERY ARTIST NAME</button>
                </form>
                {artCardArray}
            </div>
        )
    }
}

export default ArtContainer