import { Request, Response } from 'express'
import { Users } from '../models/userSchema'
import { UserOpt } from '../models/userOtp'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

type UserType = {
  _id: string
  firstname: string
  lastname: string
  email: string
  contact?: string
  password: string
}

export const userRegister = async (req: Request, res: Response) => {
  const { firstname, lastname, email, contact, password } = req.body

  if (!firstname || !lastname || !email || !password)
    return res.status(400).json({ error: 'Please Enter All Input Data' })

  try {
    const ExistingUser = await Users.findOne({ email: email })
    if (ExistingUser)
      return res
        .status(400)
        .json({ error: 'Mail Id already exist in DataBase' })
    else {
      const hashedPW = await bcrypt.hash(password, 12)
      const DBresponse = await Users.create({
        firstname,
        lastname,
        email,
        contact,
        password: hashedPW,
      })
      await UserOpt.create({
        email,
        otp: '-1',
        verified: false,
      })
      res
        .status(201)
        .json({ message: 'User created!', userId: DBresponse._id, email })
    }
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Error while userRegister', fullError: err })
  }
}

export const sendOTP = async (req: Request, res: Response) => {
  const { email } = req.body

  // console.log(process.env.EMAIL)
  // console.log(process.env.EMAILPW)
  // email config
  const tarnsporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPW,
    },
  })

  try {
    const user: UserType | null = await Users.findOne({ email: email })
    if (!user)
      return res.status(400).json({ error: 'To verify email, register first' })
    else {
      const OTP = Math.floor(1000 + Math.random() * 9000)

      await UserOpt.deleteMany({ email })
      await UserOpt.create({
        email,
        otp: OTP,
        verified: false,
      })

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP form email Validation',
        html: `<h4>Here is your OTP:- ${OTP}</h4>`,
      }

      tarnsporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          // console.log('error', error)
          return res
            .status(400)
            .json({ error: 'unable to send varification mail' })
        } else {
          // console.log('Email sent', info)
          return res.status(201).json({ message: 'Email sent Successfully' })
        }
      })
    }
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Error while sendOTP', fullError: err })
  }
}

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body
  // console.log(email, otp)

  if (!(email && otp)) return res.status(400).json({ error: 'Invalid request' })
  // console.log('testing')
  try {
    let currentUser = await UserOpt.findOne({ email })
    if (!currentUser) return res.status(400).json({ error: 'Invalid request' })
    if (currentUser?.otp == otp) {
      // create jwt
      currentUser.verified = true
      await currentUser.save()
      const token = jwt.sign(
        {
          email: email,
          verified: currentUser?.verified,
        },
        'super53cret',
        { expiresIn: '1h' }
      )
      return res
        .status(200)
        .json({ token: token, email, verified: currentUser.verified })
    } else {
      return res.status(400).json({ error: 'otp not matched' })
    }
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Error while verifyOTP', fullError: err })
  }
}

export const UserSingIn = async (req: Request, res: Response) => {
  const { email, password } = req.body
  let loadedUser

  try {
    const user: UserType | null = await Users.findOne({ email: email })

    if (!user) return res.status(400).json({ error: 'User not found' })
    else {
      loadedUser = user
      const isEqual = await bcrypt.compare(password, user.password)

      if (!isEqual) {
        return res.status(401).json({ error: 'Wrong Password!' })
      }
      const emailVarification = await UserOpt.findOne({ email })
      const token = jwt.sign(
        {
          email: loadedUser.email,
          verified: emailVarification?.verified,
        },
        'super53cret',
        { expiresIn: '1h' }
      )
      return res
        .status(200)
        .json({ token: token, email, verified: emailVarification?.verified })

      // return res.status(200).json({
      //   message: 'SignIn successfull',
      //   userId: loadedUser._id.toString(),
      // })
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid Details', fullError: err })
  }
}
