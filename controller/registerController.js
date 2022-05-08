const express = require("express")
const UsersModel = require('../model/todoRegisterModel');
const { handleErrors, generateToken, deleteToken } = require("../utility/registerUtility");
const bcrypt = require("bcrypt");
const token = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const { cookie } = require("express/lib/response")


//saving user to the database after relation with todomodel
const saveRegister = async (req, res) => {
    try {
        //destructuring
        const { username, password, email } = req.body;
        const hashed = bcrypt.hashSync(password, 10)
        const addUser = await new UsersModel({
            username,
            password : hashed,
            email,
        });
        const user = await addUser.save();
        //if user details is correct and saves to the database
        //generate token with the id and set cookie with the token
        if(user) {
            //generate token
            const token = generateToken(user._id);
            //use token to set cookie
            res.cookie("jwt", token, {
                maxAge: 2 * 24 * 60 * 60 * 1000,
                httpOnly: true,
            });

            console.log(token)
            console.log("user created")

        }
        res.status(201).json({ user })
        console.log(user)
        
    } catch (error) {
        // console.log(error.errors.email.properties.message)

        if(error?.errors?.email.properties?.path === 'email'){
            res.json(error.errors.email.properties.message)
        }
        

        if(error?.errors?.password?.properties?.path === 'password'){
            res.json(error.errors.password.properties.message)
        }

        if(error.code === 11000){
            res.status(409).json(error)

        }
        
        
    }

}



// const saveRegister = async(req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         const todoUser = new UsersModel({
//             username,
//             email,
//             password
//         });

//         const user = await todoUser.save();

//         const token = generateToken(user._id);
//         res.cookie("jwt", token, { maxAge: 3 * 24 * 60 * 60 * 1000, httpOnly: true});
//         res.status(201).json( { user: user});
        
//     } catch (error) {
//         const errors = handleErrors(error);
//         console.log(error.message)
//         res.json( { errors });
        
//     }

// }



//save user login for todo application
const saveLogin = async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await UsersModel.findOne({email})
         
        if(user) {
            const isSame = await bcrypt.compare(password, user.password);

            if(isSame) {
                const token = generateToken(user._id);
                res.cookie("jwt", token, { maxAge: 3 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.status(200).json({ user: user})
            } else {
                res.json({errors: "Incorrect Password"})
            }
        } else {
            res.json({errors: " Email doesn't exist please sign up"})
        }
        
    } catch (error) {
        const errors = handleErrors(error)
        
    }
}

//logout a user
const todoLogout = (req, res) =>{
   res.cookie("jwt", "", {maxAge: -1, httpOnly: true})
   res.sendStatus(200);
  
  }

  //

  const allTodosByUser = async (req, res) => {
      try {
        const { id } = req.params;
        const user = await UsersModel.findById(id).populate("todos")
        res.json({ user });
          
      } catch (error) {
          console.log(error)
          
      }
  }
  
  
  



module.exports = {
    saveRegister,
    saveLogin,
    todoLogout,
    allTodosByUser

}