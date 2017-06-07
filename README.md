# among-server

SKKU 2017 Spring semester capstone design course team project.

### Environment
- Ubuntu 14.04    
- Nodejs v6.10.2    
- MongoDB v3.4.4

### MongoDB installation in Ubuntu 14.04
https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/

    $ mkdir -p /data/db
	$ nohup /usr/bin/mongod &> /var/log/mongod.nohup.log &
	
### configuration file format
Create file on path */workspace/among-server/config.json*
    
	{
		"__mongodb_host": "mongodb://localhost:27017/among",
		"__storage_path": "./storage",
		"__temp_path": "./tmp",
		"__crawler_path": "crawler_executable/path/filename",
		"__crawler_cwd": "crawler_executable/path/"
	}

### Server starting command

    
	$ npm install
	$ npm start

### Forever module installation

	$ npm install -g forever
	
### Server staring with forever as background service

    $ node among.js start -d
    
	
### 출처

Twitter bootstrap 3 admin template    
https://github.com/bopoda/ace
	
