var Utils = require('../utils/utils');
var IdPool = require('../utils/id_pool/id_pool');
var Lobby = require('./lobby');
var stream = require('stream');

// FIXME: const on node 5.x
var Constants = {
    DEFAULT_NUM_CONS: 8,
    DEFAULT_MAX_NUM_CONS: 16,
};

// TODO: documentation

/**
 * @brief: A lobbies manager stream middleware.
 * @input-type: Object.
 * @output-type: Object.
 */
function LobbiesManager() {
    Utils.checkInstance(this, LobbiesManager);
    stream.Transform.call(this, {objectMode: true});

    // Since lobbies will be updated dynamically it's better
    // to use a map than a plain object
    this._idPool = new IdPool();
    this._lobbies = new Map();
}
Utils.inherit(LobbiesManager, stream.Transform);

/**
 * @brief: Implements the _transform method.
 */
LobbiesManager.prototype._transform = function(req, encoding, next) {
    var action = this._actions[req.message.command];

    if (!action) {
        this.push(req);
        next(null);
        return;
    }

    if (!(req.message.params instanceof Array)) {
        Utils.writeJNTM(req.remote.socket, {
            error: 'Invalid params format'
        })
        .catch(req.logger.error);
        next('Invalid params format');
        return;
    }

    var ret = null;

    try {
        ret = Utils.call(action, this, req.message.params, req.remote);
    } catch(e) {
        Utils.writeJNTM(req.remote.socket, {
            error: e.message
        })
        .catch(req.logger.error);
        next(e.message);
        return;
    }

    if (typeof ret === 'undefined') {
        // Indicate success
        ret = true;
    }

    Utils.answerJNTM(req.remote.socket, req.message, {
        data: {
            outcome: ret
        }
    })
    .catch(req.logger.error);
    next(null);
};

/**
 * @brief: Create a lobby and join it.
 */
LobbiesManager.prototype.createLobby = function(name, maxCons, remote) {
    Utils.checkType(name, 'string');

    maxCons = maxCons || parseInt(maxCons) || Constants.DEFAULT_NUM_CONS;
    if (maxCons > Constants.DEFAULT_MAX_NUM_CONS) {
        maxCons = Constants.DEFAULT_MAX_NUM_CONS;
    }

    // If empty string set it to a default
    if (name === '') {
        name = remote.username + "'s lobby";
    }

    var lobby = new Lobby(name, maxCons);
    var id = this._idPool.reserve();
    this._lobbies.set(id, lobby);

    lobby.join(remote);

    return id;
};

/**
 * @brief: 
 */
LobbiesManager.prototype.deleteLobby = function(id) {
    id = id || parseInt(id) || IdPool.NULL_ID;
    
    var lobby = this._lobbies.get(id);

    if (!lobby) {
        throw new Error('Unexisting lobby');
    }

    // for (var iter of lobby.getConsIter()) {
    //     // TODO: err handling
    //     Utils.writeJNTM(iter[1].socket, {
    //         data: {
    //             command: "delete_lobby",
    //             outcome: id
    //         }
    //     });
    // }

    this._lobbies.delete(id);
    this._idPool.release(id);

    return id;
};

/**
 * @brief: 
 */
LobbiesManager.prototype.listLobbies = function() {
    var entries = [];

    for (var iter of this._lobbies.entries()) {
        entries.push({
            id: iter[0],
            name: iter[1]._name,
            cons: iter[1]._cons.size,
            maxCons: iter[1]._maxCons,
            teams: iter[1]._teams,
        });
    }

    return entries;
};

/**
 * @brief: 
 */
LobbiesManager.prototype.joinLobby = function(id, remote) {
    var lobby = this._lobbies.get(id);
    
    if (!lobby) {
        throw new Error('Unexisting lobby');
    }

    lobby.join(remote);

    return id;
};

/**
 * @brief: 
 */
LobbiesManager.prototype.leaveLobby = function(id, remote) {
    var lobby = this._lobbies.get(id);
    
    if (!lobby) {
        throw new Error('Unexisting lobby');
    }

    lobby.leave(remote.id);

    if (lobby.isEmpty()) {
        this.deleteLobby(id);
    }

    return id;
};

/**
 * @brief: 
 */
LobbiesManager.prototype.listPlayers = function(id) {
    var lobby = this._lobbies.get(id);
    
    if (!lobby) {
        throw new Error('Unexisting lobby');
    }

    var players = [];

    for (var iter of lobby.getConsIter()) {
        players.push({
            id: iter[0],
            username: iter[1].username,
            team: iter[1].team,
        });
    }

    return players;
};

/**
 * @brief: 
 */
LobbiesManager.prototype.changeTeams = function(id, team, remote) {
    var lobby = this._lobbies.get(id);
    
    if (!lobby) {
        throw new Error('Unexisting lobby');
    }

    lobby.changeTeams(remote.id, team);

    return team;
};

LobbiesManager.prototype._actions = Utils.prototypeMap(LobbiesManager);
module.exports = LobbiesManager;
