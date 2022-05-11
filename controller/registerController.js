const express = require("express")
const UsersModel = require('../model/todoRegisterModel');
const { handleErrors, generateToken, deleteToken } = require("../utility/registerUtility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const { cookie } = require("express/lib/response")
const nodemailer = require("nodemailer")


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
                res.status(200).json({ user: user._id})
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
  

  //resetting a users password 
const resetPassword = async (req, res) =>{
    const{ password, newPassword } = req.body

    const cookie = req.cookies.jwt;

    if(cookie) {
        jwt.verify(cookie, process.env.JWT_SECRET, async(err, decoded) => {
            try {
                if(err){
                    console.log(err)
                    return res.status(403)

                }else {
                    console.log(decoded)
                    const user = await UsersModel.findOne({_id:decoded.id})
                    console.log(user)

                    const identical = await bcrypt.compare(password, user.password)

                    if(!identical){
                        return res.status(401).json({message: "wrong credentials"})
                    }

                    const pass = await bcrypt.compare(newPassword, user.password)
                    if(pass){
                        return res.status(401).json({message: "you cannot use old password again"})
                    }


                    const hash = await bcrypt.hash(newPassword, 10)
                    

                    await UsersModel.findOneAndUpdate({_id:decoded.id}, {password:hash}, {new: true})
                    res.send('updated')
                }
                
            } catch (error) {
                console.log(error)

                
            }
        });
    }
   // res.send("test")
}

//sending an email from your email to another email
const sendEmail = (req, res) =>{
    const {email} = req.body

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user:"ashbella333@gmail.com",
          pass: "arvid2019",








        },
    });

    const mailOptions = {
        from: "ashbella333@gmail.com",
        to: `${email}`,
        subject: "Sending Email Using Nodemailer",
        text: "mail successfully sent "
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if(error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response )
        }
    });
    res.send('email sent, check your mail')


}




  
  



module.exports = {
    saveRegister,
    saveLogin,
    todoLogout,
    allTodosByUser, 
    resetPassword,
    sendEmail


}