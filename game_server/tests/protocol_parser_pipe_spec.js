var ProtocolParser = require('../src/server/pipes/protocol_parser_pipe');
var InputStream = require('./test_stream_helpers/input_test_stream');
var OutputStream = require('./test_stream_helpers/output_test_stream');

describe('Protocol parser pipe specs:', function() {
    var protocolParser = null;
    var chunks = [];
    var inputStream = null;
    var outputStream = null;

    beforeEach(function() {
        protocolParser = new ProtocolParser({
            _transmitter: {
                send: function(obj) {

                }
            }
        });
    });

    it('Message too large', function(done) {
        chunks = [new Buffer(1<<13)];
        chunks[0].fill(0);
        inputStream = new InputStream(chunks);

        inputStream.pipe(protocolParser).on('exception', function(err) {
            expect(err).toMatch(/Invalid message size*/);
            done();
        });
    });

    it('Invalid protocol (not a json)', function(done) {
        chunks = [new Buffer('{not_a_json}\0')];
        inputStream = new InputStream(chunks);

        inputStream.pipe(protocolParser).on('exception', function(err) {
            expect(err).toMatch(/Invalid message format*/);
            done();
        });
    });

    it('Highly fragmented message', function(done) {
        var msg = '{"some_key": 1234567890, "another_key": "some_value"}\0';

        expect(() => JSON.parse(msg.slice(0, msg.length-1))).not.toThrow();

        chunks = msg.split('');
        chunks.map(function(chunk) {
            return new Buffer(chunk.toString());
        });

        inputStream = new InputStream(chunks);
        outputStream = new OutputStream({objectMode: true});

        inputStream.pipe(protocolParser).pipe(outputStream).on('data',
            function(chunk, received) {
                expect(JSON.stringify(chunk.message)).toBe(
                    JSON.stringify(JSON.parse(msg.slice(0, msg.length-1)))
                );
                done();
            }
        );
    });

    it('Exact size message', function(done) {
        chunks = [new Buffer(1<<12)];
        chunks[0].fill(' ');
        chunks[0].write('{', 0);
        chunks[0].write('}', chunks[0].length-2);
        chunks[0].write('\0', chunks[0].length-1);
        inputStream = new InputStream(chunks);
        outputStream = new OutputStream({objectMode: true});

        inputStream.pipe(protocolParser).pipe(outputStream).on('data',
            function(chunk, received) {
                expect(JSON.stringify(chunk.message)).toBe(
                    JSON.stringify(JSON.parse(chunks[0].toString().slice(0, chunks[0].length-1)))
                );
                done();
            }
        );
    });
});