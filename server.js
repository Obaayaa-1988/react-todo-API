//reason for building api for our todo list app is so that after
//adding your todo, whether pending or completed you can store it somewhere
//to have access to it even after refreshing your application 
//or closing your application
// the frontend of the todo list has been built with react and backend
//server plus database now built with express js and mongoose
//it is now time to connect the frontend with the backend


const express = require('express');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todoRoute')
const registerRouter = require('./routes/registerRoute')
const cors = require('cors');
const path = require("path")
const helmet = require('helmet');
const dotenv = require("dotenv").config()
require('dotenv').config();
const cookieParser = require("cookie-parser")
//const todosController = require('./controller/todoController')
const morgan = require('morgan')
const app = express();


const PORT = process.env.PORT || 8080


//middlewares
app.use(cors({
    credentials: true, //metedata we are passing along
    origin: "http://localhost:3002",
    methods: "GET, POST, OPTIONS, PUT, DELETE"
}))

//enable cross origin requests a security holder
//* means
//http headers:: 
//payload a data you send along when making a request
//proxy
//http header request
//http header response
app.use(morgan("dev"))
app.use(helmet())//headers
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}));



//logging request latency only development
if(app.get('env') === "development") {
    app.use(morgan("dev"));
}

const mongoUrl = process.env.MongoURL;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology : true })
.then(result => {
    if(result)
    console.log("connected to todo-mongo: successful")
}).catch(err => {
    console.log(err)
})


app.use(todoRoutes)
app.use(registerRouter)






app.listen(PORT, () => console.log(`server running on port ${PORT} `));