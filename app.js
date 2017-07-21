let path = require('path'),
    express = require('express');

let app = express(),
    port = process.argv[2] || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.listen(port);
console.log(`app listening on port ${port}`);
