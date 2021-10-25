import Investment from "../models/investment.model.js"

export const getInvestments = async (req, res) => {
  try {
    const investmentHistory = await Investment.find()
    console.table(investmentHistory)

    res.status(200).json(investmentHistory)
  } catch (error) {
    console.error(error)
    res.status(404).json({error: error.message})
  }
}

export const createInvestment = (req, res) => {
  const reqBody = req.body 
  try {

  } catch(error) {
    
  }
}