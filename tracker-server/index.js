import app from "./server.js"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const port = process.env.PORT || 5000
const db_uri = process.env.DB_URI

mongoose.connect(
  db_uri,
  { //Options
    writeConcern: {wtimeout: 2500},
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).catch(err => {
  console.log(err.stack)
  process.exit(1)
}).then(async client => {
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})
