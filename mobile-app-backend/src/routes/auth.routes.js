const express=require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router=express.Router();

router.post("/signup",async (req,res)=>{
    try{
        const {name,email,password,confirmPassword}=req.body;

        if(!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                error : "All Fields Are Required",
            });
        }

        if(password != confirmPassword){
            return res.status(400).json({
                error : "password do no match",
            });
        }

        const existUser=await User.findOne({email});
        if(existUser){
            return res.status(400).jsom({
                error: " User already exists",
            });
        }
        
        const hashedpassword=await bcrypt.hash(password,10);
        
        const user=await User.create({
            name,
            email,
            password:hashedpassword,
        });

        res.status(201).json({
            message : "Signup Successfull",
            userId:user._id,
        });
    }catch(error){
        console.error("Signup error : ",error);
        res.status(500).json({
            error:"server error during signup",
        });
    }
});

router.post("/login",async (req,res)=>{
     try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({
                error:"Email and Password are required",
            });
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                error:"Invalid email or password",
            });
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({
                error:"Invalid email or password",
            });
        }

        const token=jwt.sign(
            {
                userId:user._id,
                email:user.email,
            },
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );
        res.json({
            message:"Login Sucsessfull",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
            },
        });
     }catch(error){
        console.error("Login error : ",error);
        res.status(500).json({
            error:"server error during login",
        });
     }
});

module.exports=router;