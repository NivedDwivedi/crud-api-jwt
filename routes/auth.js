const express=require("express");
const fs=require("fs");
const router=express.Router();
const bcrypt  = require('bcrypt');
const {to} = require('await-to-js');
const jwt = require('jsonwebtoken');


const userData='json/user.json';

//Encryption
const encrypt=async (password)=>{
    const saltRounds=10;
    const [err, encrypt] = await to(bcrypt.hash(password, saltRounds));
    if (err) {
        return res.send("Encryption failed!");
    }
    return encrypt;
};
let salt='ThisIsMySalt';


//token generation
const generateToken=(usersData) => {
    
    let token=jwt.sign(usersData, salt, {
        expiresIn: 172800000,
    });
    return token;
};


//Signup
router.post('/signup', async(req, res)=>{
    let id=req.body.id;
    let name=req.body.name;
    let email=req.body.email;
    let password=req.body.password;
    let userdata=JSON.parse(fs.readFileSync(userData));
    let found=0;
    if(typeof name!="string" || typeof email!="string" || typeof id!="number")
    {
        return res.send("Invalid Entry!");
    }

    //encrypt password
    let encryptedPassword=await encrypt(password);
    userdata.forEach(element => {
        if(element.email==email)
        {
            found=1;
            return res.send("Already have a account, Please Login");
        }
    });
    let obj={
        "id":id,
        "name":name,
        "email":email,
        "password":encryptedPassword
    }
    if(!found)
    {
        userdata.push(obj);
        
        fs.writeFileSync(userData, JSON.stringify(userdata, null, 2));
        return res.send({ data: "Success", error: null });
    }
    

});

//Login
router.post('/login', async(req, res)=>{
    let email=req.body.email;
    let password=req.body.password;
    let err, flag=0,i=-1;
    let isValid, userPassword, userName;
    if(typeof password!="string" || typeof email!="string")
    {
        return res.send("Invalid Entry!");
    }

    let userdata=JSON.parse(fs.readFileSync(userData));
    userdata.forEach(element=>{
        if(element.email==email)
        {
            flag=1;
            userPassword=element.password;
            userName=element.name;
            userId=element.id;
        }
        i++;
    });
    let data={
        "id":userId,
        "email":email
    };
    if(flag==1)
    {
        [err, isValid] = await to(
            bcrypt.compare(password, userPassword )
        );
        if(isValid){
           return res.send({data: {token:generateToken(data)},error:null});
        } else{
            return res.send({data:null,error:'Invalid password'})
        }
    }
    else{
        return res.send("Entered Email Id is not registered");
    }
    

});

module.exports = router;