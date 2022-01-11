import Investment from '../models/investment.model.js'
import Player from '../models/player.model.js'
import axios from 'axios'
import startOfDay from 'date-fns/startOfDay/index.js'
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
  console.log('POST createInvestment')
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
    .then(async response => {
      //Make new investment record
      const returnedInfo = response.data
      const record = {
        playerId: playerId,
        partner: returnedInfo.partners.reduce(getPartnerInvestment, 0) + returnedInfo.currency.shattered_partner_gold,
        numPartners: returnedInfo.partners.length,
        fighter: returnedInfo.fighters.reduce(getFighterInvestment, 0) + returnedInfo.currency.shattered_fighter_gold,
        numFighters: returnedInfo.fighters.length,
        cave: getCaveInvestment(returnedInfo.fighterCaveTools),
        house: getHouseInvestment(returnedInfo.house),
        pet: getPetInvestment(returnedInfo.playerPetsData),
        numPets: returnedInfo.pets.length,
        equipmentSlot: getEquipmentSlotInvestment(returnedInfo.equipmentSlots),
        partnerRelicBoost: ["hunting_boost","mining_boost","woodcutting_boost","stonecarving_boost"].reduce(
          (investment, boost) => {
            return getRelicInvestment(returnedInfo.boosts[boost]) + investment
          }, 0) + returnedInfo.currency.shattered_partner_relics,
        battleRelicBoost: ["critChance", "critDamage", "multistrike", "healing", "defense"].reduce(
          (investment, boost) => {
            return getRelicInvestment(returnedInfo.boosts[boost]) + investment
          }, 0) + returnedInfo.currency.shattered_battling_relics,
        homestead: ['mine_level', 'farm_level', 'logging_level', 'fishing_level'].reduce(
          (investment, boost) => {
            return getHomesteadInvestment(returnedInfo.playerHomesteadData[boost]) + investment
          }, 0)
      }
      record.total = {
        gold: 
          record.partner + getUnitInvestment(record.numPartners) + record.fighter + getUnitInvestment(record.numFighters) 
          + record.pet + getUnitInvestment(record.numPets),
        resource:
          record.house + record.equipmentSlot + record.homestead,
        relic:
          record.partnerRelicBoost + record.battleRelicBoost,
        diamond:
          record.cave
      }
      const newInvestment = new Investment(record)
      try {
        //await newInvestment.save()
        res.status(201).json({...newInvestment, message: 'Added new investment record'})
      } catch(error) {
        res.status(409).json({message: error.message})
      }
    })
    .catch(err => {
      console.log('error:', err)
      res.status(400).json({error: 'Invalid player API key'})
    })
  } catch(error) {
    console.log(error)
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

export const getFighterInvestment = (investment, fighter) => {
  /*
  * Returns the total amount of gold invested into a given fighter,
  * adding onto the total investment amount
  */
  const stats = ['health', 'damage', 'hit', 'dodge', 'defense', 'crit_damage']
  return investment + stats.reduce(
    (prev, stat) => {
      if(fighter[stat] < 1) return 0
      return prev + Math.round(10000 * (fighter[stat] * (fighter[stat] + 1) / 2))
    }, 
    0)
}

export const getCaveInvestment = caves => {
  /**
   * returns the total number of diamonds invested in the cave
   */
  const caveUpgrades = ['archeology', 'brush', 'trowel', 'map', 'backpack', 'torch', 'scouting', 'spade', 'knife']
  return caveUpgrades.reduce(
    (diamonds, tool) => {
      return diamonds + caves[tool] * (caves[tool] + 1) / 2
    }, 0)

}

export const getHouseInvestment = houseData => {
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
  return Math.round(houseInvestment * 4)
}

export const getPetInvestment = petInfo => {
  return (petInfo.farm_strength*(petInfo.farm_strength + 1) / 2 + 
    petInfo.farm_health * (petInfo.farm_health + 1) / 2 + 
    petInfo.farm_agility * (petInfo.farm_agility + 1) / 2 + 
    petInfo.farm_dexterity * (petInfo.farm_dexterity + 1) / 2) * 50000
}

export const getEquipmentSlotInvestment = eqSlots => {
  const eqSlotLevels = [
    eqSlots.left_hand_level, eqSlots.right_hand_level, 
    eqSlots.head_level, eqSlots.body_level, 
    eqSlots.hands_level, eqSlots.legs_level, eqSlots.feet_level
  ]

  return Math.round(eqSlotLevels.reduce(
    (investment, level) => {
      return investment + 250 * ((1 - 1.1**level) / -0.1)
    }
  , 0))
}

export const getRelicInvestment = level => {
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

export const getHomesteadInvestment = level => {
  if(level <= 0) return 0

  if(level <= 1750) {
    let investment = -1000
    let increment = 1000
    let initCost = 0

    for(let i = 0; i < Math.round(level / 250) + 1; i++) {
      const base = level >= (i + 1) * 250 ? 250 : level % 250
      investment += increment * (base * (base + 1) / 2) + (initCost * base)
      initCost += increment * 250
      increment += 1000 //Increases by 1000 every 250 levels
    }
    return investment
  } else { // Level > 1750 
    let investment = 4378499000 //Investment at level 1750
    let increment = 8010
    let initCost = 7000000

    for(let i = 7; i < Math.round(level / 250) + 1; i++) {
      const base = level >= (i +1) ? 250 : level % 250
      investment += increment * (base * (base + 1) / 2) + (initCost * base)
      initCost += increment * 250
      //Past 1750, increment also starts to add in consecutive sums (n * (n+1) / 2)
      increment = ((i - 5) * (i - 4) / 2) * 10 + (i + 2) * 1000 
    }
    return investment
  }
}

export const getUnitInvestment = num => {
  /**
   * Returns the total amount of gold invested into buying num units.
   * Units can be pets, partners, or fighters.
   */
  return parseInt('1'.repeat(num) + '0000')
}