import Investment from '../models/investment.model.js'
import Player from '../models/player.model.js'
import axios from 'axios'
import {endOfDay, startOfDay} from 'date-fns'

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
    const playerId = await Player.findOne({key: playerKey}).select(['playerId']).lean().exec()
    .then(doc => {
      if(doc === null) {
        return -1
      }
      else return doc.playerId
    })
    .catch(err => ({status: 500, msg: {error: err}}))
    if (playerId < 0) {
      res.status(404).json({error: 'Player not found.'})
      return
    }
    //Check if an investment record already exists for the day
    //Get latest investment record
    const hasInvestment = await Investment.find({
      playerId: playerId, 
      timestamp: {
        $gte: startOfDay(new Date()),
        $lte: endOfDay(new Date())
      }
    }).lean().exec()
    .then(result => Array.isArray(result) && result.length > 0)
    if(hasInvestment) {
      res.status(400).json({error:'Record already exists for today'})
      return
    }
    

    //Get required player info from the game with the key
    axios.get(`https://queslar.com/api/player/full/${playerKey}`)
    .then(async returnedInfo => {
      //Make new investment record
      const newInvestment = new Investment({
        playerId: playerId,
        partner: 0,
        numPartners: 0,
        fighter: 0,
        numFighters: 0,
        cave: 0,
        house: 0,
        pet: 0,
        numPets: 0,
        equipmentSlot: 0,
        partnerRelicBoost: 0,
        battleRelicBoost: 0,
        homestead: 0,
        total: {
          gold: 0,
          resource: 0,
          relic: 0
        }
      })
      res.status(200).json({message: 'Record has been created'})
    })
    .catch(err => {
      console.log('error:', err)
      res.status(400).json({error: 'Invalid player API key'})
    })
  } catch(error) {
    res.status(500).json({error: error})
  }
}