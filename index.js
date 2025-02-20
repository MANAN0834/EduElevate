const express=require('express');
const app=express();
require('dotenv').config();
app.listen(process.env.PORT,()=>{
    console.log("App is running at port no",`${process.env.PORT}`)
})
const dbConnect=require('./config/database');
dbConnect();
app.get('/',(req,res)=>{
    res.send('hello jee')
})