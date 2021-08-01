const { text } = require("body-parser");
const nodemailer = require("nodemailer");
const mailGun = require("nodemailer-mailgun-transport");
require("dotenv").config();


const auth = {
  auth: {
    api_key:process.env.api_key,
    domain: process.env.domain,
  }
};

const transporter = nodemailer.createTransport(mailGun(auth));
// arrive time will get here later after we calculate it!
const sendMailToClient = (stops) => {
  
  for(var i=0;i<stops.Stops.length;i++){
  const mailOptions = {
    from: "postmaster@sandbox62a2abb841394772a816711962931abb.mailgun.org", 
    to: stops.Stops[i].CustomerEmail,  
    subject:"Route Information",
    text: "Hello "+stops.Stops[i].CostumerName + "ur pacakeg arrives at : 18:50",
  }
    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
      console.log(err)
      }
       else {
        
        console.log('Email sent!');
    }
  });
    }
    
    
  }
  
module.exports={
  sendMailToClient: sendMailToClient,
};