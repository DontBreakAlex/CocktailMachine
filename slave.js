const axios = require('axios');
const exec = require('child_process').exec;
const outputpath = '/home/alexandre/cocktailmachineoutput'
const execpath = '/home/alexandre/Vidéos'
const execoptions = '-e x265 -q 26 -E mp3 -B 96'
const threads = 2

async function Work(num) {
    let error = ''
    while (error == '') {
        let job = await axios({
            url: 'http://127.0.0.1:3000/job',
            method: 'GET',
        }).catch(err => error = err)
        if (job.data == undefined) return 'done'
        await new Promise((resolve, reject) => {
            
            exec(`HandBrakeCLI ${execoptions} -i "${execpath + job.data[0]}" -o "${outputpath + job.data[0]}"`, (stdout, stderr) => {
                console.log(`Thread ${num} has finished processing ${job.data[0]}`)
                if (stderr !== '' && stderr !== null) {console.log(`Stderr: ${stderr.trim()}`);}
                if (stdout !== '' && stdout !== null) {console.log(`Stdout: ${stdout}`);}
                axios({
                    url: 'http://127.0.0.1:3000/job',
                    method: 'PUT',
                    data: { uuid: job.data[1] }
                }).catch(err => {error = err; reject(err)}).then(resolve());
            });
        });
    }
}

for (i=0; i<threads; ++i) {Work(i); console.log(`Starting thread ${i}`);}