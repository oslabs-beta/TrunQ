import React, { Component } from 'react'
import ArtCard from './ArtCard.jsx'

class ArtContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            artistNameQuery: null,
            artistName: null,
            numPaintings: null,
            artistInfo: [],
            elapsedTime: []
        }
        this.timer
        this.handleClick = this.handleClick.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleNumChange = this.handleNumChange.bind(this);
        this.queryBuilder = this.queryBuilder.bind(this);

    }

    handleClick () {
        event.preventDefault()
        const query = this.queryNameBuilder(this.state.artistNameQuery);
        let startTime = Date.now(); 
        fetch('https://metaphysics-production.artsy.net', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: query})
        }).then(res => res.json())
        .then(res => {
            console.log(res)
            this.setState({ artistName: res.data.match_artist[0].id })
            this.artFetch(startTime)
        })
    }
    
    artFetch (timer) {
        const query = this.queryBuilder(this.state.artistName, this.state.numPaintings)
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
            const elapsedTime = Date.now() - timer;
            console.log("ELAPSED TIME", elapsedTime)
            this.setState({ artistInfo: [...this.state.artistInfo, info], elapsedTime: [...this.state.elapsedTime, elapsedTime] })
        })
    }

    handleNumChange (e) {
        this.setState({numPaintings: e.target.value});
    }

    handleNameChange (e) {
        this.setState({artistNameQuery: e.target.value});
    }

    queryNameBuilder (artist) {
        return `query{
            match_artist (term: "${artist}") {
              id
            }
        }`
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
            artCardArray.push(<ArtCard artistInfo={this.state.artistInfo[i]} elapsedTime={this.state.elapsedTime[i]}/>)
        }
        return (
            <div className = "artContainer">
                <h1>art card</h1>
                <form>
                    <input id="artistName" value={this.state.artistNameQuery} onChange={this.handleNameChange} type="text" />
                    <input id="numPaintings" value={this.state.numPaintings} onChange={this.handleNumChange} type="text" />
                    <button onClick={(event) => this.handleClick(event)}>QUERY ARTIST NAME</button>
                </form>
                {artCardArray}
            </div>
        )
    }
}

export default ArtContainer