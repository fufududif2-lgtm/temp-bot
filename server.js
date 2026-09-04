const http = require('http');

http.createServer((req, res) => {
    res.write("Bot is alive!");
    res.end();
}).listen(process.env.PORT || 3000);

require('./index.js');
