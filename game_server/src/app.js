var program = require('commander');
var Realm = require('./server/realm');

program.version('1.0.0')
    .option('--verbosity <level>', 'Verbosity level', parseInt)
    .option('-p, --port <port>', 'Specify server listening port', parseInt)
    .parse(process.argv);

var server = new Realm();

process.on('exit', function() {
    server.close();
});
process.on('SIGINT', function() {
    console.log('Program interrupted. Closing..');
    server.close();
});
/*process.on('uncaughtException', function() {
    console.log('Unexpected exception. Closing..');
    server.close();
});*/

server.listenOn(program.port || Realm.Constants.DEFAULT_TCP_PORT);
