const recursive = require("recursive-readdir");
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');
app.set('path', '/home/alexandre/Vidéos');
app.set('outputpath', '/home/alexandre/cocktailmachineoutput');
app.set('execpath', '/home/alexandre/Vidéos');
app.set('execoptions', '-e x265 -q 26 -E mp3 -B 96');
app.set('coresperthread', 4);

function getTable() {
    recursive(app.get('path'), ["!*.{mp4,mkv,avi,mov}"]).catch(err => console.log(err)).then(data => {
        let lenght = app.get('path').length, table = [[],[]];
        for (let i=0, len=data.length; i<len; ++i) {
            table[i] = [data[i].substring(lenght), 'waiting'];
        }
        console.log(table);
        app.set('jobs', table);
        fs.writeFile('./table.json', JSON.stringify(table), 'utf8', () => {})
    });
}

app.use('/node_modules', express.static('node_modules'))
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.use('/', require('./modules/api'));
app.use('/mgr', require('./modules/mgr'))
app.listen(port, () => {console.log(`Listening on port ${port}`)});

getTable();