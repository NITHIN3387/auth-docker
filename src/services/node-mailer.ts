import { createTransport } from "nodemailer"

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASS
  },
})

export default transporter