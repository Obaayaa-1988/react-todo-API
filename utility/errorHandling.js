

// module.exports.manageErrors = (error, res) => {
//     let errors = { email: "", password: "" }
//     if (error.code === 11000) {
//        return errors.email = "email already exist"
//     }  
    
//     if(error?.errors?.email.properties?.path === 'email'){
//          res.json(error.errors.email.properties.message)

//      }  if(error?.errors?.password?.properties?.path === 'password'){
//          res.json(error.errors.password.properties.message)
//      }

//      return errors
    
// }