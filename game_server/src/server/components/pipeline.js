var Utils = require('../../utils/utils');
var Logger = require('./logger');
var Transmitter = require('./transmitter');
var gameObj = require('../../games/config');

// Pipes
//var Decryptor           = require('../pipes/decryptor_pipe');
var ProtocolParser      = require('../pipes/protocol_parser_pipe');
//var Demultiplexer       = require('../pipes/demultiplexer_pipe');
var Authenticator       = require('../pipes/authenticator_pipe');

/**
 * @brief: A tcp socket message processing pipeline.
 * @param(socket): The related socket.
 */
function Pipeline(socket) {
    Utils.checkInstance(this, Pipeline);

    this._socket = socket;
    this._transmitter = new Transmitter(socket);

    this._pipeline = [
        new ProtocolParser(this),
        new Authenticator(this)
    ];

    this._pipeline[0].on('message', function(msg) {
        if (msg.command !== 'report') {
            Logger.info('Message from '+ socket.remoteAddress + ' : ' + JSON.stringify(msg));
        }
    });

    this._pipeline[1].on('authenticate', function(ip, username) {
        Logger.info('Authenticated ' + ip + ' as ' + username);
    });

    this._firstPipe = this._pipeline[0];
    this._lastPipe = this._pipeline[this._pipeline.length-1];

    if (!this._pipeline.length) {
        throw new RangeError('Invalid pipes count');
    }

    // Initialize error handlers
    // Not using 'error' event since it decouples the streams
    this._pipeline.forEach(function(pipe) {
        pipe.on('exception', function(err) {
            Logger.error(err);
        });
    });

    // Connect the pipes
    for (var i = 0; i < this._pipeline.length - 1; i++) {
        this._pipeline[i].pipe(this._pipeline[i+1]);
    }

    socket.pipe(this._firstPipe);
    this._lastPipe.pipe(gameObj);
}

/**
 * @brief: A destructor function.
 */
Pipeline.prototype.destroy = function() {
    this._socket.push('{"command":"disconnect"}\0');
    this._socket.unpipe(this._firstPipe);
    this._lastPipe.unpipe(gameObj);

    this._pipeline = null;
    this._firstPipe = null;
    this._lastPipe = null;
    this._socket = null;
    this._transmitter = null;
};

module.exports = Pipeline;
