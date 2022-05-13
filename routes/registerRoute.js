const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser")

const router = express.Router();

const {
    saveRegister,
    saveLogin,
    todoLogout,
    allTodosByUser,
    resetPassword,
    sendEmail,
    forgotPassword,
    resetForgottenPassword

} = require('../controller/registerController')

//routes for sign up and login for todo
router.post('/signup', saveRegister);
router.post('/login', saveLogin)
router.get('/logout', todoLogout)
router.get("/fetchUser/:id", allTodosByUser)
router.post("/reset", resetPassword)
router.put("/forgot-password/:email", forgotPassword)
router.put("/:resetToken/reset-password", resetForgottenPassword)

//route for sending email
router.post('/mailing', sendEmail)



module.exports= router;