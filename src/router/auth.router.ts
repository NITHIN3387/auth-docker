import { Router } from "express"
import { signin, signup, varifyOtp } from "../controller/auth"
import { resendOtp } from "../controller/auth/resend-otp.controller"

const router = Router()

router.post("/sign-up", signup)
router.post("/varify-otp", varifyOtp)
router.get("/resend-otp", resendOtp)
router.post("/sign-in", signin)

export default router