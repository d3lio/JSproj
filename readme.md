 * What is the project about?
    - It's supposed to be a template game server and a demo game
    (client + server side)
 * Why did I chose Node.js?
   1. Event driven language.
   2. Little to none boiler plate code (TCP server).
   3. Can be integrated with C++ libraries.
   4. It’s a JavaScript course :)
 * What is the server structure?
    - TCP and a WebSockets servers
    - Template stream pipelines for each socket where the last stream is the game itself.
    - Transmitter to respond at any point throughout the pipeline.
    - Logger
