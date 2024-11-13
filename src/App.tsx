import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Transcription from './components/Transcription'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <Transcription/>
      </div>
     
    </>
  )
}

export default App
