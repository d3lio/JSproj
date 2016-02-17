var Entity = require('./entity');
var Utils = require('../utils/utils');

/**
 * @brief: Player entity.
 * @param(socket): TCP socket which the player connected to.
 * @param(__rest__): Passed to the Entity constructor.
 */
function Player(name, socket) {
    Utils.checkInstance(this, Player);
    Utils.checkLeastLen(arguments, 2);

    var __rest__ = Utils.slice(arguments, 2);
    Utils.call(Entity, this, 'player', __rest__);

    this.name = name;
    this.socket = socket;
}
Utils.inherit(Player, Entity);

/**
 * @brief: Send data to the Player's socket.
 * @param(data): Data to be send to the socket.
 * @return: A promise.
 */
Player.prototype.sendData = function(data) {
    return writeToSocket(this.socket, data);
};

/**
 * @brief: Writes data to a socket.
 * @param(socket): TCP socket to write to.
 * @param(data): Data to write to the socket.
 * @return: A promise.
 */
function writeToSocket(socket, data) {
    return new Promise(function(resolve, reject) {
        socket.write(data, function(err) {
            err ? reject(err) : resolve();
        });
    });
}

module.exports = Player;
