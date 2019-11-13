import React, { Component } from 'react'
import PokeCard from './PokeCard.jsx'
import trunQify from '../functions/trunQify'
import BoatSelector from './boatSelector.jsx'
import Scoreboard from './Scoreboard.jsx'

class PokeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pokeInfo: [],
            fetchTime: [],
            //fetchTime: {
            //    Bow: [],
            //    Stern: [],
            //    Ship: []
            //}
            bowFetchTime: [],
            sternFetchTime: [],
            evolutionBool: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.pokeQueryBuilder = this.pokeQueryBuilder.bind(this);
        this.handleTruth = this.handleTruth.bind(this);
        this.pokeSection = React.createRef();
    }

    async handleClick(event) {
        event.preventDefault()
        let pokeNames = []
        //step 1: take all the inputs and push them into the pokeNames Array
        let inputArr = document.querySelectorAll('.pokeInput')
        inputArr.forEach(x => pokeNames.push(x.value))

        //step 2: build the query by concatting strings
        let query = 'query {'
        pokeNames.forEach(name => {
            if (name.length > 0) {
                query += this.pokeQueryBuilder(name, this.state.evolutionBool)
            }
        })
        query += '}'

        // const query = this.pokeQueryBuilder(this.state.pokeName, this.state.evolutionBool);
        let startTime = Date.now();

        // TRUNQIFY THIS SHIT
        let info;
        let cacheSelector = document.getElementById('cacheType').value;

        let translate = ''
        if (cacheSelector === 'Client-side') translate = 'Bow'
        else if (cacheSelector === 'Server-side') translate = 'Stern'
        else translate = 'Ship'
        info = await trunQify(query, ["name"], [], '/graphql', translate);
        let elapsedTime = []

        console.log("RETURNED OUT OF TRUNQ", info)
        
        info = info.reduce((pokeResArray, pokeResInfo) => {
            if (pokeResInfo.data.pokemon !== null) pokeResArray.push(pokeResInfo)
            return pokeResArray
        }, []);
        info.forEach((res) => {
            if (this.state.fetchTime.length < 1) {
                elapsedTime.push(['No cache', Date.now() - startTime]);
            } else {
                elapsedTime.push([cacheSelector, Date.now() - startTime]);
            }``
        });
        let pokeArray = [...this.state.pokeInfo, ...info]
        let timeArray = [...this.state.fetchTime, ...elapsedTime]
        this.setState({ pokeInfo: pokeArray, fetchTime: timeArray })
        // let timeArray
        // if (cacheSelector === 'Bow') {
        //     timeArray = [...this.state.bowFetchTime, ...elapsedTime]
        //     this.setState({ pokeInfo: pokeArray, bowFetchTime: timeArray })
        // } else {
        //     timeArray = [...this.state.sternFetchTime, ...elapsedTime]
        //     this.setState({ pokeInfo: pokeArray, sternFetchTime: timeArray })
        // }

        // console.log('bowFetchTime: ', this.state.bowFetchTime);
        // console.log('sternFetchTime: ', this.state.sternFetchTime);
        // let timeArray = [...this.state.fetchTime, ...elapsedTime];
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
                      types
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
        console.log(query)
        return query
    }





    render() {

        // let cacheDropDownSetting = document.getElementById('cacheType').value;

        // let cardFetchTime;

        // if (cacheDropDownSetting === 'bow') {
        //     cardFetchTime = this.state.bowFetchTime;
        // } else {
        //     cardFetchTime = this.state.sternFetchTime;
        // }

        const pokeCards = []
        for (let i = 0; i < this.state.pokeInfo.length; i += 1) {
            pokeCards.push(<PokeCard key={`pokeCard${i}`} pokeInfo={this.state.pokeInfo[i]} cacheType={this.state.fetchTime[i][0]} fetchTime={this.state.fetchTime[i][1]} />)
        }

        return (
            <div className='pokeContainer' ref={this.pokeSection}>
                <h1 className='hero-title'>POKEMON CARDS</h1>
                <form className='pokemon-form'>
                    <input id="pokeName1" className="pokeInput" onChange={this.handleNameChange} type="text" placeholder='POKEMON'/>
                    <input id="pokeName2" className="pokeInput" onChange={this.handleNameChange} type="text" placeholder='POKEMON'/>
                    <input id="pokeName3" className="pokeInput" onChange={this.handleNameChange} type="text" placeholder='POKEMON'/>
                    <BoatSelector/>
                    <button onClick={(event) => this.handleClick(event)} className='poke-query'>CACHE THEM ALL!!!</button>
                    {/* <input type='checkbox' onChange={this.handleTruth}></input> */}
                </form>
                <Scoreboard fetchTime={this.state.fetchTime} />
                <div className='cardContainer'>
                    {pokeCards}
                </div>
            </div>
        )
    }
}

export default PokeContainer;                 
