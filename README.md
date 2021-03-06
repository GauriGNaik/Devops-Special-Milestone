# Devops-Special-Milestone

## Milestone 1
   [Build Milestone](https://github.com/GauriGNaik/commons-csv/tree/master)
   
## Milestone 2
   [Test and Analysis Milestone](https://github.com/GauriGNaik/commons-csv/tree/milestone2)
   
## Milestone 3
   [Deployment Milestone](https://github.com/GauriGNaik/express_example/tree/milestone3)

## Special Milestone - Migration Monkey

The main idea for this milestone is to demonstrate how the service can be kept running even in case of failure by using the migration monkey and restart monkey. This is extremely useful when only a limited number of resources are available. For example, in our demonstration we have used only two servers. The idea is to keep atleast one of them active by performing migration so that the service is kept running at all times. 

For the special milestone we have implemented migration monkey and restart monkey. We have used one production server, one backup server and a proxy server. The production server is automatically provisioned and configured using the ansible playbook. Initially, only the production server and proxy server are active. The proxy server routes all the incoming traffic to the production server. 

A global redis store is used for storing the switch key value which is initially set to false. 

The monitoring application monitors the production server for memory usage. If the memory usage exceeds a certain threshold then it starts the migration of the data and the services to the backup server. An email and SMS alert are sent to the administrator indicating that the memory usage has been exceeded. Prior to the migration, ssh keys need to be exchanged between the production server and the backup server. 

For the migration, a list of packages installed on the production server is generated. Then, the production server transfers this package list along with all the application data to the backup server. 

A script is run on the production server which uses ssh mechanism to install all the packages on the backup server using the package list. The script also installs all the dependencies that are needed for running the application. It also starts all the required services on the backup server. Finally, it starts running the application on the backup server.

Once the migration is completed, the production server sets the switch key value to true in the global redis store and it performs a system reboot. 

The proxy server constantly monitors this switch key value and once it detects the changed value, it switches to the back up server. The proxy server then routes all the traffic to the backup server only. 

## Screencast

[Final Project Screencast](http://youtu.be/0NktKL9ynNU?hd=1)

## Team Members

* Gauri Naik (gnaik2)
* Arvind Telharkar(adtelhar)
* Ravneet Kaur(ravnee)






