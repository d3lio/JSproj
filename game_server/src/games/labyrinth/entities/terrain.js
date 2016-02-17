var Entity = require('./entity');
var Utils = require('../utils/utils');

/**
 * @brief: Terrain entity.
 * @param(terrainType): Terrain type.
 * @param(__rest__): Passed to the Entity constructor.
 */
function Terrain(terrainType) {
    Utils.checkInstance(this, Terrain);
    Utils.checkLeastLen(arguments, 1);

    var __rest__ = Utils.slice(arguments, 1);
    Utils.call(Entity, this, 'terrain', __rest__);

    this.terrainType = terrainType;
    this.entities = [];
}
Utils.inherit(Terrain, Entity);

module.exports = Terrain;
