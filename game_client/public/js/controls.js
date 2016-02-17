function Controls(camera, clock) {
    if (!(this instanceof Controls)) {
        return new Controls(camera, clock);
    }

    if (!(camera instanceof THREE.Camera)) {
        throw new TypeError("Expected first argument to be THREE.Camera");
    }

    if (!(clock instanceof Clock)) {
        throw new TypeError("Expected second argument to be Clock");
    }

    camera.rotation.set(0, 0, 0);

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(camera);

    this.yawObject = new THREE.Object3D();
    this.yawObject.add(this.pitchObject);

    this.clock = clock;

    this.enabled = false;

    this.velocity = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.canJump = true;

    this.isIt = false;
}

Controls.KeyConstants = {
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,

    KEY_W: 87,
    KEY_S: 83,
    KEY_A: 65,
    KEY_D: 68,

    KEY_SPACE: 32
};

Controls.VelocityConstants = {
    MOVEMENT_SPEED: 40.0,
    MOVEMENT_VELOCITY: 10.0,
    ROTATION_SPEED: 0.002,
    MASS: 40.0,
    GRAVITY: 9.8,
    JUMP_HEIGHT: 120
};

Controls.DimensionConstants = {
    CAMERA_HEIGHT: 10,
    DOGTAG_SPACE: 10.5, // space over player's head
    HEIGHT: 13,
    RADIUS: 3
}

Controls.Constants = {
    SOFT_BUMP: true
};

Controls.prototype.init = function(scene) {
    if (!(scene instanceof THREE.Scene)) {
        throw new TypeError("Expected first argument to be THREE.Scene");
    }

    var self = this;

    this.yawObject.position.y = Controls.DimensionConstants.CAMERA_HEIGHT;

    var onKeyDown = function(event) {
        switch (event.keyCode || event.charCode) {
            case Controls.KeyConstants.KEY_UP:
            case Controls.KeyConstants.KEY_W:
                self.moveForward = true;
                break;

            case Controls.KeyConstants.KEY_LEFT:
            case Controls.KeyConstants.KEY_A:
                self.moveLeft = true;
                break;

            case Controls.KeyConstants.KEY_DOWN:
            case Controls.KeyConstants.KEY_S:
                self.moveBackward = true;
                break;

            case Controls.KeyConstants.KEY_RIGHT:
            case Controls.KeyConstants.KEY_D:
                self.moveRight = true;
                break;

            case Controls.KeyConstants.KEY_SPACE:
                if (self.canJump === true) {
                    self.velocity.y += Controls.VelocityConstants.JUMP_HEIGHT;
                    self.canJump = false;
                }
                break;
        }
    };

    var onKeyUp = function(event) {
        switch (event.keyCode || event.charCode) {
            case Controls.KeyConstants.KEY_UP:
            case Controls.KeyConstants.KEY_W:
                self.moveForward = false;

            case Controls.KeyConstants.KEY_DOWN:
            case Controls.KeyConstants.KEY_S:
                self.moveBackward = false;
                break;

            case Controls.KeyConstants.KEY_LEFT:
            case Controls.KeyConstants.KEY_A:
                self.moveLeft = false;

            case Controls.KeyConstants.KEY_RIGHT:
            case Controls.KeyConstants.KEY_D:
                self.moveRight = false;
                break;
        }
    };

    var onMouseMove = function(event) {
        if (!self.enabled) {
            return;
        }

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        self.yawObject.rotation.y -= movementX * Controls.VelocityConstants.ROTATION_SPEED;
        self.pitchObject.rotation.x -= movementY * Controls.VelocityConstants.ROTATION_SPEED;

        self.pitchObject.rotation.x = Math.max(-MathConstants.PI_2,
            Math.min(MathConstants.PI_2, self.pitchObject.rotation.x)
        );
    }

    // TODO: removeEventListener
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    document.addEventListener('mousemove', onMouseMove, false);

    scene.add(this.yawObject);
};

Controls.prototype.calculate = function(terrain) {
    if (!this.enabled) {
        return;
    }

    var delta = this.clock.delta();

    this.velocity.x -= this.velocity.x * Controls.VelocityConstants.MOVEMENT_VELOCITY * delta;
    this.velocity.z -= this.velocity.z * Controls.VelocityConstants.MOVEMENT_VELOCITY * delta;

    this.velocity.y -= Controls.VelocityConstants.GRAVITY * Controls.VelocityConstants.MASS * delta;

    if (this.moveForward) {
        this.velocity.z -=
        Controls.VelocityConstants.MOVEMENT_SPEED *
        Controls.VelocityConstants.MOVEMENT_VELOCITY * delta;
    }

    if (this.moveBackward) {
        this.velocity.z +=
        Controls.VelocityConstants.MOVEMENT_SPEED *
        Controls.VelocityConstants.MOVEMENT_VELOCITY * delta;
    }

    if (this.moveLeft) {
        this.velocity.x -=
        Controls.VelocityConstants.MOVEMENT_SPEED *
        Controls.VelocityConstants.MOVEMENT_VELOCITY * delta;
    }

    if (this.moveRight) {
        this.velocity.x +=
        Controls.VelocityConstants.MOVEMENT_SPEED *
        Controls.VelocityConstants.MOVEMENT_VELOCITY * delta;
    }

    if (Controls.Constants.SOFT_BUMP) {
        terrain.collision(this.yawObject.position, Controls.DimensionConstants.RADIUS);
    }

    this.yawObject.translateX(this.velocity.x * delta);
    this.yawObject.translateY(this.velocity.y * delta);
    this.yawObject.translateZ(this.velocity.z * delta);

    if (!Controls.Constants.SOFT_BUMP) {
        terrain.collision(this.yawObject.position, Controls.DimensionConstants.RADIUS);
    }

    if (this.yawObject.position.y < 1 ) {

        this.velocity.y = 0;
        this.yawObject.position.y = 1;

        this.canJump = true;
    }
};

Controls.prototype.getProps = function() {
    return {
        position: this.yawObject.position,
        velocity: this.velocity,
        //isIt: this.isIt
    };
};

Controls.prototype.getObject = function() {
    return this.yawObject
};
