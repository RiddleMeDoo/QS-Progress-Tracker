import mongoose from 'mongoose'

const playerSchema = mongoose.Schema({
  playerId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true
  }
}, {strict: true})

const Player = mongoose.model('Player', playerSchema)

export default Player