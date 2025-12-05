import { useState, useEffect, useMemo } from 'react'
import api from "./api/api.ts"
import './App.css'

interface Pokemon {
  id: string 
  name: string
  height: number
  weight: number
  sprites: Record<string, string | null>
  types: Array<{
    type: {
      name: string
    }
  }>
}

// Helper function to get a random sprite from the sprites object
const getRandomSprite = (sprites: Record<string, string | null>): string => {
  // Filter out null values and nested objects, get only direct sprite URLs
  const spriteUrls = Object.entries(sprites)
    .filter(([key, value]) => 
      typeof value === 'string' && 
      value !== null && 
      !key.includes('other') && 
      !key.includes('versions')
    )
    .map(([, url]) => url as string)
  
  // Return random sprite or fallback to front_default
  return spriteUrls.length > 0 
    ? spriteUrls[Math.floor(Math.random() * spriteUrls.length)]
    : sprites.front_default as string
}


function App() {
  const [data, setData] = useState<Pokemon[]>([])
  const [query, setQuery] = useState<string>("")

  // Memoize pokemon with random sprites selected once
  const pokemonWithSprites = useMemo(() => 
    data.map(pokemon => ({
      ...pokemon,
      randomSprite: getRandomSprite(pokemon.sprites)
    })),
    [data]
  )
  
  const filteredMons = useMemo(() => {
    return pokemonWithSprites.filter(p => 
      p.id == query ||
      p.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, pokemonWithSprites])

  useEffect(() => {
    const get_poke = async () => {
      try {
        const response = await api.get("/pokemon")
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
              <img src={pokemon.randomSprite} alt={pokemon.name} className="w-24 h-24 object-contain" />
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Height:</span> {pokemon.height}</p>
              <p><span className="font-medium">Weight:</span> {pokemon.weight}</p>
              <p><span className="font-medium">Types:</span> {pokemon.types.map(t => t.type.name).join(', ')}</p>
            </div>
            <details className="mt-3 group">
              <summary className="cursor-pointer text-xs text-blue-600 font-medium hover:text-blue-800">Full JSON</summary>
              <pre className="text-left max-h-[200px] overflow-auto text-xs bg-gray-900 text-gray-100 p-2 rounded mt-2">
                {JSON.stringify(pokemon, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </aside>
    </div>
  )
}

export default App
