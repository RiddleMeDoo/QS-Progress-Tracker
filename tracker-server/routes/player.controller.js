import Player from '../models/player.model.js'
import axios from 'axios'

export const addPlayer = async (req, res) => {
  const playerKey = req.body.APIKey

  //Confirm that it is a valid api key
  const playerInfo = axios.get(`https://queslar.com/api/player/full/${playerKey}`)
    .then(async returnedInfo => {
      //Make new player
      const newPlayer = new Player({
        key: playerKey,
        playerId: returnedInfo.data.player.id,
        name: returnedInfo.data.player.username
      })
      try {
        await newPlayer.save()
        res.status(201).json({...newPlayer, message: 'Added new player'})
      } catch(error) {
        //TODO: Create a custom response message for attempting duplicate player
        res.status(409).json({message: error.message})
      }
    }).catch(err => {
      console.log('error:', err)
      res.status(400).json({message: 'not a valid key'})
      return
    })
}