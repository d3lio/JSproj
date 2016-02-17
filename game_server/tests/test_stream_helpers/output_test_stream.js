var stream = require('stream');
var util = require('util');

function OutputStream(options) {
    if (!(this instanceof OutputStream)) {
        return new OutputStream(options);
    }
    stream.Writable.call(this, options);

    this.msg = '';
}
util.inherits(OutputStream, stream.Writable);

OutputStream.prototype._write = function(chunk, encoding, next) {
    this.msg += typeof chunk === 'object'? JSON.stringify(chunk): chunk.toString();
    this.emit('data', chunk, this.msg);

    next(null);
};

module.exports = OutputStream;
