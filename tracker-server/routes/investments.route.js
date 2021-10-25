import express from 'express'
import { getInvestments, createInvestment } from './investments.controller.js'

const router = express.Router()

router.get('/', getInvestments)
router.post('/', createInvestment)

export default router