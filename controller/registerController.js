const express = require("express")
const UsersModel = require('../model/todoRegisterModel');
const { handleErrors, generateToken } = require("../utility/registerUtility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const { cookie } = require("express/lib/response")
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');


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
           return res.json(error.errors.email.properties.message)
        }
        

        if(error?.errors?.password?.properties?.path === 'password'){
          return  res.json(error.errors.password.properties.message)
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
                    

                    const updateUserPassword = await UsersModel.findOneAndUpdate({_id:decoded.id}, {password:hash}, {new: true})
                    res.send('updated')
                }

                if(updateUserPassword){
                    res.cookie("jwt", "", {maxAge: -1 });
                    return res.status(200).json({msg: "password reset successful"})

                }
                
            } catch (error) {
                console.log(error)
                return res.sendStatus(500)     
            }
        });
    } else {
        return res.status(403).json({msg: "token unavailable"})
    }
   // res.send("test")
}

//sending an email from your email to another email using nodemon
const sendEmail = (req, res) =>{
    const {email} = req.body
    //this is for login in to your own email

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user:"ashbella333@gmail.com",
          pass:"omuulhndcpbqlzdg",

        },
    });
//this is for sending or composing an email and sending to someone
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
//sending a link for a user to reset their password after they have gotten

const forgotPassword = async (req, res) =>{
    try {
//we are using req.params for the email because each user has a unique email address
//and will be identified by that email(resetToken)
        const { email } = req.params;
//uuidva to generate strings which will change the email when sent
        const resetToken = uuidv4();
//find email of the user from the db after, the email is updated with the resetToken string generated which will 
//will replace the real email of the user
        const updateUserToken = await UsersModel.findOneAndUpdate({ email }, { resetToken }, { new: true })
//if the user with their email is not found in the db an error message is sent back
        if(!updateUserToken) {
          return  res.status(401).json({ msg: "email cannot be found"})
        }

// if the users email is available in the db then email from the application owner is sent to the user to change the password
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user:"ashbella333@gmail.com",
              pass:"omuulhndcpbqlzdg",
    
            },
        });
    //the user is required to put in their email and the reset password link sent to them
    //into their mail, they just click the link and an interface pops up for them to
    //put in a new password
        const mailOptions = {
            from: "ashbella333@gmail.com",
            to: `${email}`,
            subject: "password reset",
            text: `to reset your password, click this link: http://localhost:3000/reset-password/${resetToken}`,
            replyTo: "ashbella333@gmail.com"
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if(error) {
                console.log(error)
            } else {
                console.log("Email sent: " + info.response )
            }
        });
        //success message sent to the user when password change link is sent
        res.send('email sent, check your mail')
    
    } catch (error) {
        console.log(error)
        
    }


}

//after the reset password(after the user forgot her) is sent to the user it is time for the user to create a new password
const resetForgottenPassword = async (req, res) => {
    //a user can now input in a new password for their accound when
    //they click on the password reset link
    try {
        const { resetToken } = req.params;
        const { newPassword } = req.body;
//after a user put in a new password it is then hashed
        const hash = await bcrypt.hash(newPassword, 10);
//after hashing the password it is then updated with the resetToken which wass already saved in the database when the reset password link was 
//sent to the user
        await UsersModel.findOneAndUpdate({ resetToken }, { password: hash }, { new: true })
        
        res.sendStatus(200)
        
    } catch (error) {
        console.log(error)
        
    }
}



  
  



module.exports = {
    saveRegister,
    saveLogin,
    todoLogout,
    allTodosByUser, 
    resetPassword,
    sendEmail,
    forgotPassword,
    resetForgottenPassword


}