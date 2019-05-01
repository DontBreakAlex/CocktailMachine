const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const ip = '127.0.0.1:4545'

async function Work(num, execoptions, execpath, outputpath) {
    let error = ''
    while (error == '') {
        let job = await axios({ // Ask the master for a job
            url: `http://${ip}/job`,
            method: 'GET',
        }).catch(err => error = err);
        if (job.data == undefined) {console.log(`Thread ${num} exiting: no more jobs`); return 'done';} // If no more jobs are available, stop the worker
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
            let noext = job.data[0].substring(0, job.data[0].lastIndexOf('.'));
            let arg = execoptions.split(' ');
            arg.push('-i', execpath + job.data[0], '-o', outputpath + noext + '.mp4');
            let HandBrake = spawn('HandBrakeCLI', arg, {stdio: 'ignore'}); // Start HandBrake
            Exit(HandBrake, num, job, resolve, reject); // Handle HandBrake exit
        }).catch(err => console.warn(err));
    }
}

function Exit(HandBrake, num, job, next, fail) { 
    HandBrake.on('exit', code => {
        if (code == 0) {
            console.log(`Thread ${num} has finished processing ${job.data[0]}`);
        } else {
            console.warn(`Thread ${num} has failed processing ${job.data[0]}`);
        }
        axios({ // Tell the server that the job is finished
            url: `http://${ip}/job`,
            method: 'PUT',
            data: { uuid: job.data[1], status: code }
        }).catch(err => {error = err; fail(err)}).then(next());
    });
    // If you want to use these, you need to comment out (or delete) ", {stdio: 'ignore'}" at line 29
    //HandBrake.stdout.on('data', data => {console.log(`Thread ${num}: ${data.toString().substring(24,30)}`)}); // Uncomment to see HandBrake progression (not recommended: spits out a lot of data and is mostly unreadable)
    //HandBrake.stderr.on('data', data => {console.log(`Thread ${num}, stderr: ${data}`)}); // Uncomment at your own risk
}

axios({ // Get settings from the master
    url: `http://${ip}/settings`,
    method: 'GET',
}).then(data => {
    for (i=0; i<os.cpus().length/data.data.coresperthread; ++i) {Work(i, data.data.execoptions, data.data.execpath, data.data.outputpath); console.log(`Starting thread ${i}`);} // Start workers
}).catch(() => console.error("Can't connect to master ! Check master ip !"));