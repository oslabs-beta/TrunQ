import React from 'react'

const Scoreboard = props => {
  console.log('props in Scoreboard: ', props.fetchTime)
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
    console.log('tuple pos 0: ', el[0]);
    console.log('tuple pos 1: ', typeof el[1]);
    cacheTimes[el[0]] += el[1];
    cacheCount[el[0]] += 1;
  })
  console.log('cacheTime obj: ', cacheTimes);

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