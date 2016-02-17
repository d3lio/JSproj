function Client(scene, controls, lab, font, renderLoop) {
    if (!(this instanceof Client)) {
        return new Client(controls);
    }

    if (!(scene instanceof THREE.Scene)) {
        throw new TypeError("Expected first argument to be THREE.Scene");
    }
    if (!(controls instanceof Controls)) {
        throw new TypeError("Expected second argument to be Controls");
    }
    if (!(lab instanceof Labyrinth)) {
        throw new TypeError("Expected third argument to be Labyrinth");
    }
    if (!(font instanceof THREE.Font)) {
        throw new TypeError("Expected fourth argument to be THREE.Font");
    }

    this._scene = scene;
    this._controls = controls;
    this._lab = lab;
    this._font = font;
    this._renderLoop = renderLoop;

    this._players = [];
    this._username = "";

    this._ws = null;
    this._authenticated = false;
}
Client.CommandConstants = {
    INIT: 'init',
    UPDATE: 'update'
};

Client.prototype.authenticate = function(hostname, username) {
    if (typeof hostname !== 'string') {
        throw new TypeError("Hostname not string");
    }
    if (typeof username !== 'string') {
        throw new TypeError("Username not string");
    }

    if (!this._authenticated) {
        var errorbox = document.getElementById('error-box');

        try {
            this._ws = new WebSocket('ws://' + hostname + ':45059');
        } catch(e) {
            errorbox.innerHTML = "Please type the server's ip";
            return false;
        }
        errorbox.innerHTML = "";

        this._username = username;
        this._ws.onmessage = this._onMessage.bind(this);

        var authMsg = '{"command": "authenticate", "params":{"username": "'+username+'", "props":'+
            JSON.stringify(this._controls.getProps())
        +'}}\0';

        try {
            this._ws.send(authMsg);
        } catch(e) {
            this._ws.onopen = function(event) {
                this.send(authMsg);
            }
        }
        this._authenticated = true;
    }

    return true;
};

Client.prototype.getPlayers = function() {
    return this._players;
};

Client.prototype.report = function() {
    var reportMsg = '{"command": "report", "params":{"props": '+
        JSON.stringify(this._controls.getProps())
    +'}}\0';

    try {
        this._ws.send(reportMsg);
    } catch(e) {
        return e;
    }
};

Client.prototype._onMessage = function(event) {
    var self = this;

    var message = JSON.parse(event.data.slice(0, -1));
    switch (message.correlation) {
        case Client.CommandConstants.INIT:
            self._lab.map = message.data.terrain;
            self._lab.init(self._scene);
            this._renderLoop();
            self._players = message.data.players;

            self._players.forEach(function(player, i) {
                buildPlayerObj(player);

                self._scene.add(player.dogtagObj);
                self._scene.add(player.playerObj);
            });

            break;

        case Client.CommandConstants.UPDATE:
            var foundIt = false;
            message.data.players.forEach(function(player) {
                for (var i = 0; i < self._players.length; i++) {
                    if (player.id === self._players[i].id) {
                        movePlayer(self._players[i], player);

                        self._players[i].props.isIt = player.props.isIt;
                        self._players[i].playerObj.material.color.setHex(player.props.isIt ? 0x993333 : 0x333399);

                        if (player.props.isIt) {
                            foundIt = true;
                        }

                        return;
                    }
                }

                buildPlayerObj(player);

                self._scene.add(player.dogtagObj);
                self._scene.add(player.playerObj);
                self._players.push(player);
            });

            self._controls.isIt = !foundIt;

            if (message.data.players.length < self._players.length) {
                for (var i = 0; i < self._players.length; i++) {
                    for (var j = 0; j < message.data.players.length; j++) {
                        if (self._players[i].id === message.data.players[j].id) {
                            break;
                        }
                    }
                    self._scene.remove(self._players[i].playerObj);
                    self._scene.remove(self._players[i].dogtagObj);
                    self._players.splice(i, 1);
                    i--;
                }
            }

            break;
    }

    function buildPlayerObj(player) {
        var playerObj = new THREE.Mesh(
            new THREE.BoxGeometry(
                self._controls.DimensionConstants.RADIUS*2,
                self._controls.DimensionConstants.HEIGHT,
                self._controls.DimensionConstants.RADIUS*2),
            new THREE.MeshBasicMaterial({
                color: player.props.isIt ? 0x993333 : 0x333399
            })
        );
        playerObj.translateX(player.props.position.x);
        playerObj.translateY(player.props.position.y - self._controls.DimensionConstants.CAMERA_HEIGHT/2);
        playerObj.translateZ(player.props.position.z);

        player.playerObj = playerObj;


        dogtagObj = new THREE.Mesh(
            new THREE.TextGeometry(player.username, {
                font: self._font,
                size: 1,
                height: 0.0001,
                curveSegments: 6
            }),
            new THREE.MeshBasicMaterial({
                color: 0x00bb00
            })
        );
        dogtagObj.geometry.center();

        dogtagObj.translateX(player.props.position.x);
        dogtagObj.translateY(player.props.position.y + self._controls.DimensionConstants.DOGTAG_SPACE);
        dogtagObj.translateZ(player.props.position.z);

        dogtagObj.lookAt(self._controls.getObject().position);

        player.dogtagObj = dogtagObj;
    }

    function movePlayer(player, to) {
        player.playerObj.translateX(to.props.position.x - player.props.position.x);
        player.playerObj.translateY(to.props.position.y - player.props.position.y);
        player.playerObj.translateZ(to.props.position.z - player.props.position.z);

        player.dogtagObj.position.x = player.playerObj.position.x;
        player.dogtagObj.position.y = player.playerObj.position.y + self._controls.DimensionConstants.DOGTAG_SPACE;
        player.dogtagObj.position.z = player.playerObj.position.z;

        player.dogtagObj.geometry.center();
        player.dogtagObj.lookAt(self._controls.getObject().position);

        player.props = to.props;
    }
};
