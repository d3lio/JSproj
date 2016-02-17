var Utils = require('../utils/utils');
var Coord = require('../utils/coord');

/**
 * @brief: Entity base object.
 * @param(type): The entity type - should be the function's lowercase name.
 * @param(pos): Entity pos in world space.
 * @param(dir): Direction as a vector of length one or (0,0) for default value.
 */
function Entity(type, pos, dir) {
    Utils.checkInstance(this, Entity);

    this.type = type || 'entity';
    this.pos = pos || new Coord();
    this.dir = dir || new Coord();
}

module.exports = Entity;
