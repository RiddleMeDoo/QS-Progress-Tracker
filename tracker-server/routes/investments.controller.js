import Investment from '../models/investment.model.js'
import Player from '../models/player.model.js'
import axios from 'axios'
import endOfDay from 'date-fns/endOfDay/index.js'


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
  res.status(500).json({error: 'Not implemented yet'})
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
        partner: returnedInfo.partners.reduce(getPartnerInvestment, 0),
        numPartners: returnedInfo.partners.length,
        fighter: returnedInfo.fighters.reduce(getFighterInvestment, 0),
        numFighters: returnedInfo.fighters.length,
        cave: getCaveInvestment(returnedInfo.fighterCaveTools),
        house: getHouseInvestment(returnedInfo.house),
        pet: returnedInfo.pets.reduce(getPetInvestment, 0),
        numPets: returnedInfo.pets.length,
        equipmentSlot: getEquipmentSlotInvestment(returnedInfo.equipmentSlots),
        partnerRelicBoost: 0,
        battleRelicBoost: 0,
        homestead: 0,
        total: {
          gold: 0,
          resource: 0,
          relic: 0
        }
      })
      res.status(200).json(newInvestment)
    })
    .catch(err => {
      console.log('error:', err)
      res.status(400).json({error: 'Invalid player API key'})
    })
  } catch(error) {
    res.status(500).json({error: error})
  }
}




// Helper functions
export const getPartnerInvestment = (totalInvestment, partner) => {
  /*
  * Returns the total amount of gold invested into a given partner,
  * adding onto the total investment amount
  */
  const speed = partner.speed 
  const intelligence = partner.intelligence
  let investment = 0
  //Calculations are made with 'sum of consecutive numbers'
  investment += Math.round(10000 * (speed * (speed + 1) / 2))
  investment += Math.round(10000 * (intelligence * (intelligence + 1) / 2))
  return totalInvestment + investment
}

const getFighterInvestment = (investment, fighter) => {
  /*
  * Returns the total amount of gold invested into a given fighter,
  * adding onto the total investment amount
  */
  const stats = ['health', 'damage', 'hit', 'dodge', 'defense', 'crit_damage']
  return investment + stats.reduce(
    (prev, stat) => prev + Math.round(10000 * (fighter[stat] * (fighter[stat] + 1) / 2)), 
    0)
}

const getCaveInvestment = caves => {
  /**
   * returns the total number of diamonds invested in the cave
   */
  const caveUpgrades = ['archeology', 'brush', 'trowel', 'map', 'backpack', 'torch', 'scouting', 'spade', 'knife']
  return caveUpgrades.reduce(
    (diamonds, tool) => diamonds + caves[tool] * (caves[tool] + 1) / 2,
     0)

}

const getHouseInvestment = houseData => {
  const houseUpgrades = ["chairs", "stove", "sink", "basket", "pitchfork", "shed", "fountain", "tools", "barrel"]
  const livingRoom = ["table","candlestick","carpet","couch"]
  let houseInvestment = houseUpgrades.reduce(
    (investment, upgrade) => {
      let total = investment
      for(let i = 1; i < houseData[upgrade] + 1; i++) {
        total += 1000 + (1000 * (i - 1)**1.25)
      }
      return total
    }, 0)

  houseInvestment += livingRoom.reduce(
    (investment, upgrade) => {
      let total = investment
      for(let i = 1; i < houseData[upgrade] + 1; i++) {
        total += 5000000 + (5000000 * (i - 1)**1.25)
      }
      return total
    }, 0)
  return houseInvestment * 4
}

const getPetInvestment = (investment, petInfo) => {
  return investment + (petInfo.farm_strength*(petInfo.farm_strength + 1) / 2 + 
    petInfo.farm_health * (petInfo.farm_health + 1) / 2 + 
    petInfo.farm_agility * (petInfo.farm_agility + 1) / 2 + 
    petInfo.farm_dexterity * (petInfo.farm_dexterity + 1) / 2) * 50000
}

const getEquipmentSlotInvestment = eqSlots => {
  eqSlotLevels = [
    eqSlots.left_hand_level, eqSlots.right_hand_level, 
    eqSlots.head_level, eqSlots.body_level, 
    eqSlots.hands_level, eqSlots.legs_level, eqSlots.feet_level
  ]

  return eqSlotLevels.reduce(
    (investment, level) => {
      investment + 250 * ((1 - 1.1**level) / -0.1)
    }
  , 0)
}

export const getRelicInvestment = (level) => {
  if(level <= 0) return 0
  let investment, increment, initCost
  
  if(level <= 5000) return 10 * (level * (level + 1) / 2)
  else if(level <= 10000) {
    investment = 125025000 //Investment at level 5000
    increment = 30
    initCost = 50000
  
    for(let i = 5; i < Math.round(level/1000) + 1; i++) {
      const base = level >= (i+1) * 1000 ? 1000 : level % (i * 1000)
      investment += increment * (base * (base + 1) / 2) + (initCost * base)
      initCost += increment * 1000
      increment += 20 //increases every 1k levels
    }
  
  } else { //level > 10k
    investment = 1050200000 //Investment at level 10,000
    increment = 130
    initCost = 400000
  }
  
  for(let i = 10;  i < Math.round(level / 1000) + 1; i++) {
    const base = level >= (i+1) * 1000 ? 1000 : level % (i * 1000)
    investment += increment * (base * (base + 1) / 2) + (initCost * base)
    initCost += increment * 1000
    //Past 10k, increment also starts to add in consecutive sums (n * (n+1) / 2)
    increment = (i - 7) * (i - 6) / 2 * 10 + 100
  }
  
  return investment
}