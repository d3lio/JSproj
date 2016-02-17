var Utils = require('../utils/utils');
var Logger = require('./components/logger');
var Pipeline = require('./components/pipeline');
var stream = require('stream');
var wsServer = require('ws').Server;
var net = require('net');

// FIXME: const on node 5.x
var Constants = {
    DEFAULT_HTTP_PORT: 80,
    DEFAULT_HTTPS_PORT: 443,
    DEFAULT_TCP_PORT: 27015,
    DEFAULT_WEBSOCK_PORT: 45059,
};

/**
 * @brief: The server :)
 * @notes: As of now this object should only handle tcp
 * but for future versions it should act as a collector for
 * raw tcp sockets used by cpp clients, websockets used by browser clients
 * and probably http for a website where you could register when a db is up.
 */
function Realm() {
    Utils.checkInstance(this, Realm);

    this._tcpServer = net.createServer(this._tcpOnConnect.bind(this));
    this._wsServer = null;
    this._wssConns = 0;
}

Realm.Constants = Constants;

/**
 * @brief: Starts the realm on a given port.
 * @param(port): The port on which the realm sould listen or a default one if none supplied.
 */
Realm.prototype.listenOn = function(port) {
    if (port === Constants.DEFAULT_WEBSOCK_PORT) {
        port = 0;
    }

    this._tcpServer.listen(port || Constants.DEFAULT_TCP_PORT, function() {
        // This in here points to the tcp server itself
        Logger.info('tcpServer listening on port %d', this.address().port);
    });

    this._wsServer = new wsServer({ port: Constants.DEFAULT_WEBSOCK_PORT });
    this._wsServer.on('connection', this._wsOnConnect.bind(this));
    Logger.info('wsServer listening on port %d', Constants.DEFAULT_WEBSOCK_PORT);
};

/**
 * @brief: Closes the realm.
 */
Realm.prototype.close = function() {
    Logger.info('Server closing..');

    this._tcpServer.close(function(err) {
        Logger.error(err);
    });
};

/**
 * @brief: Get the realm's connections count.
 * @param(fn): A callback function (err, count).
 */
Realm.prototype.getConnections = function() {
    var self = this;

    // Will get more complicated with more servers.
    return new Promise(function(resolve, reject) {
        self._tcpServer.getConnections(function(err, cnt) {
            err ? reject(err) : resolve(cnt + self._wssConns);
        });
    });
};

/**
 * @brief: The tpc server' on-connection handler.
 * @param(socket): The tcp socket on which the client connected.
 */
Realm.prototype._tcpOnConnect = function(socket) {
    var self = this;
    var pipeline = null;

    Logger.info('Client connected from: %s', socket.remoteAddress);
    this.getConnections()
        .then((cnt) => { Logger.info('Current cons: %d', cnt); })
        .catch((err) => { Logger.error(err.message); });

    function disconnectHandler(err) {
        Logger.info('Connection with address %s closed', socket.remoteAddress);
        if (err) {
            Logger.error(err);
        }

        self.getConnections()
            .then((cnt) => { Logger.info('Current cons: %d', cnt); })
            .catch((err) => { Logger.error(err.message); });

        pipeline.destroy();
    }

    // End is triggered when a FIN package is received. For a TCP socket that happens
    // when the user explicitly specifies a connection shutdown
    socket.on('end', disconnectHandler);
    socket.on('error', disconnectHandler);

    pipeline = new Pipeline(socket);
};


/**
 * @brief: The web socket server' on-connection handler.
 * @param(wsSocket): The web socket on which the client connected.
 */
Realm.prototype._wsOnConnect = function(wsSocket) {
    var self = this;
    var pipeline = null;

    this._wssConns++;

    Logger.info('WebSocket client connected');
    this.getConnections()
        .then((cnt) => { Logger.info('Current cons: %d', cnt); })
        .catch((err) => { Logger.error(err.message); });

    var socket = new stream.Readable({
        read: function(size) {
            // do nothing
        }
    });

    wsSocket.on('message', function(message) {
        socket.push(message);
    });

    wsSocket.on('close', function() {
        Logger.info('WebSocket client disconnected');

        self.getConnections()
            .then((cnt) => { Logger.info('Current cons: %d', cnt); })
            .catch((err) => { Logger.error(err.message); });

        socket.write = null;
        pipeline.destroy();
        self._wssConns--;
    });

    socket.write = function(msg, cb) {
        wsSocket.send(msg, cb);
    }

    pipeline = new Pipeline(socket);
};

module.exports = Realm;
