# CocktailMachine
CocktailMachine is a HandBrake wrapper for distributed encoding. 
## Disclaimer
CocktailMachine should only be used in a trusted network. Someone on your network can see what your are transcoding with wireshark, and could execute commands on the slaves with a MITM attack.
## Description
CocktailMachine is a wrapper for HandBrake. It is meant to transcode large libraries on a network drive (in my case, my plex library). It scans a folder recursively and transcodes it, reproducing the file structure. It **can't** transcode a single file using several computers.
## Requirements
- Linux
- NodeJS
- HandBrakeCLI
- A network drive mounted at the same location on all slaves

The master scans provided location and distributes jobs to the slaves. One of the slaves can be the master.
# Setup
 1. Install NodeJS and NPM
 2. Install modules with npm
 3. Set master ip and copy to the workers

These step-by-step instruction will be for debian/ubuntu.
## Installing NodeJS and NPM
First, install curl and git :

    sudo apt-get install -y curl git

You can install any node version, but CocktailMachine has been written with v10 :

    curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
    sudo apt-get install -y nodejs
  ## Installing the modules with npm
Clone the repo and install the modules :

    git clone https://github.com/DontBreakAlex/CocktailMachine.git && cd CocktailMachine && npm install

## Set master ip and copy
You need to edit line 5 of slave.js and replace 127.0.0.1 by the ip of the master (in my case, 192.168.10.124) :

    before | const  ip  =  '127.0.0.1:4545'
    after  | const  ip  =  '192.168.10.124:4545'
Then install node and HandBrake on the slave(s) :

    curl -sL https://deb.nodesource.com/setup_10.x | sudo bash -
    sudo apt-get install -y nodejs handbrake-cli
If you are using ubuntu, you need to add handbrake ppa before installing it : `sudo add-apt-repository ppa:stebbins/handbrake-releases`

Finaly copy the folder CocktailMachine to the slave(s)

# Configuration
First run the master (server) :`node master.js`
If you want it to run in the background, I recommend using screen :

    sudo apt-get install -y screen
    screen -dm node master.js
To stop the server, attach the screen : `screen -r` and press CTRL+C

With the server running, you can access the web interface by navigating to :
http://MASTER_IP:4545

If you need help, refer to "Detailed explanation of settings"

# Usage
Connect to the master's web interface, and set the location of the folder your want to transcode (if not already done).
Press the "acquire jobs" button, and press "show jobs" to check that jobs are detected.
If you have trouble detecting jobs, refer to "Detailed explanation of settings".
You can then run slave.js on the slave(s) : `node slave.js`
The slave will exit when all jobs are completed. 
I recommend running it in the background using screen :

    sudo apt-get install -y screen
    screen -dm node slave.js
# Detailed explanation of settings
## Where the files to transcode are on the server
This is the path to the directory you want to transcode, from the point of view of the master. Running `ls` folowed by this path on the master should return the files countained in this folder.

## Where the files to transcode are on the workers
This is the path to the directory you want to transcode, from the point of view of the slave. Running `ls` folowed by this path on the slave should give the same output as one the master.

## Where to place the transcoded files on the workers
This is where to workers will place the transcoded files. This should be on the network drive.
## HandBrake parameters
This is the arguments that will be passed to HandBrake. Ex: `-e x265 -q 26 -E aac -R 44.1 -B 96`
## How many cores should a worker have
It defines how many workers the slave script will start : if the slaves has 8 cores and `coresperthread` is set to 4 (recommended), the slave will start 8/4 = 2 threads (aka HandBrake job). 
