const recursive = require("recursive-readdir");
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');

fs.readFile('./settings.json', (err, data) => {
    if (err) {console.log(err);} else {
        let settings = JSON.parse(data)
        app.set('path', settings.path);
        app.set('outputpath', settings.outputpath);
        app.set('execpath', settings.execpath);
        app.set('execoptions', settings.execoptions);
        app.set('coresperthread', settings.coresperthread);
    } 
});
 
fs.readFile('./table.json', (err, data) => {
    if (err) {console.log(err);} else {
        let jobs = JSON.parse(data)
        app.set('jobs', jobs);
    } 
});

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
app.listen(port, () => {console.log(`Listening on port ${port}`)});
