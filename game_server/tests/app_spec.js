var Realm = require('../src/server/realm');
var net = require('net');

describe('App specs:', function() {
    var client;
    var server;

    beforeEach(function(done) {
        server = new Realm();
        server.listenOn(Realm.Constants.DEFAULT_TCP_PORT);

        client = net.connect({
            host: 'localhost',
            port: Realm.Constants.DEFAULT_TCP_PORT
        }, function() {
            done();
        });

        client.setEncoding('utf8');
    });

    afterEach(function() {
        try {
            server.close();
            client.end();
        } catch(e) {

        }
    });

    it('Authenticate', function(done) {
        var now = Date.now();
        var outgoingMsg = {
            "command": "authenticate",
            "params": {
                "username": "delyan"
            },
            "timestamp": now
        };
        var outgoingJntm = JSON.stringify(outgoingMsg)+'\0';

        client.on('data', function(msg) {
            var i = msg.indexOf('\0');
            msg = msg.slice(0, i);
            msg = JSON.parse(msg);
            expect(msg.data.return).toBe('success');
            expect(msg.correlation).toBe(outgoingMsg.command);

            console.log(msg);
            done();
        });

        client.on('error', function(err) {
            console.log(err);
            done();
        });

        client.on('end', function(data) {
            console.log(data);
            done();
        });

        client.write(outgoingJntm);
    });
});