import PropTypes from 'prop-types';

function Battler({battler}) {
  const {name, health, hit, dodge, damage, defense, 
    critChance, critDamage, multistrike, healing} = battler;
  console.table(battler);

  const numWithCommas = num => {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  }

  const numToPercentage = num => {
    return (num * 100).toString() + '%';
  }
  
  return (
    <div class="battler">
      <h4>{name}</h4>
      <p>HP: {numWithCommas(health)}</p>
      <p>HIT: {numToPercentage(hit)}    DOD: {numToPercentage(dodge)}</p>
      <p>DMG: {numWithCommas(damage)}    DEF: {numWithCommas(defense)}</p>
      <p>CHC: {numToPercentage(critChance)}    CHD: {numToPercentage(critDamage)}</p>
      <p>MS: {numToPercentage(multistrike)}    HL: {numToPercentage(healing)}</p>
    </div>
  );
}

Battler.propTypes = {
  battler: PropTypes.shape({
    name: PropTypes.string,
    health: PropTypes.number,
    hit: PropTypes.number,
    dodge: PropTypes.number,
    damage: PropTypes.number,
    defense: PropTypes.number,
    critChance: PropTypes.number,
    critDamage: PropTypes.number,
    multistrike: PropTypes.number,
    healing: PropTypes.number,
  }).isRequired
}

export default Battler;