# Learn Docker - DevOps with Node.js & Express 5:20:xx hours

Learn the core fundamentals of Docker by building a Node/Express app with a Mongo & Redis database.

1. We'll start off by keeping things simple with a single container, and gradually add more complexity to our app by integrating a Mongo container, and then finally adding in a redis database for authentication.

2. We'll learn how to do things manually with the cli, then move on to docker compose. We'll focus on the challenges of moving from a development environment to a production environment.

3. We'll deploy and Ubuntu VM as our production server, and utilize a container orchestrator like docker swarm to handle rolling updates.

✏️ Course developed by Sanjeev Thiyagarajan. Check out his channel:

 / @sanjeevthiyagarajan  

⭐️ Course Contents ⭐️

* 0:00:14 Intro & demo express app
* 0:04:18 Custom Images with Dockerfile
* 0:10:34 Docker image layers & caching
* 0:20:26 Docker networking opening ports
* 0:26:36 Dockerignore file
* 0:31:46 Syncing source code with bind mounts
* 0:45:30 Anonymous Volumes hack
* 0:51:58 Read-Only Bind Mounts
* 0:54:58 Environment variables
* 0:59:16 loading environment variables from file
* 1:01:31 Deleting stale volumes
* 1:04:01 Docker Compose
* 1:21:36 Development vs Production configs

Part 02: Working with multiple containers

* 1:44:47 Adding a Mongo Container
* 2:01:48 Communicating between containers
* 2:12:00 Express Config file
* 2:21:45 Container bootup order
* 2:32:26 Building a CRUD application
* 2:51:27 Sign up and Login
* 3:06:57 Authentication with sessions & Redis
* 3:34:36 Architecture Review
* 3:40:48 Nginx for Load balancing to multiple node containers
* 3:54:33 Express CORS

Part 03: Moving to Prod

* 3:57:44 Installing docker on Ubuntu(Digital Ocean)
* 4:03:21 Setup Git
* 4:05:37 Environment Variables on Ubuntu
* 4:14:12 Deploying app to production server
* 4:18:57 Pushing changes the hard way
* 4:25:58 Rebuilding Containers
* 4:27:32 Dev to Prod workflow review
* 4:30:50 Improved Dockerhub workflow
* 4:46:10 Automating with watchtower
* 4:56:06 Why we need an orchestrator
* 5:03:32 Docker Swarm
* 5:16:13 Pushing changes to Swarm stack

## practical content:-

