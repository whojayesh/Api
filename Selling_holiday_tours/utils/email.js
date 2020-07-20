const nodemailer = require('nodemailer');

const sendEmail = async options => {
       
       //1. create a transporter
       const transporter = nodemailer.createTransport({
              host: 'smtp.mailtrap.io',
              post: '25',
              auth:{
                     user: '850e9234d2ba1a',
                     pass: '143525b30e1bf4'
              }
       });
       
       //2. Define the email options
       const mailOptions = {
              from: 'Jayesh Bhakat <onecenationunderme@gmail.com>',
              to: options.email,
              subject: options.subject,
              text: options.message,
              //html: options.
              
       }
       
       //3. send the email
       await transporter.sendMail(mailOptions);
       
};

module.exports = sendEmail;