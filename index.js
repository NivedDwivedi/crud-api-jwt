const express= require('express');
const app=express();
const fs=require("fs");
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');

const userData='json/user.json';



app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// const myMiddleware=(req, res, next)=>{
//     const token = req.headers.token;
//     if(token=="12345")
//     {
//             next();
//     }
//     else{
//         console.error(`Invalid Token : ${token}`);
//         res.send("Token is not valid");
//     }
// };
const courseR=require('./routes/courseR');
const studentR=require('./routes/studentR');
const authR=require('./routes/auth');
const mysql=require('./DB/mysql');


try {
    let promise = mysql.connect()
    promise.then((result) => {
      console.log({"Data":result, "Error":null})
    })
  } catch (err) {
    console.log({"Data":null, "Error": err})
}

let salt='ThisIsMySalt';

const validateToken=(req, res, next) => {
    let token=req.headers.authorization;
    try {
        token=token.split('Bearer ')[1];
    } catch (error) {
        return res.json({data: null,error: 'Please add token'});
    }
    
    let userdata=JSON.parse(fs.readFileSync(userData));
    //let data=verifyToken(token);
    try {
        data=jwt.verify(token, salt);
    } catch (err) {
        //throw new Error("something went wrong");
        return res.json({data: null,error: 'Invalid token'});
    }
    if(data==undefined)
    {
        return res.send("Something went wrong");
    }
    let found=0;
    userdata.forEach(element => {
        if(data.id==element.id && data.email==element.email)
        {
            found=1;
        }
    });
    if(found==1)
    {   
        req.id=data.id;
        next();
    }
    else
    {
        return res.json({data: null,error: 'invalid token'});
    }
    
};


// const verifyToken=(token) => {
//     let data=undefined;
        
    
//     return data;
// };







// app.use(myMiddleware);
app.use('/api/auth', authR);
app.use(validateToken);
app.use('/api/course/', courseR);
app.use('/api/students/', studentR);



const PORT=process.env.PORT || 3000;
app.listen(PORT, (req, res)=>console.log(`We are at port ${PORT}`));