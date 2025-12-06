import { useState, useEffect, useMemo } from 'react'
import api from "./api/api.ts"
import './App.css'

interface Pokemon {
  id: number
  number: number 
  name: string
  sprites: string
  description: string
}

function App() {
  const [data, setData] = useState<Pokemon[]>([])
  const [query, setQuery] = useState<string>("")

  const filteredMons = useMemo(() => {
    return data.filter(p => 
      p.number.toString() == query ||
      p.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, data])

  useEffect(() => {
    const get_poke = async () => {
      try {
        const response = await api.get("/simple")
        setData(response.data)  // axios response has data in .data property
      } catch (error) {
        console.error("Error fetching pokemon:", error)
      }
    }
    get_poke()
  }, [])
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Main content area - takes up remaining space on the left */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800">Pokemon Explorer</h1>
        <p className="text-gray-600 mt-2">Select a Pokemon from the sidebar to view details.</p>
      </main>

      {/* Sidebar - fixed width, sits on the right */}
      <aside className="w-1/5 bg-red-400 border-l border-gray-200 flex flex-col h-screen overflow-y-auto sticky top-0">
        <input type="text" value={query} onChange={(e) => setQuery(e.currentTarget.value)}/>
        {filteredMons.map((pokemon) => (
          <div key={pokemon.id} className="m-5 p-4 border border-gray-300 rounded-lg bg-yellow-200 shadow-sm">
            <h2 className="font-bold text-lg text-center mb-2">{pokemon.name.toUpperCase()}</h2>
            <div className="flex justify-center bg-gray-50 rounded-md mb-2">
              <img src={pokemon.sprites} alt={pokemon.name} className="w-24 h-24 object-contain" />
            </div> 
          </div>
        ))}
      </aside>
    </div>
  )
}

export default App
