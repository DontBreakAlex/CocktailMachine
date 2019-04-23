const recursive = require("recursive-readdir");
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
var path = '/home/alexandre/Vidéos';

recursive(path, ["!*.{mp4,mkv,avi,mov}"]).catch(err => console.log(err)).then(data => {
    let lenght = path.length, table = [[],[]];
    for (let i=0, len=data.length; i<len; ++i) {
        table[i] = [data[i].substring(lenght), 'waiting'];
    }
    console.log(table);
    app.set('jobs', table);
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.use('/', require('./modules/api'));
app.use('/mgr', require('./modules/mgr'))
app.listen(port, () => {console.log(`Listening on port ${port}`)});