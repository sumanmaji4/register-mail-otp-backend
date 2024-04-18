import mongoose from 'mongoose'

const userOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    trim: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
    default: '-1',
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
})

export const UserOpt = mongoose.model('userotps', userOtpSchema)