npm init with express, to make a simple express app! don't forget the path
after setting a dump express project, that only returns a simple response, we should have docker installed in our local machine, and then go to their hub for public [images:](https://hub.docker.com/_/node) access node image

node isn't all we need, docker stands for setting everything needed together and containerize it with isolation and portability advantages!

So, we need to put our src code in the image, and dependencies as express.

> we gotta create our own custom image, and base it off of existing node image from docker ☝️

and that container that has all above issues, will be the image to run our application

To create our own custom image, we need to create a `dockerfile` which is a set of instructions to create our customized image. `Dockerfile` should start with a capital D

* first command is always to specify a base image, that can come from docker hub, or any other docker repository.
* in this project, we'll only need node, to specify it, check its image -> `Image Variants` it says: `node:<version>`, e.g: `FROM node:15`
* next command is optional but still recommended, which is to set our working directory, **anytime you run a command it'll be from this directory**.
* then we'll copy our package.json file path into Dockerfile, same as linux but use COPY instead of cp, and slash is optional `./`; and we're also able to use `/app` for same reason.
* then we run these dependencies with `RUN npm install`
* then we'll need to copy the rest of our files with current DIR. to current path 😅. will it not copy all so no need to first copy? mentor: it does, but used are optimization technic. connected to how docker images are working: docker takes each step in its file as a layer of the image! **they're built on top of each other** it'll cache each result until it finishes. so, if we rebuild same image, it'll use cached results and return it faster than initial time.

Because first two layers are never gonna change, we will be rerunning steps/layers starting from 3th one, as we add dependencies.

And in minor periods of time, we'll only be rerunning last step.

Then because our port isn't gonna change we'll expose it with 3000.

> knowing linux makes it as a piece of 🍥

Then we need to tell what command to run, with node, it's obviously `node index.js | npm start` as: `["node", "index.js"]`

```docker
FROM node:15
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
EXPOSE 3000
CMD ["node", "index.js"]
```

To run docker image, in terminal we use:

```sh
docker build .
# after build, <path_to_dockerfile> called: context
```

Look at the steps 1/5, and how each step is processing, if you're running after 1st time, 2-4 are gonna be CACHED
to the list of images, we command: `docker image ls`

our image has no name nor a tags.
Deleting images together is with `rmi imageName or_id`; another approach -mentor's one- is: `docker image rm id_as_bfe296a5`

Now, we're gonna pass some new flags with our docker build command; `-t name_as_node-app-image` -> title, view: `docker build -t node-app-image .`

let's run that new image with:

```sh
docker run -d --name node-app node-app-image
```

* without the currentFile `./`.
* `-d` -> detached mode, to detach of CLI the console. to not paralyze with the process, and when running npm start!
* `--name node-app` is to give other docker container a name
* to see running containers use: `docker ps`.

Test it out with prior url address! `localhost:3000` it'll not work, because we didn't set the path of: urlBar:docker.
So, **expose does nothing**, it's only for letting process to proceed, it's for documentation purpose, so docker containers defaults to access to outside world internet, but they're not able to access it.

To let outside world **localhost included** we use:

```sh
# initially we'll kill out container, while it's running by using -f -> force, flag
docker rm node-app -f
# now, run prior cmd to containize node-app but add this flag
# -p 3000:3000 which is to set port localhost:dockerContainerPort
# we can put outer protocols instead of localhost as when setting DNS conf.
docker run -p 3000:3000 -d --name node-app node-app-image
# now using docker ps, will appear port with tcp protocol
```

So, `0.0.0.0:3000->3000/tcp` means, any traffic destinat from from this machine on port 3000 goes to 3000 in docker container will access this port

To log to our container we use:

```sh
docker exec -it node-app bash
# -it => interactive mode
#  node-app => our container name
# we use bash to access the file of that container
```

After we accessed that container and checked the list of files, we see that Dockerfile exists there. that's because we used `COPY . ./` as a 5th layer in Dockerfile.

> ⚠️🔴we don't want Dockerfile to be inside of the container itself!🔴⚠️ neither any secret files as **environment files** containing secrets, nor node_modules.

And we alternately wanna move away from developing on our local machine!

So, we'll create a **.dockerignore** file, use `exit` to get out of docker image file system

```sh
# we'll kill it
docker rm node-app -f
# after creating that file, we'll add node_modules, Dockerfile, .dockerignore, .gitignore
#! we don't use forward slash with dirs, different syntax than git
# and any files we don't want to be in the image!

# rebuild it
docker build -t node-app-image .
# run it
docker run -p 3000:3000 -d --name node-app node-app-image
# access its -it
docker exec -it node-app bash
# list inside it.

# the node_modules existing in the image, is because of npm install, not the ignored one!
```

As I tried, if I change the code directly, nothing will happen, we need to kill the image and rebuild it, doing same steps ☝️ at: 163 line, this is the reason!

* You're changing the local code, not in docker!
* You built that node-app image, and built a container from it. but the image was run before making the changes

> mentor said, we deploy the image, when running it!

to change data in containers we'll use volumes, specifically: `bind mounts` to sink files locally to docker container `/app`!

* remove the container:
* then deploy it with an extra flag `-v <whole_path_locally>:<path_on_container>` => volume, its place doesn't matter:

```sh
docker rm node-app -f

# docker run -v /e/coding_and_programming/docker/docker_course_freecodecamp/:/app -p 3000:3000 -d --name node-app node-app-image
# that's crazy, we can use variables
# in windows cmd not powershell😅, we can use: `%cd%`
#  in powershell use: ${pwd}
#  in shell use: $(pwd)
# docker run -v %cd%:/app -p 3000:3000 -d --name node-app node-app-image
docker run -v $(pwd):/app -p 3001:3000 -d --name node-app node-app-image # I lost half a day for 3000 error, wow, any barely evade it, with 3001, not fix it🤣
```

Files in docker will be change in docker container,check with `docker exec -it node-app bash`, but we should restart the express app. `in my machine changes didn't even appear in docker file😅`
simply mentor uses nodemon as dev dependency, so in the local, he uses: `npm i nodemon --save-dev`, and adds dev in scripts as known, but if you find issues in windows you can use the `-L` flag in dev key as: `"dev": "nodemon -L index.js"`
then we kill the container, we check running image name with ps, then `docker rm node-app -f`, then in Dockerfile we put run dev instead of node as: `CMD ["npm", "run", "dev"]`, then we rebuild the image: `docker build -t node-app-image .`, then we redeploy with the long run line: `docker run -v $(pwd):/app -p 3001:3000 -d --name node-app node-app-image`, then it'll automatically do nodemon job.
⚠️I'm compiled to cmd instead of bash in my stupid windows as:⚠️ `docker run -v %cd%:/app -p 3001:3000 -d --name node-app node-app-image`⚠️, why stupid, because it takes around 5s to apply changes.

---

Now, remove the container using: rm with -f, then delete local node modules for this project, it's needless, then redeploy the container with above long command

What'll happens after we refresh the page!

* The container stops immediately!
* lack of node_modules locally made it vanish in the container

Use **docker ps -a** for appearing non-running containers.
To see logs use **docker logs**.

the -v => bind mount sinks local DIR with `/app`, and that's the issue! ⚠️ causing to delete container's node modules, by overriding local DIR

How to prevent local DIR from overriding `/` DIR, and deleting node DIR

* we'll create a new volume => **`1`**

Volumes work based on specificity

So, delete the broken container, then add the new `anonymous volume`, check this new code:

```sh
docker rm node-app -f
docker run -v %cd%:/app -v /app/node_modules -p 3001:3000 -d --name node-app node-app-image
# so we added the little hack volume with: -v /app/node_modules
# and this is like saying: DOCKER, DON'T TOUCH THIS DIR YO 🥸😎
```

> the 6 delayed seconds, are gone now, and changing files will be impacted nearly immediately

Do we need the 5th command: `COPY . ./` in Dockerfile, while having bind mount, **YES**, bind mount is only for developing process, for production we'll not use that bind mount

now, drop into(access) bash, with `docker exec -it node-app bash`, to know:👇

> changing files in the container will cause changing them locally while bind mount is enabled⚠️

So, we need to make that bind mount read-only. so re-kill it then add this `:ro` to first `-v` container's path as:

```sh
docker run -v %cd%:/app:ro -v /app/node_modules -p 3001:3000 -d --name node-app node-app-image
# ro => read-only
# that'll prevent creating files, even in the container itself
```

---

How to use the env var within docker containers?

* in Dockerfile before CMD, add `ENV` -> environment variable. then `PORT`
* then in an new layer set the expose as `EXPOSE $PORT` as:

```docker
FROM node:15
WORKDIR /app
COPY package.json .
RUN npm install
COPY . ./
ENV PORT 3000
EXPOSE $PORT
CMD ["npm", "run", "dev"]
```

so, we'll re-kill the container, then rebuild the image, because of modifying the src files,

```sh
docker rm node-app -f
docker build -t node-app-image .
```

then we'll deploy the container with adding env var in the run command itself **(in cmd)** as:

```cmd
docker run -v %cd%:/app:ro -v /app/node_modules -e PORT=4000 -p 3001:4000 -d --name node-app node-app-image
<!-- **--env  or -e ARE SAME** -->
```

Notice, the changing of port in container after changing it with env var.

after dropping into that project, to see the `.env` we kit: `printenv` as a normal linux

We can repeat the `--env` for creating many variables, but there's a better approach, which is by creating a `.env` file in local machine. we can call that file with any other name since we're gonna call it when deploying!

now, we use this powershell for deploying:

```powershell
docker rm node-app -f
docker run -v ${pwd}:/app:ro -v /app/node_modules --env-file ./.env -p 3001:4000 -d --name node-app node-app-image
# so we added the --env-file <file_path> instead of using -e VAR=s -e VAR2=B
# it's good to log into that container and using printenv
docker exec -it node-app bash
```

To see the messy volumes we created use:

```docker
docker volume ls
```

Our anonymous volume : `-v /app/node_modules` causes the duplication of volumes, it preserve the project in the volumes each time we delete the container!


We don't need to preserve that!
we can delete specific volumes with: `docker volume rm <volume_name>`, or We can use this command `docker volume prune` to delete unnecessary volumes, using `docker rm node-app -f` will not delete associated volumes with that container.

⚠️When Having SQL DBs we should be careful, deleting volumes might cause lose of DB records😲⚠️

> To delete volumes associated with a container we add the `v` flag as: **docker rm node-app -fv**, in our case, there ain't DBs connected with it, so that's safe.

To not re-run the container every single time, although better than using the up arrow,and because we'll be using more than one container, especially when working with `DBs`, an `elasticsearch`, or for `redis`, and each one needs a long command; we can automate these steps with `docker compose`, which is to set many deploying commands together as a file as:

```sh
touch docker-compose.yml
# so that file should have yaml extension
```

inside the yaml file, we specify the docker compose version, to see all versions check [documentation at:](https://docs.docker.com/compose/compose-file/compose-versioning/), although we're gonna use v3, in the file, use:

```yml
version: "3"
# each container here refer to as a service
# spacing matters here, as python, use tap after : 👇
services:
  node-app:
    build: .
    ports:
      - "3000:3000"
      - "3001:4000"
    volumes:
      - ./:/app
      - /app/node_modules
    environment:
      - PORT=3000
    env_file:
      - ./.env
  postgres:
  redis:
# we can call our containers with anything, so we created the app, then set the configurations underneath it[build settings with current DIR -> dockerfile]. as with node-app
# up there, I used multiple containers
# we do need to expose ports, yes we can set many ports, not only one.
# so dash signifies a list
# with this file, we use: `.` instead of prior bind mount %cd% or long path!
# we can provide a list of files with env_file, and a list of vars with environment
```

I created a cleaner file, and ☝️ is for demonstration purpose

> to invoke created **docker-compose.yml** file, use

```sh
docker-compose up -d
# make sure you added dash in between, -d for detach, you can use --help after up
# that's lovelier even with testing, cause it shows this green check after composing: ✔ in terminal

# make sure prior image and its containers are deleted to be able to re-build the new image
# I think we should dockerignore that compose file now!
```

Now, its name comes from DIRname-serviceName as `docker_course_freecodecamp-node-app`, service name was set in that compose.yml file
Even the name of container was connected to `DIR/project` file + `_` + `serviceName` + `_` + `1`

Numbers as that one are when splitting out services, bring it down or tear everything down, is as easy as bringing it up.

> Use **docker-compose down** to tear it down, and as prior volumes, they're not gonna vanish in its defaults, so re-use **-v**, as: **docker-compose down -v**

When tearing down with docker-compose it creates brand new network

Running `docker-compose up -d`  was building the image and deploying containers, will it do that again?
No, it skips building the image and its all job was to create the network! That's because docker-compose looks for the image based on set syntax: `projectDIR_serviceName`, if exists, it won't rebuild it.

Even when changing ports in Dockerfile, meaning: when changing the image data, so docker-compose is pretty dump! it is a stale image.
⚠️You have to tell docker-compose⚠️ that you rebuild the image!

check **docker-compose up --help**, you should find forcing it to build, which is **--build**, so use:

```sh
docker-compose up -d --build
# tear it down for tutorial purposes
docker-compose down -v
# rebuild it again.
```

These are the important and basic concepts with docker-compose, check the docs as in upper link, to do more advanced

### Development vs Production configs

creating bind mounts in docker-compose will never be using in production => volumes in file.yml
and we might use different port, that the project lists on. especially when working with envs as heroku yml one, that keeps changing all time.

And it will run npm start with production, so the solution is by setting **separate docker-compose** for each.

> we can easily create many dockerfiles, there's not any rule against it!

In out case, the only layer that changes is the CMD one, which is the last one!
some people prefer using pure node production.js file for production!

**So, we can create different docker-compose files as well as dockerfiles**, and we can put both in one file as well.

we made prior docker-compose.yml as `docker-compose.backup.yml` for not removing it, and created a new `docker-compose.yml` one, then we'll create two similar files on top of that. check the ls, `prod` and `dev` sub ext

Now, check difference between each one, because we're not gonna repeat same commands in often.

we can override what's written in Dockerfile, with docker-compose files

Now, after setting those three separate files, how to run each to its environment? that's by using base(docker-compose.yml + dev => dev || + prod => prod)

#### do this for dev version

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# -f => file, order matters here

# then check with docker ps
# this docker-compose cleaning and setting professionally, fixed the prior bug with 3000 port

# to shut it down, we use same prior down -v instead of up -d
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

#### do this for prod version

```sh
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
# only by changing .dev. to .prod.
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
# notice, that with this, each change needs to rebuild the image, because of not using bind mount, as making 1st command has --build, see:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Notice, when we accessed the container's bash with:

```sh
# beside container <container_new_name> as docker_course_freecodecamp-node-app-1 you can get it with docker ps though
docker exec -it docker_course_freecodecamp-node-app-1 bash
```

We'll notice that we didn't add new docker-compose files into dockerignore file, by using regExp pattern: `docker-compose*` it'll ignore any file starts with that name.

Accessing node_modules there will appear all dependencies, including ⚠️nodemon⚠️, and same in package.json why is that an issue🤔

🔴Because this is the production mode, not development one🔴

Solution: we add this flag into dockerfile: `--only=production` beside RUN, and we need to make within an embedded bash script, if [[ CONDITION ]]; then \n fi as:

```sh
# above RUN, add this argument, that we need to set it in docker-compose file:
ARG NODE_ENV
# replace prior RUN with
RUN if [ "$NODE_ENV" = "development" ]; \
          then npm install; \
          else npm install --only=production; \
          fi
# that backslash is different that bash, and only one bracket why🤔
```

In dev and in prod composes we'll change the build: into this:

```yml
build:
  context: .
  args:
    NODE_ENV: development
# context is the path
# under the name of container!

# in production, change that NODE_ENV to
args:
    NODE_ENV: production
```

let's teat it apart, then rebuild it with prior commands!
It's appearing in package but it's not installed in node_modules, with prod, which is good, but not the best!

and using `printenv` will appear what NODE_ENV value is!

## Part 02: Working with multiple containers

Adding mongoDB and making the image to have many containers will make our app more of a real world type application with preserve data.

> check its [docks page](https://hub.docker.com/_/mongo)!

in the **How to use this image** the example: **docker run --name some-mongo -d mongo:tag** the name of the image in it is mongo, :tag -> version

In our docker-compose.yml file, we add it as:

```yml
# exactly as we did with node-app, and the postgres redis examples
# we can call it anything, I prefer calling it model, but mentor calls it mongo
mongo:
  image: mongo
  environment:
    - MONGO_INITDB_ROOT_USERNAME=anyNameYouProvide
    - MONGO_INITDB_ROOT_PASSWORD=myPassword
  # in mongo, we don't need to customize the build, so it's different than node, so we put image: mongo instead of build:
  # and as we were interacting with mongo in prior express projects, we need to environment variables for MONGO_URIs
  # in that docks page, check their section!
  # here they are: MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD
```

After saving these in docker-compose, pick dev deploying up option.

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
# why --build, because I tried not to, and because we were using prod,⚠️ the whole project was crashed, running nodemon while it isn't installed⚠️
# 🔴 when docker ps, it should return two containers 🔴
# access the docker exec -it <mongoName> bash
# then we can send mongo crud within mongo container, before using it with express app.
docker exec -it docker_course_freecodecamp-mongo-1 bash
```

⚠️in my old hardware workstation, that is strong but doesn't support tended `AVX`, I was compiled to not use 5+ versions of mongo, it causes crashing the containers, so I used: `image: mongo:4.4` in docker-compose instead.⚠️

Do the following in mongo container, after accessing it as above steps tutor:

```sh
# ⚠️ no need to atlas yo, you're the host server, don't make the server cries🥸, underestimating its powers💪💪, this saves a lot of money, but dare to make a mistake, 💵💵💵💵 will be owed to clouds 😂👹👻
mongo -u "Bader" -p "myPassword" # that makes you access the database. login in mongo instance!

# although we can easily use mongo --help as other bashes, view Authentication Options
# to get what's similar to (psql -t -c) flags that sends one req then stops with message, in mongo check (--eval) flag
```


* `db` command shows connected database, it appears test which is a default one, as template0 in psql
* `use newDB` command creates and connect to the new database!
* `show dbs` lists databases, same as `\l` with pg, but our mynewDB isn't listed, because it **needs to have an entry/document within that DB**
* syntax: db.collectionName.insert({"documentName": "howdy yo"})
* to call it use queries you learned months ago `find({...})`
* after creating our mongoDB syntax, using show dbs will appear the new one, it has values!

```sh
db
use myNewDB
show dbs

db.books.insert({"name": "harry potter"})
db.books.find()
# he picks all by not using Obj carly {}
show dbs
```

**save this:**

```nano
|     MongoDB     |     SQL       |
|-----------------|---------------|
|   Database      |   Database    |
|   Collection    |   Table       |
|   Document      |   Row/Record  |
```

Exit the db, then the container. instead of using bash, we can access our user directly, similar to sql as:

```sh
docker exec -it docker_course_freecodecamp-mongo-1 mongo -u "Bader" -p "myPassword"
```

with tearing down our container, all DBs will vanish! redeploy it, so, container's lost its database.

To preserve our DBs, in both dev and prod, we use **VOLUMES YO, VOLUMES**, as we did with dev => node_modules; anonymous volumes

But mentor doesn't prefer using application DBs with anonymous volumes, he prefers using a named volume, set manually as variables.

add these into docker-compose.yml to add the named volume

```yml
# under mongo env variables, as same rhythm to environment add:
volumes:
  - mongo-db:/data/db
# to know what data is that set to volumes, go to docks => where to store data#section
# this is there volume code -v /my/own/datadir:/data/db
# myDirName/any/sub/DIR:after/me_data

:'
so, in dev,
volumes:
  bind_mounts
  anonymous_volume
and the new named volume is as with 
mongo:
  volumes:
      - mongo-db:/data/db
'
```

> 🔴👻But there is another gotcha👻🔴

when trying to deploy the docker-compose, mongo will send an error:

```sh
Named volume "mongo-db:/data/db:rw" is used in service "mongo" but no declaration was found in the volumes section.
ERROR:
```

We need to declare that named volume in another portion of our docker-compose file which can be used with multiple services, so **if we had another mongo instance other mongo service that can attach to it**

In docker-compose.yml add these at the bottom of it:

```yml
volumes:
  mongo-db:
# its rhythm should be separate from services:
```

Now, do the docker-compose up command:

```sh
# if still running:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
# then
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# then let's connect into out mongo client
docker exec -it docker_course_freecodecamp-mongo-1 mongo -u "Bader" -p "myPassword"
# insert prior entry
# don't forget me yo
use myNewDB
db.books.insert({"name": "harry potter"})
# check its position, find()
db.books.find()
then exit
```

Then tear it down, WOW: another issue😂 we removed the added volume with `-v` flag, so, don't use it anymore when working with DBs

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
# ⚠️🔴without -v flag🔴⚠️
# check 'em out
docker volume ls
# now clean the rest of volumes, with prune, but start up the containers before to prevent deleting connected volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# you can get docker volume --help
docker volume prune
```

Reconnect to mongo container, then use: show dbs. the new db is there! use myNewDB ; then db.books.find() to check for the collection and its document/s

---

### connecting express with mongo two containers together ‼️

We'll be using mongoose, npm install mongoose, locally ‼️ remember? then tear the app down without -v, then redeploy it ‼️

we'll make a simple require('mongoose') and connect()

It asks for the url, and that url has host, which is the container's ip-address, to get it, check running ps, then use `docker inspect <containerName>` a lot of data, care about the bottom ones, `"NetworkSettings"` key is what we need, inside it `"Networks"`, then in the `<DIR_NAME_default>` go to the `"IPAddress"` key, above it is the default gateway; networks is the concept that connects containers together

Do the same with mongo container. mine are: **app** => `192.168.144.3`, **mongo** => `192.168.144.2`, paste the mongo's one into the app

🔴That's a headache picking it manually each time we tear down containers and redeploy them, it happened to me though🔴 ip changed

after we set the connect in index.js as 👇, because we're in dev docker-compose it should rapidly response with our message, **check the logs of the app**

```js
mongoose
  .connect('mongodb://Bader:myPassword@192.168.112.3:27017?authSource=admin')
  .then(() => console.log('successfully connected to DB'))
  .catch((e) => console.log(e + "oops 😂"))//that was sincerely tough
```

He's gonna fix the really **sloppy** way of working with these containers! FINALLY please! I agree🥵

There is a good feature docker provides for using custom networks that get created! firstly, we check network list with: `docker network ls`, then you'll find these two default ones:

```txt
NETWORK ID     NAME                                 DRIVER    SCOPE
520eaba59d7b   bridge                               bridge    local
49e0fafde1e5   host                                 host      local
```

And there's a one for our docker_default, when we create custom networks, we have DNS, so we can use the name of that container/service to talk to that container

So, back in our dockerfile, we can use the names of services, mongo and node-app to connect between each other

So, we can put `mongo` instead of the plain ip-address to mongoDB in node_app, **which is awesome**, see:

```js
// It was 'mongodb://Bader:myPassword@192.168.144.2:27017?authSource=admin'
'mongodb://Bader:myPassword@mongo:27017?authSource=admin'
```

Check the logs with its command, you can learn about that follow feature's flag with: `docker logs docker_course_freecodecamp-node-app-1 --help` it is `-f` put it in place of that help flag

So, to find mongo in the node-app, after accessing it with -it command, hit: `ping mongo`.

> Notice, that all this love doesn't work with the **default bridge network**

another way to pick a network ip is to check its name with `docker network ls` then to use: `docker inspect <thatName>` then check the: `"Subnet"` and underneath it: default`"gateway"`, and it appears all the containers it has.

### 2:12:00 Express Config file

We'll put DB URI sensitive data into .env file, so in projectDIR create both `config/config.js`, and its data will be:

```js
// uName, passwd, ip-address
module.exports = {
  MONGO_IP: process.env.MONGO_IP || "mongo", // this can be used with other hosting servers as AWS
  MONGO_PORT: process.env.MONGO_PORT || 27017,
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD
}
```

Then we connect them in DB url.

```js
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT } = require("./config/config")

// "mongodb://Bader:myPassword@mongo:27017?authSource=admin"
`mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}?authSource=admin`
// it's prefer putting the port that app listens to when running as those variables!

// we put values of uName and passwd into docker-compose-dev in node env after node_env. and with prior set with mongo in docker-compose
/*
environment:
  - MONGO_USER=Bader
  - MONGO_PASSWORD=myPassword
*/
```

Then we need to rebuild the containers:

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker logs docker_course_freecodecamp-node-app-1 -f
```

To clean up mongo warning messages, we start putting our url into a variable.

```js
const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?
  authSource=admin`
// then in connect(mongoURL, {
  // we set settings in here
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useFindAndModify: false // this option in 4.4.24 is deprecated and causes an error if put
})
```

Running with docker-compose as before, we were'nt able to know which container starts first, and if node before mongo, we'll ran into some issues!

So, we need to tell docker to load up the DB instance first, then when it's up and running to start the app. So, put these under node-app: before mongo: in docker-compose.yml

```yml
depends_on:
  - mongo
