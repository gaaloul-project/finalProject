const express = require("express");
const router = express.Router();
const authMiddleware = require("../Helper/authMiddleware");
const { body, validationResult } = require('express-validator');
const User = require ("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'./config/.env'})

//Load connected user
router.get("/",authMiddleware,(req,res)=> {
User.findById(req.userId).select("-PassWord")
.then ((user) =>{
    if(!user){
        return res.status(404).json({msg:'user not found!'});
    }
    res.status(200).json(user);
})
.catch (err =>{
    console.error(err.message)
    res.status(500).send({msg:"server error"});
});
});

//Login user
router.post("/",[

    body('Email',"Please enter a valid email!").isEmail(),
    body('PassWord',"Please write your password").notEmpty()]
    ,(req,res)=> {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        User.findOne({Email: req.body.Email})
        .then ((user) =>{
            if(!user){
                return res.status(404).json({errors:[{msg:"Please register before"}]})
            }
            bcrypt.compare(req.body.PassWord,user.PassWord,(err,isMatch)=>{
                if (err){
                    throw err;
                  } else 
                  if (!isMatch){
                      res.status(400).json({errors:[{msg:"Wrong password"}]});
                  }
                  else{
                    let payload={
                        userId : user._id
                      
                      }
                      jwt.sign(  payload,
                        process.env.SECRET_KEY,
                        (err, token) => {
                          if (err){ throw err;}
                          res.send({token})
                        });
                  }
            })
        })
    })



module.exports=router