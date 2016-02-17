var Utils = require('../../utils/utils');
var Logger = require('../components/logger');
var stream = require('stream');

// FIXME: const on node 5.x
var Constants = {
    DEFAULT_MESSAGE_SIZE: 1 << 12, // 4 KiB
};

// FIXME: const on node 5.x
var PrivConstants = {
    ERROR_SIZE:    'Invalid message size',
    ERROR_FORMAT:  'Invalid message format',
};

/**
 * @brief: A protocol parser for tcp messages.
 * @param(pipeline): The related pipeline object.
 * @param(maxMsgSize): A max message size or a default one if none supplied.
 * @input-type: Buffer/String.
 * @output-type: Object.
 * @notes: Concatenates the chunked messages. If the message is too large
 * or the message does not follow the protocol (json), the parser
 * will emit an error.
 */
function ProtocolParser(pipeline, maxMsgSize) {
    Utils.checkInstance(this, ProtocolParser);
    stream.Transform.call(this, {readableObjectMode: true});

    this.maxMsgSize = typeof maxMsgSize === 'number' ?
        maxMsgSize:
        Constants.DEFAULT_MESSAGE_SIZE;

    this._transmitter = pipeline._transmitter;

    this._buffer = [];
    this._size = 0;
}
Utils.inherit(ProtocolParser, stream.Transform);

ProtocolParser.Constants = Constants;

/**
 * @brief: Reset the buffer and it's size.
 */
ProtocolParser.prototype._reset = function() {
    this._buffer = [];
    this._size = 0;
};

/**
 * @brief: Implements the _transform method.
 */
ProtocolParser.prototype._transform = function(chunk, encoding, next) {
    this._size += chunk.length;

    if (this._size > this.maxMsgSize) {
        this._transmitter.send({
            error: PrivConstants.ERROR_SIZE
        });

        this.emit('exception', PrivConstants.ERROR_SIZE + ' ' + this._size);
        this._reset();
        next();
        return;
    }

    this._buffer.push(chunk);

    if (chunk[chunk.length - 1] === 0) {
        var msgBuffer = Buffer.concat(this._buffer);
        // Better performance than slicing
        msgBuffer.write(' ', msgBuffer.length-1);
        var msgString = msgBuffer.toString();
        var msgObj = null;

        this._reset();

        var failFlag = false;

        try {
            msgObj = JSON.parse(msgString);
        } catch (e) {
            failFlag = true;
        }

        if (failFlag || typeof msgObj !== 'object') {
            this._transmitter.send({
                error: PrivConstants.ERROR_FORMAT
            });

            this.emit('exception', PrivConstants.ERROR_FORMAT + ' ' + msgString);
            next();
            return;
        }

        this.emit('message', msgObj);
        this.push({ message: msgObj });
    }

    next();
};

module.exports = ProtocolParser;
