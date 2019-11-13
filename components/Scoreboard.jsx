import React from 'react'

const Scoreboard = props => {
  // store the cache times for each method
  const cacheTimes = {
    'No cache': 0,
    'Server-side': 0,
    'Client-side': 0
  };
  const cacheCount = {
    'No cache': 0,
    'Server-side': 0,
    'Client-side': 0
  }
  props.fetchTime.forEach(el => {
    cacheTimes[el[0]] += el[1];
    cacheCount[el[0]] += 1;
  })
  return (
    <div className='scoreboard'>
      <table>
        <tr>
          <th>CACHE TYPE: </th>
          <th>No Cache</th>
          <th>Server-side</th>
          <th>Client-side</th>
        </tr>
        <tr>
          <td>AVERAGE TIMES: </td>
          <td>{cacheTimes['No cache'] / cacheCount['No cache']}</td>
          <td>{cacheTimes['Server-side'] / cacheCount['Server-side']}</td>
          <td>{cacheTimes['Client-side'] / cacheCount['Client-side']}</td>
        </tr>
      </table>
    </div>
  )
}

export default Scoreboard