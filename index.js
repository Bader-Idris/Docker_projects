const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const redis = require("redis");

let RedisStore = require("connect-redis")(session);

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
  // the host url && listening port
  host: REDIS_URL,
  port: REDIS_PORT,
})

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?
authSource=admin`

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: false // this option in 4.4.24 is deprecated and causes an error if put
    })
      .then(() => console.log('successfully connected to DB'))
      .catch((e) => {
        console.log(e)
        setTimeout(connectWithRetry, 5000)
        // so this makes it retry, it loops each 5 seconds until it connects
      })
}
connectWithRetry()



// for redis and sessions with it ‼️
app.use(session({
  store: new RedisStore({
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


// url => 'mongodb://username:password@host:port/database?options...'
// host => the container's ip-address
// that port is the default one in same NetworkSettings, it appears fast with docker ps
// then we add the property: ?authSource=admin

app.get("/", (req, res) => {
  res.send(`<h1>hi docker</h1>
  <style>
    body {background-color: #1e1e1e;}
    h1 {
      color: #007acc;
      font-weight: bold;
      text-align: center;
      font-size: 35px;
      font-family: system-ui;
      text-transform: uppercase;
    }
  </style>`)
})

/* localhost:3000/posts/:id
  making it /api/v1/posts is better for making it for backend apis,
  and letting normal paths for front-end, that's a good idea!🤓
*/
app.use(express.json())
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`))