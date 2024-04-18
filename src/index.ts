import express, { Request, Response } from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { dbConnect } from '../lib/dbConnect'
import { router } from '../routes/router'

const app = express()
app.use(cors())
app.use(express.json())
config()

app.use((req: Request, res: Response, next) => {
  // to prevent CORS error
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  next()
})

app.use(router)

dbConnect()
app.listen(8080, () => {
  console.log('Server is up n running..')
})
