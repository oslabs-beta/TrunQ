import React, { Component } from 'react'

const BoatSelector = props => {

  return (
    <select id='cacheType'>
      <option value="" disabled selected>Select your option</option>
      <option value="Client-side">Client-Side Cache</option>
      <option value="Server-side">Server-Side Cache</option>
      <option value="Both sides">Cache in both</option>
    </select>
  )
}

export default BoatSelector







