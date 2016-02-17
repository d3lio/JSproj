var Game = require('./labyrinth/game.js');
var gameStream = new Game();

// FIXME: const on node 5.x
var Constants = {
    MAX_PLAYERS: 100
};

gameStream.setMaxListeners(Constants.MAX_PLAYERS);

module.exports = gameStream;
