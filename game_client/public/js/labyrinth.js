function Labyrinth() {
    if (!(this instanceof Labyrinth)) {
        return new Labyrinth();
    }

    this.map = null;
}

Labyrinth.Constants = {
    EMPTY: 0,
    WALL: 1,

    SCALE: 20
}

Labyrinth.prototype.init = function(scene) {
    if (!(scene instanceof THREE.Scene)) {
        throw new TypeError("Expected first argument to be THREE.Scene");
    }

    var self = this;

    // gen

    this.map.forEach(function(row, i) {
        row.forEach(function(cell, j) {
            switch(cell) {
            case 0:
                self.map[i][j] = null;
                break;
            case 1:
                var wall = new THREE.Mesh(
                    new THREE.BoxGeometry(
                        Labyrinth.Constants.SCALE,
                        Labyrinth.Constants.SCALE * 2,
                        Labyrinth.Constants.SCALE),
                    new THREE.MeshBasicMaterial({
                        color: 0x003399
                    })
                );
                wall.position.set(
                    (i - Math.floor(self.map.length/2)) * Labyrinth.Constants.SCALE,
                    0,
                    (j - Math.floor(self.map[0].length/2)) * Labyrinth.Constants.SCALE
                );
                self.map[i][j] = wall;

                scene.add(wall)
                break;
            }
        });
    });
};

Labyrinth.prototype.isFree = function(position, radius) {
    if (!(position instanceof THREE.Vector3)) {
        throw new TypeError("Expected first argument to be THREE.Vector3");
    }

    if (typeof radius !== 'number') {
        throw new TypeError("Expected second argument to be Number");
    }

    radius = radius / Labyrinth.Constants.SCALE;

    var x = position.x / Labyrinth.Constants.SCALE + this.map.length/2;
    var z = position.z / Labyrinth.Constants.SCALE + this.map[0].length/2;

    console.log(x, z, radius);

    return !this.map[Math.floor(x + radius)][Math.floor(z)] &&
           !this.map[Math.floor(x - radius)][Math.floor(z)] &&
           !this.map[Math.floor(x)][Math.floor(z + radius)] &&
           !this.map[Math.floor(x)][Math.floor(z - radius)] &&
           !this.map[Math.floor(x - radius)][Math.floor(z + radius)] &&
           !this.map[Math.floor(x + radius)][Math.floor(z + radius)] &&
           !this.map[Math.floor(x + radius)][Math.floor(z - radius)] &&
           !this.map[Math.floor(x - radius)][Math.floor(z - radius)];
};


Labyrinth.prototype.collision = function(position, radius) {
    if (!(position instanceof THREE.Vector3)) {
        throw new TypeError("Expected first argument to be THREE.Vector3");
    }

    if (typeof radius !== 'number') {
        throw new TypeError("Expected second argument to be Number");
    }

    radius = radius / Labyrinth.Constants.SCALE;

    var x = position.x / Labyrinth.Constants.SCALE + this.map.length/2;
    var z = position.z / Labyrinth.Constants.SCALE + this.map[0].length/2;

    if (this.map[Math.floor(x + radius)][Math.floor(z)]) {
        position.x = Math.floor(x + radius) - radius;
        position.x -= this.map.length/2;
        position.x *= Labyrinth.Constants.SCALE;
    }
    if (this.map[Math.floor(x - radius)][Math.floor(z)]) {
        position.x = Math.ceil(x - radius) + radius;
        position.x -= this.map.length/2;
        position.x *= Labyrinth.Constants.SCALE;
    }
    if (this.map[Math.floor(x)][Math.floor(z + radius)]) {
        position.z = Math.floor(z + radius) - radius;
        position.z -= this.map[0].length/2;
        position.z *= Labyrinth.Constants.SCALE;
    }
    if (this.map[Math.floor(x)][Math.floor(z - radius)]) {
        position.z = Math.ceil(z - radius) + radius;
        position.z -= this.map[0].length/2;
        position.z *= Labyrinth.Constants.SCALE;
    }

    return position;
};