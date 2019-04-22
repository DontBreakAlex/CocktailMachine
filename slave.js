const axios = require('axios');
const exec = require('child_process').exec;
const outputpath = '/home/alexandre/cocktailmachineoutput'
const execpath = '/home/alexandre/Vidéos'



axios({
    url: 'http://127.0.0.1:3000/job',
    method: 'GET',
}).catch(err => console.log(err)).then(response=> { // TODO: Cerate directory before starting job, otherwise handbrake crashes
    exec(`HandBrakeCLI -i ${execpath+response.data[0]} -o ${outputpath+response.data[0]}`, (stdout, stderr) => {
        axios({
            url: 'http://127.0.0.1:3000/job',
            method: 'PUT',
            data: {uuid: response.data[1]} 
        }).catch(err => console.log(err))
    })
})