function Clock() {
    if (!(this instanceof Clock)) {
        return new Clock();
    }

    this.prevTime = 0;
    this.pauseTime = 0;
}

Clock.prototype.now = function() {
    return performance.now();
}

Clock.prototype.start = function() {
    this.prevTime = this.now();
    return this;
};

Clock.prototype.delta = function() {
    if (this.pauseTime) {
        return 0;
    }

    var deltaTime = this.now() - this.prevTime;
    this.prevTime = this.now();
    return deltaTime / 1000;
};

Clock.prototype.pause = function() {
    this.pauseTime = this.now();
};

Clock.prototype.resume = function() {
    this.prevTime += this.now() - this.pauseTime;
    this.pauseTime = 0;
};
