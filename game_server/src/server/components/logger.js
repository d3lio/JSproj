var winston = require('winston');
var Logger = winston.Logger;
var DailyRotationTransport = require('winston-daily-rotate-file');
var path = require('path');

var logger = new Logger({
    transports: [
        new winston.transports.Console(),
        new DailyRotationTransport({
            name: 'error-log',
            level: 'error',
            dirname: path.join(__dirname, '..', '..', '..', 'logs', 'error'),
            filename: 'error.log'
        }),
        new DailyRotationTransport({
            name: 'info-log',
            level: 'info',
            dirname: path.join(__dirname, '..', '..', '..', 'logs', 'info'),
            filename: 'info.log'
        })
    ]
});

module.exports = logger;
