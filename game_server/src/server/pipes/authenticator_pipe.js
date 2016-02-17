var Utils = require('../../utils/utils');
var IdPool = require('../../utils/id_pool/id_pool');
var Logger = require('../components/logger');
var stream = require('stream');

// Auth id pool
// var idPool = new IdPool();
var idPool = [];
var curId = 1;

// FIXME: const on node 5.x
var PrivConstants = {
    PLEASE_IDENTIFY: 'Please identify yourself first',
    ERROR_IDENTIFY: 'Client not identified',
    ALREADY_AUTHENTICATED: 'You are already authenticated',
    ERROR_AUTHENTICATED: 'Client is already authenticated'
};

// FIXME: const on node 5.x
var CommandConstants = {
    AUTHENTICATE: 'authenticate',
    DISCONNECT:   'disconnect'
};

/**
 * @brief: An authenticator stream middleware.
 * @param(pipeline): The related pipeline object.
 * @input-type: Object.
 * @output-type: Object.
 */
// TODO: database authentication
function Authenticator(pipeline) {
    Utils.checkInstance(this, Authenticator);
    stream.Transform.call(this, {objectMode: true});

    this._id = 0;
    this._username = "";

    this._socket = pipeline._socket;
    this._transmitter = pipeline._transmitter;

    function disconnectHandler(err) {
        if (this._id) {
            this.write({command: CommandConstants.DISCONNECT});
        }
    }

    // TCP
    this._socket.on('end', disconnectHandler);
    this._socket.on('error', disconnectHandler);
    // WebSocket
    this._socket.on('close', disconnectHandler);
}
Utils.inherit(Authenticator, stream.Transform);

/**
 * @brief: Implements the _transform method.
 */
Authenticator.prototype._transform = function(req, encoding, next) {
    if (!this._id && req.message.command !== CommandConstants.AUTHENTICATE) {
        this._transmitter.send({
            error: PrivConstants.PLEASE_IDENTIFY
        });

        this.emit('exception', PrivConstants.ERROR_IDENTIFY);
        next();
        return;
    } else if (this._id && req.message.command === CommandConstants.AUTHENTICATE) {
        this._transmitter.send({
            error: PrivConstants.ALREADY_AUTHENTICATED
        });

        this.emit('exception', PrivConstants.ERROR_AUTHENTICATED);
        next();
        return;
    }

    var user_id = this._id;

    switch (req.message.command) {
        case CommandConstants.AUTHENTICATE:
            if (!req.message.params.username) {
                this._transmitter.send({
                    error: PrivConstants.PLEASE_IDENTIFY
                });

                this.emit('exception', PrivConstants.ERROR_IDENTIFY);
                next();
                return;
            } else {
                // FIXME: When db is introduced this will change.

                //this._id = idPool.reserve();
                idPool.push(curId);
                this._id = curId++;

                user_id = this._id;
                // FIXME: Unique usernames will be easily managed with a db.
                // For now anyone can be anyone. (Like agar.io)
                this._username = req.message.params.username;

                this.emit(CommandConstants.AUTHENTICATE,
                    this._socket.remoteAddress, this._username);

                this._transmitter.send({
                    correlation: CommandConstants.AUTHENTICATE,
                    data: {
                        return: 'success'
                    }
                });
            }
            break;

        case CommandConstants.DISCONNECT:
            if (this._id) {

                // Do not release ids beyond the max id.
                // Without a db any player can take some other player's id
                // and things can get messy with syncronizing all the client.

                user_id = this._id;

                try {
                    //idPool.release(this._id);
                    var idx = idPool.indexOf(this._id);
                    if (idx > -1) {
                        idPool.splice(idx, 1);
                    }
                } catch(err) {
                    // FIXME: Will break the server
                    // Disconnect the user if so
                    next(err.message);
                    return;
                }

                // Don't null the id / username yet since more pipes have to use them.
                // FIXME: Problems with duplicate ids will be fixed when a db is added.
                // This can only occure when all 1<<20 ids have been given out.
            }
            break;
    }

    req.remote = {
        id: this._id,
        username: this._username,
        transmitter: this._transmitter
    };

    if (this._id && req.message.command === CommandConstants.DISCONNECT) {
        this._id = 0;
    }

    this.push(req);
    next();
};

module.exports = Authenticator;
