import express from 'express'
import { getInvestments, createInvestment, getLatestInvestment } from './investments.controller.js'

const router = express.Router()

router.get('/:playerId/all', getInvestments)
router.get('/:playerId/latest', getLatestInvestment)
router.post('/', createInvestment)

export default router