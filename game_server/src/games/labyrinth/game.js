var util = require('util');
var stream = require('stream');

// FIXME: const on node 5.x
var Constants = {
    BOARD_SIZE: 25,
    TERRAIN_TYPES: {
        NONE: 0,
        WALL: 1,
    }
};

// FIXME: const on node 5.x
var CommandConstants = {
    AUTHENTICATE: 'authenticate',
    DISCONNECT: 'disconnect',
    REPORT: 'report'
};

function Game() {
    if (!(this instanceof Game)) {
        return new Game();
    }
    stream.Writable.call(this, {objectMode: true});

    this.map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    this._genMaze();

    this.players = [];
    this.tagCounter = process.hrtime();
}
util.inherits(Game, stream.Writable);

/**
 * @brief: Implements the stream's write method
 */
Game.prototype._write = function(req, encoding, next) {
    switch (req.message.command) {

    case CommandConstants.AUTHENTICATE:
        req.remote.transmitter.send({
            correlation: 'init',
            data: {
                terrain: this.map,
                players: this.players
            }
        });

        req.message.params.props.isIt = this.players.length === 0;

        this.players.push({
            id: req.remote.id,
            username: req.remote.username,
            props: req.message.params.props
        });

        break;

    case CommandConstants.DISCONNECT:
        var idx = -1;
        var isIt = false;
        this.players.forEach(function(player, i) {
            if (req.remote.id == player.id) {
                idx = i;
                isIt = player.props.isIt;
            }
        });

        if (idx > -1) {
            this.players.splice(idx, 1);
            if (isIt && this.players.length > 0) {
                this.players[Math.floor(Math.random()*this.players.length)].props.isIt = true;
            }
        }

        break;

    case CommandConstants.REPORT:
        var players = [];

        this.players.forEach(function(player) {
            if (req.remote.id !== player.id) {
                players.push(player);
            } else {
                var isIt = player.props.isIt;
                player.props = req.message.params.props;
                player.props.isIt = isIt;
            }
        });

        var tagged = false;

        for (var i in this.players) {
            var player = this.players[i];
            if (player.props.isIt) {
                for (var j in this.players) {
                    var otherPlayer = this.players[j];
                    if (player.id !== otherPlayer.id) {
                        if (this._tagIt(player, otherPlayer)) {
                            tagged = true;
                            break;
                        }
                    }
                }
                if (tagged) {
                    break;
                }
            }
        }

        req.remote.transmitter.send({
            correlation: 'update',
            data: {
                players: players
            }
        });

        break;

    }

    next();
}

Game.prototype._tagIt = function(player, otherPlayer) {
    var x2 = Math.pow(player.props.position.x - otherPlayer.props.position.x, 2);
    var z2 = Math.pow(player.props.position.z - otherPlayer.props.position.z, 2);
    if (Math.sqrt(x2+z2) < 6 && process.hrtime(this.tagCounter)[0] >= 3.0) {
        player.props.isIt = false;
        otherPlayer.props.isIt = true;
        this.tagCounter = process.hrtime();
        return true;
    }
    return false;
};

Game.prototype._genMaze = function() {
    var a = [];

    var WIDTH = 15;
    var HEIGHT = 15;

    init(a);
    gen(a, 6, 6);
    fix(a);
    this.map = a;

    function init(maze) {
        for (var i = 0; i < HEIGHT; i++) {
            maze.push([]);
            for (var j = 0; j < WIDTH; j++) {
                maze[i][j] = 1;
            }
        }
    }

    function gen(maze, i, j) {
        maze[i][j] = 0;

        var used = [0, 0, 0, 0];

        while (used[0] + used[1] + used[2] + used[3] !== 4) {
            do {
                var r = Math.floor(Math.random()*4);
            } while (used[r]);

            switch (r) {
                case 0:
                    if (i-2 > -1 && j > -1 && j < WIDTH && maze[i-2][j] === 1 && maze[i-1][j+1] === 1 && maze[i-1][j-1] === 1) {
                        gen(maze, i-1, j);
                    }
                    break;
                case 1:
                    if (i+2 < HEIGHT && j > -1 && j < WIDTH && maze[i+2][j] === 1 && maze[i+1][j+1] === 1 && maze[i+1][j-1] === 1) {
                        gen(maze, i+1, j);
                    }
                    break;
                case 2:
                    if (j-2 > -1 && i > -1 && i < HEIGHT && maze[i][j-2] === 1 && maze[i+1][j-1] === 1 && maze[i-1][j-1] === 1) {
                        gen(maze, i, j-1);
                    }
                    break;
                case 3:
                    if (j+2 < WIDTH && i > -1 && i < HEIGHT && maze[i][j+2] === 1 && maze[i+1][j+1] === 1 && maze[i+1][j-1] === 1) {
                        gen(maze, i, j+1);
                    }
                    break;
            }

            used[r] = 1;
        }
    }

    function fix(maze) {
        for (var i = 0; i < 5; i++) {
            maze
                [Math.floor(Math.random()*(HEIGHT-2)) + 1]
                [Math.floor(Math.random()*(WIDTH-2)) + 1] = 0;
        }
    }
};

module.exports = Game;