import React, { Component } from 'react'

const BoatSelector = props => {

  return (
    <select id='cacheType'>
      <option value="" disabled selected>Select your option</option>
      <option value="Bow">Bow</option>
      <option value="Stern">Stern</option>
      <option value="Ship">Ship</option>
    </select>
  )
}

export default BoatSelector







