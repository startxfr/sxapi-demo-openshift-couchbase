# Deploy demo application using Openshift build config

This section of the [sxapi-demo-openshift-couchbase](https://github.com/startxfr/sxapi-demo-openshift-couchbase)
will show you how to run the sxapi-demo application stack only using openshift commands.

To run this demo, you must have have a demo environement setup configured. Follow guidelines 
to configure the [workstation environement](https://github.com/startxfr/sxapi-demo-openshift#setup-workstation-environement)
and [openshift environement](https://github.com/startxfr/sxapi-demo-openshift#setup-openshift-environement).


## Openshift template

### Pre-requirements

The Couchbase Operator needs some special permissions in order to interact with the Kubernetes master. 
These permissions need to be set for each project using the Couchbase Operator. 

```bash
# Need cluster admin access
oc login -u system:admin
# Create and/or connect to the demo project
# oc new-project <project>
oc new-project demo
# Create a cluster-admin user for your project (enable kubernetes dialog and CRD events)
# oc adm policy add-cluster-role-to-user cluster-admin -z <user_name> -n <project>
oc adm policy add-cluster-role-to-user cluster-admin -z default -n demo
# add security context for this user (start as root)
# oc adm policy add-scc-to-user anyuid system:serviceaccount:<project>:<user_name>
oc adm policy add-scc-to-user anyuid system:serviceaccount:demo:default
```

For full explanation on security constrains, read [couchbase - Openshift RBAC documentation](http://docs.couchbase.com/prerelease/couchbase-operator/beta/rbacOpenshift.html)


### Full template

This demo provide an [all-in-one build template](https://raw.githubusercontent.com/startxfr/sxapi-demo-openshift-couchbase/master/openshift-build-all-ephemeral.json)
to build and deploy the full application stack using build config and deployement config for every services
part of this example.

This template will create the following objects :
- **1 ImageStream** with 2 tags linked to public bases images `startx/sv-couchbase` and `startx/sv-nodejs`
- **3 ImageStream** with 1 `latest` tag each and used for hosting the **couchbase**, **api** and **www** build image
- **1 Secret** couchbase holding `COUCHBASE_SERVICE_HOST`, `COUCHBASE_USER` and `COUCHBASE_PASSWORD` credentials
- **3 BuildConfig** describing how to build the **couchbase**, **api** and **www** images
- **3 DeploymentConfig** describing how to deploy and run the **couchbase**, **api** and **www** components
- **1 Service** to expose **couchbase** to other pods (created by the deploymentConfig)
- **2 Service** to expose **api** and **www** internaly and linked to route objects
- **2 Route** to expose **api** and **www** externaly

You can create and use this template running the following command. You can only run it one time per project with an 
identical SOURCE_BRANCH. Because Source branch corespond to different stage of the application, you can choose 
to deploy various stage with the same project (shared namespace) or in differents projects (isolated namespace).

```bash
oc new-project demo-api
oc process -f https://raw.githubusercontent.com/startxfr/sxapi-demo-openshift-couchbase/master/openshift-build-all-ephemeral.json \
           -v SOURCE_BRANCH=prod \
           -v DEMO_API=api-prod-demo.openshift.demo.startx.fr \
           -v COUCHBASE_USER="Administrator" \
           -v COUCHBASE_PASSWORD="Administrator123" \
           -v COUCHBASE_BUCKET="demo" | \
oc create -f -
sleep 5
oc get all
```

## Openshift build and deploy strategy workflow

```
                                                               .----------.
                                                               |   Pod    |
                                                             .>|----------|<.
          .--------------------------.   .-----------------. | | demo-api | | .----------.
          |       Source code        |   |  DeployConfig   | | '----------' | | Service  |
          |--------------------------|   |-----------------|-. .----------. .------------|
          | sxapi-demo...chbase/www  |   | demo-www        | | |   Pod    | | | demo-www |
          '--------------------------'   '-----------------' '>|----------|<' '----------'
                              |                   ^            | demo-api |      /
                              v                   |            '----------'     /
                       .-------------.   .-----------------.        .----------v
                       | BuildConfig |   |    API image    |        |  Route   |
                       |-------------|-->|-----------------|        |----------|
                       | demo-www    |   | demo-www:latest |        | demo-www |
                       ^-------------'   '-----------------'        '----------\
   .------------------/                                                         v .-,(  ),-.    
   |  Builder image   |                                                        .-(          )-. 
   |------------------|                                                       (    internet    )
   | startx/sv-nodejs |                                                        '-(          ).-'
   '------------------\                                                         ^  '-.( ).-'    
                       v-------------.   .-----------------.        .----------/
                       | BuildConfig |   |    API image    |        |  Route   |
                       |-------------|-->|-----------------|        |----------|
                       | demo-api    |   | demo-api:latest |        | demo-api |
                       '-------------'   '-----------------'        '----------^
                              ^                   |                             \
                              |                   |            .----------.      \
                              |                   |            |   Pod    |       \
                              |                   v          .>|----------|<.  .----------.
          .--------------------------.   .-----------------. | | demo-api | |  | Service  |
          |       Source code        |   |  DeployConfig   | | '----------' .--|----------|
          |--------------------------|   |-----------------|-. .----------. |  | demo-api |
          | sxapi-demo...chbase/api  |   | demo-api        | | |   Pod    | |  '----------'
          '--------------------------'   '-----------------' '>|----------|<'
                                                               | demo-api |
                                                               '----------'
                                                                     ^
                                                                     |
.-------------------.  .-------------.   .-----------------.   .----------.
|   Builder image   |  | BuildConfig |   |    API image    |   | Service  |
|-------------------|->|-------------|-->|-----------------|   |----------|
| startx/couchbase  |  | demo-api    |   | demo-api:latest |   | demo-api |
'-------------------'  '-------------'   '-----------------'   '----------'
                              ^                   |                  |
                              |                   v                  v
          .--------------------------.   .-----------------.   .----------.
          |       Source code        |   |  DeployConfig   |   |   Pod    |
          |--------------------------|   |-----------------|-->|----------|
          | sxapi-demo...chbase/api  |   | demo-api        |   | demo-api |
          '--------------------------'   '-----------------'   '----------'
```

### Access your application in your browser

Access your application using your browser on `https://api.openshift.demo.startx.fr`


## Troubleshooting, contribute & credits

If you run into difficulties installing or running this demo [create an issue](https://github.com/startxfr/sxapi-demo-openshift-couchbase/issues/new).

You will information on [how to contribute](https://github.com/startxfr/sxapi-demo-openshift-couchbase#contributing) or 
[technologies credits](https://github.com/startxfr/sxapi-demo-openshift-couchbase#built-with) and
[demo authors](https://github.com/startxfr/sxapi-demo-openshift-couchbase#authors) on the 
[sxapi-demo-openshift-couchbase homepage](https://github.com/startxfr/sxapi-demo-openshift-couchbase).