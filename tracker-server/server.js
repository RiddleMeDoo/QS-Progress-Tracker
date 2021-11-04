import express from "express"
import cors from "cors"
import investments from "./routes/investments.route.js"
import player from "./routes/player.route.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/investment", investments)
app.use("/api/player", player)
app.use("*", (req, res) => res.status(404).json({error: "not found"}))

export default app