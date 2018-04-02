# Deploy demo application using docker only

This section of the [sxapi-demo-openshift-couchbase](https://github.com/startxfr/sxapi-demo-openshift-couchbase)
will show you how to run the sxapi-demo application stack only using docker command.

To run this demo, you must have have a demo environement setup configured. Follow guidelines 
to configure the [workstation environement](https://github.com/startxfr/sxapi-demo-openshift#setup-workstation-environement).

## Build images using Dockerfile

```bash
pwd
# $ ~/sxapi-demo-openshift-couchbase
# build api frontend container
docker build -t sxapi-demo-api api
# build web frontend container
docker build -t sxapi-demo-www www
# build twitter bot container
docker build -t sxapi-demo-bot-streamer bot-streamer
```

## Deploy database service using docker

```bash
# deploy database backend container
docker run -d \
       --name sxapi-demo-openshift-couchbase-db \
       -p 8091:8091 \
       -p 8092:8092 \
       -p 8093:8093 \
       -p 8094:8094 \
       -p 11207:11207 \
       -p 11210:11210 \
       -p 11211:11211 \
       -p 18091:18091 \
       -p 18092:18092 \
       -p 18093:18093 \
       -p 18094:18094 \
       couchbase/server:5.5.0-Mar
sleep 20
docker logs sxapi-demo-openshift-couchbase-db
```

You can then connect to you admin panel (web console) at [http://localhost:8091](http://localhost:8091) and start configuring your database.
- Click on **Setup a new cluster**
- Choose `Demo` as **Cluster name**, leave `Administrator` as admin user, and set **password** to `Administrator123$` (twice). Hit **Next** when finished
- Agree to the terms & conditions and hit "Configure Disk, Memory, Services"
- Configure cluster resources
  - Leave Host and Disk path unchanged
  - Set **Data Memory Quota** to `1024` (1Go). If you run under limited resource, you can reduce Index, Search and Eventing to 256Mo. Analytics is not required for this demo.
  - Set **Index Storage Setting** to `Memory-Optimized`
  - Hit **Save & Finish**
- Create demo Bucket
  - Click on the "Bucket" section (left pane)
  - Click the **Add Bucket** button on the top right corner
  - Under the Add data bucket dialog
    - Set **bucket name** to `demo`
    - Set **Memory Quota** to `300`
    - Set **Bucket Type** to `Ephemeral`
    - Disable bucket **replica** (single node configuration)
    - Enable bucket **flush** action
    - Click the **Add Bucket** button

## Deploy API service using docker

```bash
# deploy api frontend container
docker run -d \
       --name sxapi-demo-openshift-couchbase-api \
       -e SX_VERBOSE=true \
       -e SX_DEBUG=true \
       -e MARIADB_SERVICE_HOST="sxapi-demo-openshift-couchbase-db" \
       -e MYSQL_USER="dev-user" \
       -e MYSQL_PASSWORD="dev-pwd123" \
       -e MYSQL_DATABASE="demo" \
       --link sxapi-demo-openshift-couchbase-db:db \
       -p 8080:8080 \
       sxapi-demo-api \
       /bin/sx-nodejs run
sleep 1
docker logs sxapi-demo-openshift-couchbase-api
```

## Deploy WWW service using docker

```bash
# deploy www frontend container
docker run -d \
       --name sxapi-demo-openshift-couchbase-www \
       -e SX_VERBOSE=true \
       -e SX_DEBUG=true \
       -p 8081:8080 \
       sxapi-demo-www \
       /bin/sx-nodejs run
sleep 1
docker logs sxapi-demo-openshift-couchbase-www
```

## Docker strategy workflow

```
.--------------------------.
| source code (sxapi-demo) |
|--------------------------|-.
| local copy ./www/        | |        .----------------.        .----------------.
'--------------------------' | docker |   WWW image    | docker | WWW container  |8080
                             .------->|----------------|------->|----------------|--.
.--------------------------. | build  | sxapi-demo-www | run    | sxapi-demo-www |  |      .-,(  ),-.    
|     base image (s2i)     | |        '----------------'        '----------------'  |   .-(          )-. 
|--------------------------|-'                                                      .->(    internet    )
| startx/sv-nodejs         |-.                                                      |   '-(          ).-'
'--------------------------' |        .----------------.        .----------------.  |       '-.( ).-'    
                             | docker |   API image    | docker | API container  |--'
.--------------------------. .------->|----------------|------->|----------------|8081
| source code (sxapi-demo) | | build  | sxapi-demo-api | run    | sxapi-demo-api |
|--------------------------|-'        '----------------'        '----------------'
| local copy ./api/        |                                             |
'--------------------------'                                             |
                                                                         v 3306
.--------------------------.                                    .----------------.
|     base image (s2i)     |                             docker |  DB container  |
|--------------------------|----------------------------------->|----------------|
| startx/sv-mariadb        |                             run    | sxapi-demo-db  |
'--------------------------'                                    '----------------'
```

### Access your application in your browser

Access your application using your browser on `http://localhost:8080`


## Troubleshooting, contribute & credits

If you run into difficulties installing or running this demo [create an issue](https://github.com/startxfr/sxapi-demo-openshift-couchbase/issues/new).

You will information on [how to contribute](https://github.com/startxfr/sxapi-demo-openshift-couchbase#contributing) or 
[technologies credits](https://github.com/startxfr/sxapi-demo-openshift-couchbase#built-with) and
[demo authors](https://github.com/startxfr/sxapi-demo-openshift-couchbase#authors) on the 
[sxapi-demo-openshift-couchbase homepage](https://github.com/startxfr/sxapi-demo-openshift-couchbase).