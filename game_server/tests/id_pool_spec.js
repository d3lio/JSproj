var IdPool = require('../src/utils/id_pool/id_pool');

describe('Id pool specs:', function() {
    var idPool = null;

    it('New pool', function() {
        expect(() => {idPool = new IdPool()}).not.toThrow();
    });

    it('Size 1', function() {
        expect(idPool.size()).toBe(IdPool.Constants.DEFAULT_POOL_SIZE);
    });

    it('Size 2', function() {
        idPool.clear();
        expect(idPool.size()).toBe(IdPool.Constants.DEFAULT_POOL_SIZE);
    });

    it('Reserve 1', function() {
        idPool.clear();
        idPool.reserve(); // 1
        expect(idPool.reserve()).toBe(2); // 2
    });

    it('Reserve 2', function() {
        idPool.release(1); // Should not matter
        idPool.release(2); // Should not matter
        expect(idPool.reserve()).toBe(3); // 3
    });

    it('Length 1', function() {
        idPool.clear();
        idPool.reserve(); // 1
        idPool.reserve(); // 2
        idPool.reserve(); // 3
        expect(idPool.length()).toBe(3);
    });

    it('Length 2', function() {
        idPool.reserve(); // 4
        idPool.reserve(); // 5
        idPool.release(3);
        idPool.reserve(); // 6
        expect(idPool.length()).toBe(5);
    });

    it('Pool overflow', function() {
        idPool.clear();

        for (var i = IdPool.Constants.MIN_ID; i <= IdPool.Constants.DEFAULT_MAX_LENGTH; i++) {
            // NOTE: expecting these not to throw but can't make so many assertions in jasmine.
            idPool.reserve();
        }

        expect(() => idPool.reserve()).toThrow();
    });

    it('Holes', function() {
        idPool.clear();

        for (var i = IdPool.Constants.MIN_ID; i <= IdPool.Constants.DEFAULT_MAX_LENGTH; i++) {
            idPool.reserve();
        }

        idPool.release(10);
        idPool.release(11);
        idPool.release(1000);
        idPool.release(1001);
        idPool.release(1002);

        for (var i = 0; i < 5; i++) {
            expect(() => idPool.reserve()).not.toThrow();
        }

        expect(() => idPool.reserve()).toThrow();
    });

    it('Highly fragmented', function() {
        idPool.clear();

        for (var i = IdPool.Constants.MIN_ID; i <= IdPool.Constants.DEFAULT_MAX_LENGTH; i++) {
            idPool.reserve();
        }

        for (var i = IdPool.Constants.MIN_ID; i <= IdPool.Constants.DEFAULT_MAX_LENGTH; i += 2) {
            // NOTE: expecting these not to throw but can't make so many assertions in jasmine.
            idPool.release(i);
        }

        expect(idPool.reserve()).toBe(IdPool.Constants.MIN_ID);

        for (var i = IdPool.Constants.MIN_ID + 2; i <= IdPool.Constants.DEFAULT_MAX_LENGTH; i += 2) {
            idPool.reserve();
        }

        expect(() => idPool.reserve()).toThrow();
    });

    it('Segfault?', function() {
        idPool.clear();
        for (var i = 0; i < 10000; i++) {
            idPool.release(idPool.reserve());
        }
    });
});
