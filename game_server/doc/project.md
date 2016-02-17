## Project specs

 * Project entry point is src/app.js

 * For testing I chose `jasmine-node` since it's behaviour driven
 and that's exacly what this kind of project needs.
 
 * After some research winston logger suits my needs perfectly instead of
 my old buggy logger implementation.

 * Using the 'exception' event to specify errors from the streams since 'error' unpipes the streams.

 * The c++ id pool worked fine on the tests but segfaults when concurrency hits.
