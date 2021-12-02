import mongoose from 'mongoose'

const investmentSchema = mongoose.Schema({
  playerId: Number,
  timestamp: {
    type: Date,
    default: new Date(new Date().toDateString())
  },
  partner: Number,
  numPartners: Number,
  fighter: Number,
  numFighters: Number,
  cave: Number,
  house: Number,
  pet: Number,
  numPets: Number,
  equipmentSlot: Number,
  partnerRelicBoost: Number,
  battleRelicBoost: Number,
  homestead: Number,
  total: {
    gold: Number,
    resource: Number,
    relic: Number
  }
})

const Investment = mongoose.model('Investments', investmentSchema)

export default Investment