```

Now, repeat what's in :731, the three steps; now the message after running it up appears that mongo starts first:

```docker
Network docker_course_freecodecamp_default       Created       0.1s 
 ✔ Container docker_course_freecodecamp-mongo-1     Started       1.3s 
 ✔ Container docker_course_freecodecamp-node-app-1  Started       2.2s 
```

however, this does not still technically fix our issue!
it doesn't have check to verify that mongo is up and running
So, we do change the app itself as putting some logics with listening to its port

Mongo defaults to have 30 seconds of trying before crashing the app.
we'll use a simple idea of that, it's not the best or the best practice!

```js
const connectWithRetry = () => {
  mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false // i need to find another way to get rid of the messy logs
  })
  .then(() => console.log('successfully connected to DB'))
  .catch((e) => {
    console.log(e + '🥵')
    setTimeout(connectWithRetry, 5000)
    // so this makes it retry, it loops each 5 seconds until it connects
  })
}
connectWithRetry()
```

To test it out, stop the containers, then rerun it with this flag: `-d <nameOfTendedContainer>` it'll only run the declared container

```sh
# stop containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
# restart 'em
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d node-app
# [service name, not container!!] but it'll start mongo, because of the depends_on in docker-compose, check the help with
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --help
# use [--no-deps] as
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --no-deps node-app
# check the app logs
docker logs docker_course_freecodecamp-node-app-1 -f
# DB will have this error: MongooseServerSelectionError for timedOut
# then it'll try after 30s or its default, then should repeat our loop, repeating the error in our case, so run mongo alone with:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d mongo
# recheck the app!
```

### 2:32:26 Building a CRUD application, **blog application**

We start with creating `models` and `controllers` and `routes` DIRs
then `models/postModel.js`, Then we handle `controllers/postController.js` , and `routes/postRoutes` check their new content! then we connect the app with added methods

These steps are not important to explain, check john's contents when he taught you express!

Now, test our code with postMan, using `http://localhost:3000/api/v1/posts` url, and check its Fn wit its requests, it's simple, and with post verbs we use required settings we created in models DIR in req.body.

