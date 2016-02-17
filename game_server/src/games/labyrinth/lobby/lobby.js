var Utils = require('../utils/utils');

/**
 * @brief: A lobby holding pre-game-time player connections.
 * @param(name): The lobby's name.
 * @param(maxCons): The max number of players the lobby can hold.
 * @param(teams): Specifies how many teams the lobby has for a team based game.
 * Default value is 1.
 * @notes: Te teams doesn't have max players restriction.
 */
function Lobby(name, maxCons, teams) {
    Utils.checkInstance(this, Lobby);

    this._name = name || '';
    this._maxCons = maxCons | 0;
    this._teams = (teams | 0) || 1;
    this._cons = new Map();
}

/**
 * @brief: Adds a player to the lobby.
 * @param(remote): The player's connection info.
 */
Lobby.prototype.join = function(remote) {
    if (this._cons.size === this._maxCons) {
        throw new Error('The lobby is full');
    }

    if (this._cons.has(remote.id)) {
        throw new Error('Player is already in the lobby');
    }

    this._cons.set(remote.id, {
        username: remote.username,
        socket: remote.socket,
        team: 0,
    });
};

/**
 * @brief: Remove a player from the lobby.
 * @param(id): The player's id.
 */
Lobby.prototype.leave = function(id) {
    if (!this._cons.delete(id)) {
        throw new Error('Player is not in the lobby');
    }
};

/**
 * @brief: Get a list of player connections.
 * @return: An iterator to [id, {team, username, socket}] pairs.
 */
Lobby.prototype.getConsIter = function() {
    return this._cons.entries();
};

/**
 * @brief: Get the connections count.
 * @return: The connections count. 
 */
Lobby.prototype.getConsCount = function() {
    return this._cons.size;
};

/**
 * @brief: Checks if the lobby is empty.
 * @return: Boolean wether the lobby is empty.
 */
Lobby.prototype.isEmpty = function() {
    return !this._cons.size;
};

/**
 * @brief: Change a player's team.
 * @param(newTeam): The player's new team.
 */
Lobby.prototype.changeTeams = function(id, newTeam) {
    // TODO: check team's size

    var playerInfo = this._cons.get(id);

    if (!playerInfo) {
        throw new Error('Player is not in the lobby');
    }

    if (newTeam < 0 || newTeam >= this._teams) {
        throw new Error('Team does not exist');
    }

    playerInfo.team = newTeam;
};

module.exports = Lobby;
