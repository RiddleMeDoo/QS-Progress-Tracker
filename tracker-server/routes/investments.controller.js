import Investment from '../models/investment.model.js'
import Player from '../models/player.model.js'
import axios from 'axios'

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

export const getLatestInvestment = async (req, res) => {
  res.status(500).json({error: "Not implemented yet"})
}

export const createInvestment = async (req, res) => {
  const playerKey = req.body.APIKey
  try {
    //Check for player in database
    const result = await Player.findOne({key: playerKey}).select(['playerId']).lean().exec()
    .then(doc => {
      if(doc === null) {
        return {status: 404, msg: {error: 'Player not found.'}}
      }
      else return {status: 200, msg: {message: 'Created investment'}}
    })
    .catch(err => ({status: 500, msg: {error: err}}))
    if (result.status !== 200) {
      res.status(result.status).json(result.msg)
      return
    }
    //Check if an investment record already exists for the day
    

    //Get required player info from the game with the key
    const playerInfo = axios.get(`https://queslar.com/api/player/full/${playerKey}`)
    .then(async returnedInfo => {
      //Make new investment record
      const newPlayer = new Player({
        key: playerKey,
        playerId: returnedInfo.data.player.id,
        name: returnedInfo.data.player.username
      })
      res.status(status).json(msg)
    })
    .catch(err => {
      console.log('error:', err)
      res.status(400).json({error: 'Invalid player API key'})
    })
  } catch(error) {
    res.status(500).json({error: error})
  }
}