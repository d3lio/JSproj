var fs = require('fs');
var projFile = 'build/id_pool.vcxproj';
var data = fs.readFileSync(projFile, 'utf8');
// Adds /EHsc to the vs project command line which enables cpp excpetions
data = data.replace(/AdditionalIncludeDirectories>\s*<AdditionalOptions>/g, "$&/EHsc ");
fs.writeFileSync(projFile, data, 'utf8');