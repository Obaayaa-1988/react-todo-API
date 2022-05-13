 const mongoose = require("mongoose");
 const bcrypt = require("bcrypt")
 const { Schema } = mongoose;

 const RegisterSchema = new Schema({
     username:{
         type: String,
         required: [true, "Please enter your username"]
     },

     email:{
         type: String,
         required: [true, "Please enter your email"],
         unique: true,
         lowercase: true,
         trim: true
     },

     password: {
         type: String,
         required: [true, "Please enter a password"],
         minlength: [5, "Please the password lenght must be above five"]
     },
     todos: [
         {
             type: Schema.Types.ObjectId,
             ref: 'Todolist',
         },
     ],

     resetToken: {
         type: String
     }

 }, { timestamps: true})
 
 //before save

//  RegisterSchema.pre("save", async function(next) {
//      const salt = await bcrypt.genSalt();
//      this.password = await bcrypt.hash(this.password, salt);
//      next();
//  })

 const Users = mongoose.model("Users", RegisterSchema)

 module.exports = Users;
