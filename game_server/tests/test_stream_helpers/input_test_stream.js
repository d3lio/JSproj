var stream = require('stream');
var util = require('util');

function InputStream(chunks, options) {
    if (!(this instanceof InputStream)) {
        return new InputStream(options);
    }
    stream.Readable.call(this, options);

    this._chunks = chunks; // Array
    this._idx = 0;
}
util.inherits(InputStream, stream.Readable);

InputStream.prototype._read = function(size) {
    while (true) {
        if (this._idx === this._chunks.length) {
            this.push(null);
            break;
        }

        if (!this.push(this._chunks[this._idx++])) {
            break;
        }
    }
};

module.exports = InputStream;
