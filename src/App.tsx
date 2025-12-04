import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import api from "./api/api.ts"
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState<string[]>([])

  useEffect(() => {
    const get_poke = async () => {
      try {
        setData(await Promise.all(Array.from({
          "length" : 151},
          async (_, i) => {
          const response = await api.get((i + 1).toString())
          return JSON.stringify(response.data)
        })
        ))
      } catch (error) {
        console.error("Error fetching pokemon:", error)
      }
    }
    get_poke()
  }, [])
  
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div> 
      <div className="read-the-docs">
        {data.map((pokemonJson, index) => (
          <pre key={index} style={{ textAlign: 'left', maxHeight: '200px', overflow: 'auto', borderBottom: '1px solid #ccc' }}>
            {pokemonJson}
          </pre>
        ))}
      </div>
    </>
  )
}

export default App
