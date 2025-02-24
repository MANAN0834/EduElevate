const User =require("../models/User");
const otp=require("../models/Otp");
const optgenrator = require("otp-generator");
const Otp = require("../models/Otp");
const bcrypt=require("bcrypt")
exports.signup=async (req,res)=>{
    try{
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber}=req.body;
        if(!firstName || !lastName || !email || !password || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Fill all input fields"
            })
        }
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirmPassword doesnot match"
            })
        }
        const checkUser=await User.find({email});
        if(checkUser){
            return res.status(401).json({
                success:false,
                message:"User already exists"
            })
        }
        //otp validation
        const recentOtp=await Otp.find({email}).sort({createdAt:-1}).limit(1);
        if(recentOtp.length===0){
            return res.status(401).json({
                success:false,
                message:"OTP not found"
            })
        }else if(otp!==recentOtp.otp){
            return res.status(401).json({
                success:false,
                message:"Invalid otp"
            })
        }
        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)
    
        // Create the Additional Profile For User
        const profileDetails = await Profile.create({
          gender: null,
          dateOfBirth: null,
          about: null,
          contactNumber: null,
        })
        const user = await User.create({
          firstName,
          lastName,
          email,
          contactNumber,
          password: hashedPassword,
          accountType: accountType,
          approved: approved,
          additionalDetails: profileDetails._id,
          image: "",
        })
    
        return res.status(200).json({
          success: true,
          user,
          message: "User registered successfully",
        })
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "User cannot be registered. Please try again.",
        })
      }
    }

    
//send otp
exports.sendotp=async function(req,res){
    try{
        const {email}=req.body;
        //check if user exists or not
        const checkUser=await User.find({email});
        if(checkUser){
            return res.status(401).json({
                success:false,
                message:"User already exists"
            })
        }
        //generate otp
        const generateOtp=optgenrator.generate(6,{
            lowerCaseAlphabets:false,
            upperCaseAlphabets:false,
            specialChars:false
        })
        //check for the uniquess of otp
        const checkOtp=await Otp.find({generateOtp});
        while(checkOtp){
            const generateOtp=optgenrator.generate(6,{
                lowerCaseAlphabets:false,
                upperCaseAlphabets:false,
                specialChars:false
            })
            checkOtp=await Otp.find({generateOtp});
        }
        //create otp entry in db
        const otpPayload={
            email,
            generateOtp
        }
        const createOtpEntry=await otp.create(otpPayload);
        console.log(createOtpEntry);
        return res.status(200).json({
            success:true,
            message:"otp created successfully"
        })

    }catch(error){
        console.log("Error in otp generator ",error);
        return res.status(500).json({
            success:true,
            message:"Error in otp generator"
        })
    }
}