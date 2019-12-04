<p align="center"><img src="https://github.com/oslabs-beta/TrunQ/blob/master/demo/assets/trunQiconblack.png" width='135' height='110' style="margin-top: 10px; margin-bottom: -10px;"></p>

#
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/oslabs-beta/trunQ/blob/master/LICENSE)
![AppVeyor](https://img.shields.io/badge/build-passing-brightgreen.svg)
![AppVeyor](https://img.shields.io/badge/version-1.1.71-blue.svg)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/oslabs-beta/trunQ/issues)

# TrunQ
TrunQ is an open-source NPM package developed by OS-labs providing an easy and intuitive implementation for caching GraphQL responses on the client and/or server side storage.

Developed by Ben Ray, Brian Haller, Gordon Campbell, and Michael Evans.

## Features

TrunQ has been designed to give the developer the most flexible out-of-the-box caching solution for 3rd party APIs or remote servers.

As of now, TrunQ offers:

storage inside sessionStorage for easy client-side caching
an easily configurable Redis database with minimal setup for lightning-fast server-side caching
unique key generation for response data to avoid developer having to tag for cache
partial and exact matching for query fields in the developer's GraphQL API
rebuilding GraphQL queries based on cache to fetch only missing data, lessening data loads
ability to handle and seperately cache multiple queries inside one GraphQL request
an easy toggle to specify caching in Redis, sessionStorage, or both
handling all fetching and subsequent response from GraphQL endpoint with only one line of code in client and four lines in server.

To implement the full caching ability of TrunQ, also download the server-side caching package at `trunq-server`.

Note: TrunQ will not work when implemented directly on a GraphQL server, and only works when querying an external GraphQL endpoint.

## Basic Implementation

### Setup

Download trunQ from npm in your terminal with `npm i trunq`.

### Client-side Implementation

We're going to show how to implement TrunQ by rewriting an existing graphQL fetch.

Sample Code: 

``` 
const myGraphQLQuery = query { 
  artist (id: 'mark-rothko') { 
    name artworks (paintingId: 'chapel' size: 1) {    
      name imgUrl  
    } 
  }
} 

function fetchThis (myGraphQLQuery) {
  let results
  fetch('/graphQL', {
    method: "POST"
    body: JSON.stringify(myGraphQLQuery)
  })
  .then(res => res.json)
  .then(parsedRes => results = parsedRes)
  ...(rest of code)
}

fetchThis(myGraphQLQuery)
```

Require in TrunQ to your application with `import trunq from 'trunq'`

On the line you are sending your request, replace the entire fetch with:

`const results = await trunq.trunQify(graphQLQuery, ['allIDs'], '/graphQL', 'client')`

Breakdown of the parameters developers have to supply:
- argument(0) (string) is your graphQL query, completely unchanged from before.
- argument(1) (array) is all your unique variable keys (eg in `artist (id: 'van-gogh')` the array would be `['id']`.
- argument(2) (string) your graphQL server endpoint or 3rd party API URI, exactly as it would be in your fetch.
- argument(3) (string) caching location. Valid options are: 'client', 'server', or 'both'.

The function calling trunQify must be converted to an async function that awaits the resolution of promises between the cache and the fetch.

That's it for the client side! 

Our sample code will be rewritten as:

``` 
const myGraphQLQuery = query { 
  artist (id: 'mark-rothko') { 
    name artworks (paintingId: 'chapel' size: 1) {    
      name imgUrl  
    } 
  }
} 

async function fetchThis (myGraphQLQuery) {
  let results = await trunq.trunQify(myGraphQLQUery, ['id', 'paintingId'], '/graphQL', 'client')
  ...(rest of code)
}

fetchThis(myGraphQLQuery)
```
Now our results will be cached in sessionStorage!

Note: if developer is querying a 3rd party API and caching only client-side, s/he does not need to configure the server side. Instead, supply the full URI of the API at the appropriate argument.

#### For Server-side caching implementation, please see our trunq-server NPM package and follow the instructions on that README
