const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session')
const redis = require("redis");
const cors = require('cors');
let RedisStore = require("connect-redis")(session);//should be 5.1.0, because latest@7.xx.xx has different setup

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


app.enable("trust proxy")//this is after we used nginx as a proxy with our app!
app.use(cors());

// for redis and sessions with it ‼️
app.use(session({
  store: new RedisStore({
    client: redisClient
  }),
  secret: SESSION_SECRET,
  cookie: {
    // to learn more about those cookie properties, check express-session library, view options
    secure: false, //http allowed🔴, if true => https only ✔️
    resave: false,
    saveUninitialized: false,
    httpOnly: true,//js browser won't be able to access it, which is good for preventing XSS
    maxAge: 1800000,// in millisecond
  }
}))

app.use(express.json())
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.get("/api/v1", (req, res) => {
  res.send(`<h1>hi docker</h1> <style> body {background-color: #1e1e1e;} h1 { color: #007acc;
  font-weight: bold; text-align: center; font-size: 35px; font-family: system-ui; text-transform: uppercase; <style>
`);
  console.log('it ran, yo')
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`))