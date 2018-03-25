# sxapi-demo-openshift-couchbase

Example application composed of multiple [sxapi](https://github.com/startxfr/sxapi-core/) 
 micro-services backended with a [couchbase cluster](http://couchbase.com)
on top of an [openshift platform](https://www.openshift.org).

This demo intend to show how you can run an full application using [Openshift PAAS](https://www.openshift.org)
or [Red Hat Openshift](https://www.redhat.com/fr/technologies/cloud-computing/openshift) as
building and running plateform. Using [docker](https://hub.docker.com/r/startx), managed by 
[Kubernetes](https://kubernetes.io) and superset with CI/CD + security and management feature embeded in
[Openshift](https://www.openshift.org) layer, you will learn how to use the latest technologies 
to run scalable, resilient and secured application on top of a smart and distributed architecture.
You will also discovert a [simple API backend](https://github.com/startxfr/sxapi-core/) useful for creating 
simple and extensible API using a micro-service architecture. [SXAPI project](https://github.com/startxfr/sxapi-core/)
is based on [nodejs](https://nodejs.org) technologie and is 
available as a docker image on dockerhub ([sxapi image](https://hub.docker.com/r/startx/sxapi)) or as an
npm module ([sxapi npm module](https://www.npmjs.com/package/sxapi-core))

## Setup demo environement in AWS

Require knowledge of [AWS services](https://aws.amazon.com) (especialy EC2, VPC, Route53) and full access to 
EC2, VPC and Route53 services. Your AWS account must be billable and you must have access to a domain hostZone.

These instruction will help you setup an openshift single instance on an AWS EC2 instance responding to a public sub-domain
of your corporation or entity.

### VPC network configuration

You must setup the following resources under you AWS VPC cnfiguration. With your kwoledge of AWS VPC services
you must configure :

- 1 ***VPC*** with DHCP, DNS and Hostname resolution activated. Whatever CIDR is OK (example `192.168.0.0/24`)
- 1 ***internet gateway*** with default configuration. Associated to the previously created VPC 
- 1 ***Subnet*** routing all trafic from and to the internet gateway. All port opened and public IP activated.
- 1 ***DHCP configuration*** with default configuration
- 1 ***Security group*** with in and out traffic authorized for All traffic, TCP, ICMP and UDP inbound and outbound to/from anywhere

### EC2 instance configuration

Start your single node server in order to install and configure your Openshift plateform.

- On EC2, click on "start a new instance"
- Choose Marketplace then type centos (hit enter) and choose "CentOS 7 (x86_64) - with Updates HVM"
- Select a "t2.xlarge" instance (t2.medium is minimum to run this application)
- On next screen, choose VPC and subnet previously created. Check "automated IP" is activated. and hit "next"
- Select a 50Go SSD for storage, with 2500/IOP on rovisionned SSD, then next
- Create labels according to your labelling strategy
- Associate the "openAll" security group created in the previous section
- Review and launch

### Route53 DNS configuration

Enable you application to use your own domain zone and make application accessible to your domain.
In the next sections, we will assume you are responding to the DNS record `openshift.demo.startx.fr` for 
master node, and `*.openshift.demo.startx.fr` for applications.

- Copy the public IP associated to your starting instance, then go to route53 service
- Select a domain zone you want to use
- Create a new DNS entry of type A, with your selected master domain name (ex: `openshift.demo.startx.fr`) and the public IP adress as value
- Hit "create"
- Create a new DNS entry of type CNAME, with your selected applications domain name (ex: `*.openshift.demo.startx.fr`) and the master domain name (ex: `openshift.demo.startx.fr`) as value
- Hit "create" and wait for propagation

## Server installation

This section will help you install and run your openshift demo node on your EC2 instance previously launched.

- Connect to the server
```bash
ssh -i sx-eu-key-demo-openshift.pem centos@openshift.demo.startx.fr
```
- You must be root to install openshift and dependencies
```bash
sudo su -
yum install -y git
```
- Setup the DNS used for your demo environement
```bash
export DNSNAME=openshift.demo.startx.fr
```
- Run the following install script. Adapt the firsts parameters to your needs
```bash
cd ~
git clone https://github.com/startxfr/sxapi-demo-openshift-couchbase.git
cd sxapi-demo-openshift-couchbase
./openshift-install
```

- Start the openshift cluster
```bash
cd ~/sxapi-demo-openshift-couchbase
./openshift-start
```

- Access your web-console using the `https://openshift.demo.startx.fr:8443` URL.
- Access openshift cli using
```bash
oc login -u system:admin
```

## Deploy your application

This section will help you start a build and deploy of your application stack.

### Create project in openshift

In order to visualize your objects in the webconsole, you should create the project 
using the Web console. 

- Connect to the web console using `https://openshift.demo.startx.fr:8443`
- Authenticate using the system admin user `system` with passsword `admin`
- Create a new project (right panel) and name it. We will assume your project name for this demo will be `demo`

### Create couchbase container cluster 

```
cd cb/
./couchbase-create demo
cd -
```

### Access your application in your browser

Access your application using your browser on `https://api.openshift.demo.startx.fr`


## Troubleshooting

If you run into difficulties installing or running sxapi, you can [create an issue](https://github.com/startxfr/sxapi-core/issues/new).

## Built With

* [amazon web-services](https://aws.amazon.com) - Infrastructure layer
* [docker](https://www.docker.com/) - Container runtime
* [kubernetes](https://kubernetes.io) - Container orchestrator
* [openshift](https://www.openshift.org) - Container plateform supervisor
* [nodejs](https://nodejs.org) - Application server
* [sxapi](https://github.com/startxfr/sxapi-core) - API framework

## Contributing

Read the [contributing guide](https://github.com/startxfr/sxapi-core/tree/testing/docs/guides/5.Contribute.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

This project is mainly developped by the [startx](https://www.startx.fr) dev team. You can see the complete list of contributors who participated in this project by reading [CONTRIBUTORS.md](https://github.com/startxfr/sxapi-core/tree/testing/docs/CONTRIBUTORS.md).

## License

This project is licensed under the GPL Version 3 - see the [LICENSE.md](https://github.com/startxfr/sxapi-core/tree/testing/docs/LICENSE.md) file for details
