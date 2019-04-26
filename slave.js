const axios = require('axios');
const exec = require('child_process').exec;
const fs = require('fs')
const outputpath = '/home/alexandre/cocktailmachineoutput'
const execpath = '/home/alexandre/Vidéos'
const execoptions = '-e x265 -q 26 -E mp3 -B 96'
const threads = 2

async function Work(num) {
    let error = ''
    while (error == '') {
        let job = await axios({ // Ask the master for a job
            url: 'http://127.0.0.1:3000/job',
            method: 'GET',
        }).catch(err => error = err)
        if (job.data == undefined) return 'done'; // If no more jobs are available, stop the worker
        await new Promise(async (resolve, reject) => {
            let index  = job.data[0].lastIndexOf('/'); // Check the file is in a directory, and if yes, create it
            if (index !== 0) {
                let path = job.data[0].substring(0, index);
                await new Promise(async (resolve, reject) => { // It looks like fs.mkdir won't run without a callback (with promises). 
                    fs.mkdir(outputpath+path, {recursive: true}, err => {
                        if (err) {reject(err);} else {resolve();}
                    })
                }).catch(err => console.warn(err));
            }
            exec(`HandBrakeCLI ${execoptions} -i "${execpath + job.data[0]}" -o "${outputpath + job.data[0]}"`, (stdout, stderr) => { // Start HandBrake
                console.log(`Thread ${num} has finished processing ${job.data[0]}`)
                if (stderr !== '' && stderr !== null) {console.log(`Stderr: ${stderr.trim()}`);} // Handle HandBrake output
                if (stdout !== '' && stdout !== null) {console.log(`Stdout: ${stdout}`);}
                axios({ // Tell the server that the job is finished
                    url: 'http://127.0.0.1:3000/job',
                    method: 'PUT',
                    data: { uuid: job.data[1] }
                }).catch(err => {error = err; reject(err)}).then(resolve());
            });
        }).catch(err => console.warn(err));
    }
}

for (i=0; i<threads; ++i) {Work(i); console.log(`Starting thread ${i}`);} // Start workers