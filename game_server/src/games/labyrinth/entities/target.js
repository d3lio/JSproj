var Entity = require('./entity');
var Utils = require('../utils/utils');

/**
 * @brief: Target entity.
 * @param(targetType): Target type.
 * @param(__rest__): Passed to the Entity constructor.
 */
function Target(targetType) {
    Utils.checkInstance(this, Target);
    Utils.checkLeastLen(arguments, 1);

    var __rest__ = Utils.slice(arguments, 1);
    Utils.call(Entity, this, 'target', __rest__);

    this.targetType = targetType;
}
Utils.inherit(Target, Entity);

module.exports = Target;
