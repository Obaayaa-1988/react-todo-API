const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser")

const router = express.Router();

const {
    saveRegister,
    saveLogin,
    todoLogout,
    allTodosByUser

} = require('../controller/registerController')

//routes for sign up and login for todo
router.post('/signup', saveRegister);
router.post('/login', saveLogin)
router.get('/logout', todoLogout)
router.get("/fetchUser/:id", allTodosByUser)



module.exports= router;