After we tested our crud approach, we'll set users' signing up-in, because we wanna see another container, **redis** container! **we'll wire it up!**

> So, we can use redis for authentication!

see the new `models/userModel.js`, then we created the `controllers/authController.js`. then created its `routes/userRoutes.js`. then we require them in main file!

then in postMan we create a new req.post as its path:`http://localhost:3000/api/v1/users/signup`, then we put a json body with a username, and a password!

then we should encrypt user's data `(hash it)`! we do that with `bcrypt` library `bcryptjs`, then re-run the docker-compose, tear it down then run it up!

> Don't use the stupid docker GUI! it makes a lot of bugs

but we'll do add `--build` flag, for putting the new image changes in!

then in the `authController.js` we put that bcryptjs algorithmic method, check it out!

it'm important for security to make req.body too specific as:

```js
  const { username, password } = req.body;

// see how we required bcrypt after User, then we invoked it inside our post Fn.
const bcrypt = require("bcryptjs");
Fn() {
  const hashPassword = await bcrypt.hash(password, 12);
  // 12 is the strength of the hash!
  // in the User.create({put username as is, and passwd as hashPassword}) go see!
}
```

Then we'll implement the login functionality, in same file. then we change its routes DIR.

> For authentication, we'll be using sessions, not tokens! one of main reasons is working with redis!

