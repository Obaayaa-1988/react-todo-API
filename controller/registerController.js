const express = require("express")
const UsersModel = require('../model/todoRegisterModel');
const { handleErrors, generateToken } = require("../utility/registerUtility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const { cookie } = require("express/lib/response")
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');


//saving user to the database after relationship with todomodel
const saveRegister = async (req, res) => {
    try {
        //destructuring
        const { username, password, email } = req.body;

        const hashed = bcrypt.hashSync(password, 10)
        const addUser = await new UsersModel({
            username,
            password : hashed,
            email,
            emailToken:  uuidv4(), // a token is generated (uuidv4 string ) for user when he/she signs up this generated token
                                  //will be used to verify the user ad saved to the database
            isVerified: false

        });
        //after a user put in the right credential he/she is then saved in the database and an id generated for the user in the db
        const user = await addUser.save();
        //if user details is correct and it is then save to the database
        //generate token with the id and a cookie set with the token
        if(user) {
            //after a user gets saved to the database a token is generated for the user
            const token = generateToken(user._id);
            //user token to set cookie
            // res.cookie("jwt", token, {
            //     maxAge: 2 * 24 * 60 * 60 * 1000,
            //     httpOnly: true,
            // });

            console.log(token)
            console.log("user created")
        }
        res.status(201).json({ user, message: "link has been sent verify your email" })
        console.log(user)

//an email link is sent to the user to verify their account as the user signs up with his/her credebtials
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user:"ashbella333@gmail.com",
              pass:"omuulhndcpbqlzdg",
    
            },
        });
  //confirmToken(token) generated token is added to the email link and sent to the user and saved in the database
        const confirmToken = addUser.emailToken;

        const mailOptions = {
            from: "ashbella333@gmail.com",
            
            to: addUser.email,
            subject: "verify your email",
            text: `to be a verified user, click this link: http://localhost:3000/verified-email/${confirmToken}`,
            replyTo: "ashbella333@gmail.com"
        };
    
        transporter.sendMail(mailOptions, function (error, info) {
            if(error) {
                console.log(error)
            } else {
                console.log("Email sent: " + info.response )
            }
        });
        res.json('verify email link sent, check your mail to verify your email')



        
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

//verify email
//after the verify email link is sent to the user the user clicks on the link 
const emailVerified= async (req, res) => {
    try {
        //we use the token generated for the user when he/she signed up to find the user from the database 
        const { token } = req.params
        //after we find the user from the data with it email token and we update it to null because we don not need anymore
        const user = await UsersModel.findOne({emailToken: token})
        if(user){
            user.emailToken = null,
            user.isVerified = true
//after the emailToken has been set to null and isVerified change the user is again saved to the database
            await user.save()


            console.log("bonjour user")
        }else {
            console.log("verify your email please")

        }
        
    } catch (error) {
        console.log(error)
        
    }

}

//after a user has verified email
const verifyEmail = async(req, res, next) =>{
    try {
        const user = await UsersModel.findOne({email: req.body.email})
        if(user.verified === true){
            next
        } else{
            console.log('please check your email to verify your account')
        }
        
    } catch (error) {
        console.log(error)
        
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
        // const verifiedUser = user.isVerified
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
            res.json({errors: " Email or password doesn't exist please sign up"})

        }    
        
    } catch (error) {
        console.log(error)
        
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
                        return res.status(400).json({message: "wrong credentials"})
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
    resetForgottenPassword,
    emailVerified,
    verifyEmail


}