import Battler from './components/Battler';
import exampleBattler from './data/exampleBattler';

function App() {
  return (
    <>
    <div class="battleInfo">
      <Battler battler={exampleBattler}/>
      <Battler battler={exampleBattler}/>
    </div>
    </>
  )
}

export default App