we'll install `express-session` library, in the bottom of its [npm page](https://www.npmjs.com/package/express-session) it explains that it can store data in postgres, mongo, memory, etc... in **Compatible Session Stores**, we'll [pick](https://www.npmjs.com/package/connect-redis) connect-redis

redis is easily found in docker hub, just search for it in there!

then in our docker-compose file we'll add that **redis** image, as:

```yml
redis:
  image: redis
```

Now, instead of turning our containers down then up, docker is able to handle using up along when changes come into our docker-compose file! as in 733:

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

so, we set our redis database image then install what `connect-redis` says:, `express-session` and `connect-redis` and `redis`, as:

```sh
npm i redis connect-redis express-session
```

So, connect-redis library is to wire redis and express-session libraries together.

now using docker-compose needs a `--build` flag, for the new libraries, but there is an issue ‼️ check same command with --help, there is a re-new anon-volumes, so it'll keep old libraries, and we don't that to happen, its flag is: `-V`

```sh
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build -V
```

looking at connect-redis APIs, appearing following full setup redis:

```js
import RedisStore from "connect-redis"
import session from "express-session"
import {createClient} from "redis"

// Initialize client.
let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
})

// Initialize sesssion storage.
app.use(
  session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: "keyboard cat",
  })
)
```

view new changes in index.js file, we'll get the `host url(ip-address)` && `listening port`, by setting them in config/config.js

in config file, making this OR condition is to be able to set outside of docker redis, as well as mongo above:

```js
  REDIS_URL: process.env.REDIS_URL || "redis"
```

REDIS_PORT defaults to 6379, check docker inspect at **:654**

then we use this middleware in index.js,

```js
app.use(session({
  store: new redisStore({
    client: redisClient,
    secret: SESSION_SECRET,
    cookie: {
      // to learn more about those cookie properties, check express-session library, view options
      secure: false, //these is only to simplify our app🔴
      resave: false,
      saveUninitialized: false,
      httpOnly: true,//js browser won't be able to access it, which is good for preventing XSS
      maxAge: 30000,// in millisecond
    }
  })
}))
```

the secret in the **new redisStore**, is used with handling sessions

Then we change env vars in dev docker-compose file as:

```yml
# in node-app, we add this 4th var
environment:
  - SESSION_SECRET=someString
```

Then restart the docker-compose command as above!
