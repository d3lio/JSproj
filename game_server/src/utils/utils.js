var util = require('util');
var _slice = Array.prototype.slice;
var _push = Array.prototype.push;

// TODO: refactor the check functions to accept callbacks.

/**
 * @brief: Utils object is used for consistent and readable code.
 * @notes: Most functions throw on fail.
 */
var Utils = {
    inherit: util.inherits,
    
    /**
     * @brief: Inheritance.
     * @param(derived): Constructor function of the derived object.
     * @param(base): Constructor function of the base object.
     */
    myInherit: function(derived, base) {
        if (!(derived instanceof Object) ||
            !(base instanceof Object))
        {
            throw new TypeError('Invalid argument type');
        }

        derived.prototype = Object.create(base.prototype);
        derived.prototype.constructor = derived;
    },

    /**
     * @brief: A custom call function that takes arrays and single args alike.
     * @param(fn): The function to apply to.
     * @param(that): The this obj to apply to fn.
     * @param(__rest__): Joint into an array to apply to fn.
     * @return: The return value of the function call.
     * @examples:
     *   1. Utils.call((a, b, c) => a+b+c, null, 1, [2, 3]);
     *   2. Utils.call((f) => this.f = f, {}, [() => 1]);
     */
    call: function(fn, that) {
        if (!(fn instanceof Function) ||
            !(that instanceof Object))
        {
            throw new TypeError('Invalid argument type');
        }

        var __rest__ = _slice.call(arguments, 2);
        var args = [];

        __rest__.forEach(function(arg) {
            if (arg instanceof Array) {
                _push.apply(args, arg);
            } else {
                // _push.call(args, arg);
                args.push(arg);
            }
        });

        return fn.apply(that, args);
    },

    /**
     * @brief: Slice an array just as if you would _slice.call().
     * @param(arr): The array to slice (this).
     * @param(__rest__): The arguments supplied to slice.
     * @return: The sliced array.
     */
    slice: function(arr) {
        if (!(arg instanceof Array)) {
            throw new TypeError('Invalid argument type');
        }
        return _slice.apply(arr, _slice.call(arguments, 1));
    },

    /**
     * @brief: Checks wether instance is an instance of obj.
     * @param(instance): The obj to be checked.
     * @optinal-param(nothrow): If specified then the function returns boolean.
     * @return: Only when nothrow is specified.
     * @param(obj): A constructor function or another object.
     */
    checkInstance: function(instance, obj, nothrow) {
        if (nothrow) {
            return instance instanceof obj;
        }

        if (!(instance instanceof Object) ||
            !(obj instanceof Object))
        {
            throw new TypeError('Invalid argument type');
        }

        if (!(instance instanceof obj)) {
            throw new TypeError('This is not an instance of '+ obj.name);
        }
    },

    /**
     * @brief: Checks wether a variable is of certain type.
     * @param(arg): The given variable.
     * @param(type): String representation of the type.
     * @optional-param(nothrow): If specified then the function returns boolean.
     * @return: Only when nothrow is specified.
     */
    checkType: function(arg, type, nothrow) {
        if (nothrow) {
            return typeof arg === type;
        }

        if (typeof type !== 'string') {
            throw new TypeError('Type must be a String variable');
        }

        if (typeof arg !== type) {
            throw new TypeError('The argument is not a '+ type);
        }
    },

    /**
     * @brief: Check wether a variable is undefined.
     * @param(arg): The given variable.
     * @notes: Can be called with no argument supplied to throw.
     */
    checkUndefined: function(arg) {
        if (typeof arg === 'undefined') {
            throw new TypeError('The argument is undefined');
        }
    },

    /** 
     * @brief: Checks wether the length of the arguments are greater than or equal to min.
     * @param(args): Object with a lengths property ususally argumets variable or Array.
     * @param(min): The minimum length allowed.
     */
    checkLeastLen: function(args, min) {
        if (typeof args.length !== 'number' ||
            typeof min !== 'number')
        {
            throw new TypeError("Args doesn't have a length property");
        }

        if (args.length < min) {
            throw new RangeError('Insufficient arguments');
        }
    },

    /**
     * @brief: Check wether a variable is a positive number.
     * @param(num): The given number.
     */
    checkPositiveNum: function(num) {
        if (typeof num !== 'number' || num < 1) {
            throw new TypeError('Invalid argument');
        }
    },

    /**
     * @brief: Returns a mapped version of a constructor prototype.
     * @param(ctor): The constructor.
     * @param(withPriv): Include private properties (_prop) if true.
     * @return: An object map with snake cased params.
     */
    prototypeMap: function(ctor, withPriv) {
        var m = Object.create(null);
        Object.keys(ctor.prototype).forEach(function(key) {
            if (withPriv || key[0] != '_') {
                var snakeKey = key.replace(
                    /([a-z])([A-Z])/,
                    (match, g1, g2, offset, string) => g1+'_'+g2.toLowerCase());
                m[snakeKey] = ctor.prototype[key];
            }
        });
        return m;
    },

    /**
     * @brief: Get an object's property by snake case string.
     * @param(obj): The object.
     * @param(snakeKey): Snake cased key.
     * @return: The key's associated value.
     */
    getProp: function(obj, snakeKey) {
        var key = key.replace(
            /_([a-z])/,
            (match, g1, offset, string) => g1.toUpperCase());
        return obj[key];
    },
};

module.exports = Utils;
