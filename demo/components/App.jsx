import React, { Component } from 'react'
import PokeContainer from './PokeContainer.jsx'
import ArtContainer from './ArtContainer.jsx'
import styles from '../dist/styles.css'

class App extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="mainContainer">
                <PokeContainer></PokeContainer>
                {/* <ArtContainer></ArtContainer>*/}
            </div>
        )
    }
}

export default App