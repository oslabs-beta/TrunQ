import React from 'react'

const Scoreboard = props => {
  console.log('props in Scoreboard: ', props.fetchTime)
  // store the cache times for each method
  const cacheTimes = {
    'No cache': 0,
    'Stern': 0,
    'Bow': 0
  };
  const cacheCount = {
    'No cache': 0,
    'Stern': 0,
    'Bow': 0
  }
  props.fetchTime.forEach(el => {
    console.log('tuple pos 0: ', el[0]);
    console.log('tuple pos 1: ', typeof el[1]);
    cacheTimes[el[0]] += el[1];
    cacheCount[el[0]] += 1;
  })
  console.log('cacheTime obj: ', cacheTimes);

  return (
    <div>
      <table>
        <tr>
          <th>CACHE TYPE: </th>
          <th>No Cache</th>
          <th>Stern</th>
          <th>Bow</th>
        </tr>
        <tr>
          <td>AVERAGE TIMES: </td>
          <td>{cacheTimes['No cache'] / cacheCount['No cache']}</td>
          <td>{cacheTimes['Stern'] / cacheCount['Stern']}</td>
          <td>{cacheTimes['Bow'] / cacheCount['Bow']}</td>
        </tr>
      </table>
    </div>
  )
}

export default Scoreboard