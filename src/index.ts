import express, { Request, Response } from 'express'

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Hahow Backend Interview!')
  console.log('Hello, Hahow Backend Interview!')
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
