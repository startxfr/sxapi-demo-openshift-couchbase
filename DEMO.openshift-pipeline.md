# Deploy demo application using Openshift pipeline

This section of the [sxapi-demo-openshift-couchbase](https://github.com/startxfr/sxapi-demo-openshift-couchbase)
will show you how to run the sxapi-demo application stack using openshift Openshift pipeline
strategy. Jenkins will be used as a CI/CD backend for your deployement process.

To run this demo, you must have have a demo environement setup configured. Follow guidelines 
to configure the [workstation environement](https://github.com/startxfr/sxapi-demo-openshift#setup-workstation-environement)
and [openshift environement](https://github.com/startxfr/sxapi-demo-openshift#setup-openshift-environement).

## Openshift template

This demo provide an [all-in-one pipeline template](https://raw.githubusercontent.com/startxfr/sxapi-demo-openshift-couchbase/test/openshift-pipeline-all-ephemeral.json)
to build and deploy test and run stagging environement each containing the full application stack.

This template will create the following objects :
- **1 BuildConfig** describing the Jenkins pipeline workflow and CI/CD orchestration
- **1 ImageStream** with 2 tags linked to public bases images `startx/sv-mariadb` and `startx/sv-nodejs`
- **3 ImageStream** with `latest`, `test` and `prod` tag each and used for hosting the **mariadb**, **api** and **www** build image coresponding to both stages
- **2 Secret** `mariadb-test` and `mariadb-prod` holding `COUCHBASE_USER` and `COUCHBASE_PASSWORD` credentials
- **6 BuildConfig** describing how to build the **mariadb**, **api** and **www** images for both `test` and `prod` stage
- **6 DeploymentConfig** describing how to deploy and run the **mariadb**, **api** and **www** components for both `test` and `prod` stage
- **2 Service** to expose **mariadb** to other pods (created by the deploymentConfig) for both `test` and `prod` stage
- **4 Service** to expose **api** and **www** internaly and linked to route objects for both `test` and `prod` stage
- **4 Route** to expose **api** and **www** externaly for both `test` and `prod` stage

You can create and use this template running the following command. You can only run it one time per project. 
This template create both stage resources into the same project (shared namespace) for demo simplification. In production,
we would prefer create one project per stage in order to isolate environments and flexibility in managing hardware resources, 
users, network and node allocation.

```bash
oc new-project demo
oc process -f https://raw.githubusercontent.com/startxfr/sxapi-demo-openshift-couchbase/test/openshift-pipeline-all-ephemeral.json \
           -v DEMO_API=demo.openshift.demo.startx.fr \
           -v COUCHBASE_USER="Administrator" \
           -v COUCHBASE_PASSWORD="Administrator123" \
           -v COUCHBASE_BUCKET="demo" | \
oc apply -f -
sleep 5
oc get all
```

## Openshift pipeline workflows

### Jenkins CI/CD workflow

```
.--------------.    .--------------.    .---------------.    .--------------.    .---------------.
| Build (test) |    | Build (prod) |    | Deploy (test) |    |   Approve    |    | Deploy (prod) |
|--------------|    |--------------|    |---------------|    |--------------|    |---------------|
| 1 db image   |--->| 1 db image   |--->| 1 db pod      |--->| manual       |--->| 1 db pod      |
| 1 api image  |    | 1 api image  |    | 1 api pod     |    |              |    | 2 api pod     |
| 1 www image  |    | 1 www image  |    | 1 www pod     |    |              |    | 2 www pod     |
'--------------'    '--------------'    '---------------'    '--------------'    '---------------'
```

### Build test application workflow

```
 .--------------------------------.
 |          Source code           |            .--------------.         .-------------------.
 |--------------------------------|----------->| BuildConfig  |         |     API image     |
 | sxapi-demo...chbase:test www/  |    .------>|--------------|-------->|-------------------|
 '--------------------------------'    |       | www-test     |         | demo-www:test     |
               .------------------.    |       '--------------'         '-------------------'
               |  Builder image   |    |
               |------------------|----'
               | startx/sv-nodejs |    |
               '------------------'    |       .--------------.         .-------------------.
 .--------------------------------.    |       | BuildConfig  |         |     API image     |
 |          Source code           |    '------>|--------------|-------->|-------------------|
 |--------------------------------|----------->| api-test     |         | demo-api:test     |
 | sxapi-demo...chbase:test api/  |            '--------------'         '-------------------'
 '--------------------------------'
              .-------------------.
              |   Builder image   |            .--------------.         .-------------------.
              |-------------------|----------->| BuildConfig  |         |     API image     |
              | startx/sv-mariadb |    .------>|--------------|-------->|-------------------|
              '-------------------'    |       | mariadb-test |         | demo-mariadb:test |
 .--------------------------------.    |       '--------------'         '-------------------'
 |          Source code           |    |
 |--------------------------------|    |
 | sxapi-demo...chbase:test db/   |----'
 '--------------------------------'
```


### Build production application workflow

```
 .--------------------------------.
 |          Source code           |            .--------------.         .-------------------.
 |--------------------------------|----------->| BuildConfig  |         |     API image     |
 | sxapi-demo...chbase:prod www/  |    .------>|--------------|-------->|-------------------|
 '--------------------------------'    |       | www-prod     |         | demo-www:prod     |
               .------------------.    |       '--------------'         '-------------------'
               |  Builder image   |    |
               |------------------|----'
               | startx/sv-nodejs |    |
               '------------------'    |       .--------------.         .-------------------.
 .--------------------------------.    |       | BuildConfig  |         |     API image     |
 |          Source code           |    '------>|--------------|-------->|-------------------|
 |--------------------------------|----------->| api-prod     |         | demo-api:prod     |
 | sxapi-demo...chbase:prod api/  |            '--------------'         '-------------------'
 '--------------------------------'
              .-------------------.
              |   Builder image   |            .--------------.         .-------------------.
              |-------------------|----------->| BuildConfig  |         |     API image     |
              | startx/sv-mariadb |    .------>|--------------|-------->|-------------------|
              '-------------------'    |       | mariadb-prod |         | demo-mariadb:prod |
 .--------------------------------.    |       '--------------'         '-------------------'
 |          Source code           |    |
 |--------------------------------|    |
 | sxapi-demo...chbase:prod db/   |----'
 '--------------------------------'
```

### Deployement test application workflow

```
 .-----------------.   .-----------------.    .--------------.     .--------------.      .----------.
 |    API image    |   |  DeployConfig   |    |     Pod      |     |   Service    |      |  Route   |
 |-----------------|-->|-----------------|----|--------------|-----|--------------|----->|----------|
 | demo-www:test   |   | www-test        |    | www-test     |     | www-test     |      | www-test |
 '-----------------'   '-----------------'    '--------------'     '--------------'      '----------'
                                                                                             \
                                                                                              v
 .-----------------.   .-----------------.    .--------------.     .--------------.        .-,(  ),-.    
 |    API image    |   |  DeployConfig   |    |     Pod      |     |   Service    |     .-(          )-. 
 |-----------------|-->|-----------------|--->|--------------|<----|--------------|    (    internet    )
 | demo-db:test    |   | mariadb-test    |    | mariadb-test |     | mariadb-test |     '-(          ).-'
 '-----------------'   '-----------------'    '--------------'     '--------------'         '-.( ).-'    
                                                                           |                  ^
                                                                           v                 /
 .-----------------.   .-----------------.    .--------------.     .--------------.      .----------.
 |    API image    |   |  DeployConfig   |    |     Pod      |     |   Service    |      |  Route   |
 |-----------------|-->|-----------------|----|--------------|-----|--------------|----->|----------|
 | demo-api:test   |   | api-test        |    | api-test     |     | api-test     |      | api-test |
 '-----------------'   '-----------------'    '--------------'     '--------------'      '----------'
```

### Deployement production application workflow

```
                                                .----------.
                                                |   Pod    |
                                             .->|----------|<-.
 .-----------------.   .-----------------.   |  | www-prod |  |    .--------------.      .----------.
 |    API image    |   |  DeployConfig   |   |  '----------'  |    |   Service    |      |  Route   |
 |-----------------|-->|-----------------|---.  .----------.  .----|--------------|----->|----------|
 | demo-www:prod   |   | www-prod        |   |  |   Pod    |  |    | www-prod     |      | www-prod |
 '-----------------'   '-----------------'   '->|----------|<-'    '--------------'      '----------'
                                                | www-prod |                                    |
                                                '----------'                                    |
                                                                                                v
 .-----------------.   .-----------------.    .--------------.     .--------------.          .-,(  ),-.    
 |    API image    |   |  DeployConfig   |    |     Pod      |     |   Service    |       .-(          )-. 
 |-----------------|-->|-----------------|--->|--------------|<----|--------------|      (    internet    )
 | demo-db:prod    |   | mariadb-prod    |    | mariadb-prod |     | mariadb-prod |       '-(          ).-'
 '-----------------'   '-----------------'    '--------------'     '--------------'           '-.( ).-'    
                                                                           |                    ^
                                                .----------.               |                    |
                                                |   Pod    |               v                    |
                                             .->|----------|<-.    .--------------.      .----------.
 .-----------------.   .-----------------.   |  | api-prod |  |    |   Service    |      |  Route   |
 |    API image    |   |  DeployConfig   |   |  '----------'  .----|--------------|----->|----------|
 |-----------------|-->|-----------------|---.  .----------.  |    | api-prod     |      | api-prod |
 | demo-api:prod   |   | api-prod        |   |  |   Pod    |  |    '--------------'      '----------'
 '-----------------'   '-----------------'   '->|----------|<-'
                                                | api-prod |
                                                '----------'
```




### Access your application in your browser

Access your application using your browser on `https://api.openshift.demo.startx.fr`


## Troubleshooting, contribute & credits

If you run into difficulties installing or running this demo [create an issue](https://github.com/startxfr/sxapi-demo-openshift-couchbase/issues/new).

You will information on [how to contribute](https://github.com/startxfr/sxapi-demo-openshift-couchbase#contributing) or 
[technologies credits](https://github.com/startxfr/sxapi-demo-openshift-couchbase#built-with) and
[demo authors](https://github.com/startxfr/sxapi-demo-openshift-couchbase#authors) on the 
[sxapi-demo-openshift-couchbase homepage](https://github.com/startxfr/sxapi-demo-openshift-couchbase).
Usefull informations regarding the couchbase deployement could be found on the [couchbase-operator documentation](http://docs.couchbase.com/prerelease/couchbase-operator/beta/couchbaseClusterConfig.html)
