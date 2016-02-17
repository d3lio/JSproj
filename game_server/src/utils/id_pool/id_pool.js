var Utils = require('../utils');
var IdPoolLib = require('../../../build/release/id_pool');

/**
 * @brief: This file is just a wrapper over the js interface of the cpp id_pool.
 * @notes: Any id_pool build path changes should only reflect here.
 * Any other js file should use this wrapper instead of directly requireing
 * the compiled file.
 */

/**
 * @brief: Simple ID pool using bits to store used ids.
 * @param(count): Max id count.
 * @throw: If the required memory can't be allocated for the pool, it throws.
 * @notes: 0 is used to show a null id.
 */
function IdPool(count) {
    Utils.checkInstance(this, IdPool);
    
    // NOTE: default count is DEFAULT_MAX_LENGTH.
    // It will be set by the cpp side if necessary.
    return new IdPoolLib.IdPool(count);
}

IdPool.Constants = {
    DEFAULT_POOL_SIZE: (1<<17), // (1<<17) B == 128 KiB
    // over 1`000`000 ids since each byte holds 8 (1<<3) ids
    // the -1 is to account the NULL_ID
    DEFAULT_MAX_LENGTH: (1<<20) - 1,
    DEFAULT_CTOR_MAX_POSSIBLE_SIZE: 0x7FFFFFFF,
    NULL_ID: 0,
    MIN_ID: 1
};

/**
 * @brief: Reserve an id from the pool.
 * @return: Returns the id.
 * @complexity: O(1).
 * @notes: Since this implementation relies on free chunks
 * of ids and the initial free chunk is the whole map,
 * it will first give out all ids up to the size of the pool and
 * only then it will start looking for free chunks caused by releasing ids.
 * Because of that, the pool does not guarantee that it will always
 * reserve the lowest free id.
 */
// IdPool.prototype.reserve = function() {};

/**
 * @brief: Release an id from the pool.
 * @throw: It can throw.
 * @param(id): The id to release.
 * @complexity: O(1) or O(m) where m is the count of free chunks throughout the pool.
 */
// IdPool.prototype.release = function(id) {};

/**
 * @brief: Clears the pool.
 * @complexity: O(n) where n is the size of the pool NOT the length.
 */
// IdPool.prototype.clear = function() {};

/**
 * @brief: Checks wether the pool contains an id.
 * @complexity: O(1).
 * @param(id): The id.
 */
// IdPool.prototype.has = function(id) {};

/**
 * @return: The size of the underlying byte array.
 * @complexity: O(1).
 */
// IdPool.prototype.size = function() {};

/**
 * @return: The count of the reserved ids.
 * @complexity: O(1).
 */
// IdPool.prototype.length = function() {};

module.exports = IdPool;
