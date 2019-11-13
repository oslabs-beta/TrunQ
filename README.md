# trunQ
trunQ is an open-source NPM package developed by OS-labs providing an easy and intuitive implementation for caching graphQL responses on the client and/or server side storage.

Developed by Ben Ray, Brian Haller, Gordon Campbell, and Michael Evans.

## Features

trunQ has been developed to give the developer the most flexible out-of-the-box caching solution.

As of now, trunQ offers:
- storage inside sessionStorage for easy client-side caching
- an easily configurable Redis database with minimal setup for lightning-fast server-side caching
- unique key generation for response data to avoid developer having to tag for cache
- partial and exact matching for query fields in the developer's graphQL API
- rebuilding graphQL queries based on cache to fetch only missing data, lessening data loads
- ability to handle and seperately cache multiple queries inside one graphQL request
- an easy toggle to specify caching in Redis, sessionStorage, or both 
- handling all fetching and subsequent response from graphQL endpoint with only one line of code in client
  and four lines in server

## Basic Implementation

Download trunQ from npm in your terminal with `npm i trunq`.


REDIS NOTES (to clean up later) 
link i found that helped me with wget issue 
https://github.com/robbyrussell/oh-my-zsh/issues/7085 
link i used to solve the invalid active developer path issue 
https://apple.stackexchange.com/questions/254380/why-am-i-getting-an-invalid-active-developer-path-when-attempting-to-use-git-a
