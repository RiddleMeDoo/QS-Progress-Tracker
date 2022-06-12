import express from 'express'
import { addPlayer } from './player.controller.js'

const router = express.Router()

router.post('/add', addPlayer)

export default router
