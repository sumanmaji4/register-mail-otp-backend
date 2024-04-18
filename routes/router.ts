import express from 'express'
import {
  UserSingIn,
  sendOTP,
  userRegister,
  verifyOTP,
} from '../controllers/userControllers'

export const router = express.Router()

router.post('/user/register', userRegister)
router.post('/user/sendotp', sendOTP)
router.post('/user/verifyotp', verifyOTP)
router.post('/user/signin', UserSingIn)
