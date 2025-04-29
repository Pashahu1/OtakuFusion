import express from 'express'
import routes from './routes/routes.js'
import cors from 'cors'

const app = express()

app.use(cors())
app.get('/', (req, res) => {
  res.send('hello')
})
app.use('/api/v1', routes)

export default app
