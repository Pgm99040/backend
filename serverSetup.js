
Step 1: Install Apache on ubuntu 16
		
		For our purposes, we can get started by typing these commands:
		
		$ sudo apt-get update
		$ sudo apt-get install apache2

		Since we are using a sudo command, these operations get executed with root privileges. It will ask you for your regular user's password to verify your intentions.

		Once you've entered your password, apt will tell you which packages it plans to install and how much extra disk space they'll take up. Press Y and hit Enter to continue, and the installation will proceed.

		You can do a spot check right away to verify that everything went as planned by visiting your server's public IP address in your web browser (see the note under the next heading to find out what your public IP address is if you do not have this information already):

		http://your_server_IP_address
		You will see the default Ubuntu 16.04 Apache web page, which is there for informational and testing purposes. It should look something like this:

Step 2: Install Node JS on ubuntu 16

		$ curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
		$ sudo apt-get install -y nodejs

		Optional: install build tools

		To compile and install native addons from npm you may also need to install build tools:

		$ sudo apt-get install -y build-essential	

		After the installation you can check for the node and npm version.

		$ node -v 
			# you will se the node installed version. 
		$ npm -v 
			# you will se the npm installed version. 

Step 3: Install MongoDB on ubuntu 16

		RUn the following commands to install MongoDB 3.6

		$ sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5

		
		$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list


		Reload local package database.
		$ sudo apt-get update

		Install the MongoDB packages.
		$ sudo apt-get install -y mongodb-org

		To install a specific release of MongoDB

		To install a specific release, you must specify each component package individually along with the version number, as in the following example:

		$ sudo apt-get install -y mongodb-org=3.6.2 mongodb-org-server=3.6.2 mongodb-org-shell=3.6.2 mongodb-org-mongos=3.6.2 mongodb-org-tools=3.6.2


		Start MongoDB
		$ sudo service mongod start

		Ref: 
		https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

Step 4: Install npm globall packages required for the backend apps.
		
		1. For use during development of a node.js based application.

			nodemon will watch the files in the directory in which nodemon was started, and if any files change, nodemon will automatically restart your node application.

			$ sudo npm install -g nodemon

		2. Advanced, production process manager for Node.js
		
			$ sudo npm install pm2 -g 

			Ref: 
			http://pm2.keymetrics.io/

		3. Git

			$ sudo npm install git -g 