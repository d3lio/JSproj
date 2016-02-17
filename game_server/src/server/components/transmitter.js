var Utils = require('../../utils/utils');
var Logger = require('./logger');
var stream = require('stream');

/**
 * @brief: Sends messages on a socket.
 * @param(socket): The related socket.
 */
function Transmitter(socket) {
    Utils.checkInstance(this, Transmitter);
    stream.Writable.call(this);

    this._socket = socket;
}
Utils.inherit(Transmitter, stream.Writable);

/**
 * @brief: Implements the _write method.
 */
Transmitter.prototype._write = function(chunk, encoding, next) {
    function errLogger(err) {
        if (err) {
            Logger.error(err);
            next(err);
        }
    }

    try {
        this._socket.write(chunk, errLogger);
    } catch(e) {
        Logger.error(e.message);
    }
};

/**
 * @brief: Send data on a socket with a done callback.
 * @param(dataObj): The transmission object.
 * @param(cb): Done callback (err) => {}.
 */
Transmitter.prototype.send = function(dataObj, cb) {
    if (!(dataObj instanceof String) && !(dataObj instanceof Buffer)) {
        dataObj = JSON.stringify(dataObj) + '\0';
    } else if (dataObj[dataObj.length-1] != 0) {
        dataObj += '\0';
    }

    function errLogger(err) {
        if (err) {
            Logger.error(err);
            if (cb) {
                cb(err);
            }
        }
    }

    try {
        this._socket.write(dataObj, errLogger);
    } catch(e) {
        Logger.error(e.message);
    }
};

/**
 * @brief: Same as send but uses a promise instead of a callabck.
 * @see: Reponse.send
 */
Transmitter.prototype.psend = function(dataObj) {
    return new Promise(function(resolve, reject) {
        this.send(dataObj, function(err) {
            err ? reject(err) : resolve();
        });
    });
};

module.exports = Transmitter;
