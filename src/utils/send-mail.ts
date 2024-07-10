import transporter from "../services/node-mailer"

const sendMail = async (to: string, subject:string, text: string) => {    
  return await transporter.sendMail({
    from: process.env.NODE_MAILER_USER,
    to,
    subject,  
    text
  })
}

export default sendMail