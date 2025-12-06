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
  const [mon, setMon] = useState<Pokemon | null>(null)

  const filteredMons = useMemo(() => {
    return data.filter(p => 
      p.number.toString() == query ||
      p.name.toLowerCase().includes(query.toLowerCase()))
  }, [query, data])


  useEffect(() => {
    const get_poke = async () => {
      try {
        const response = await api.get("/simple")
        setData(response.data) 
      } catch (error) {
        console.error("Error fetching pokemon:", error)
      }
    }
    get_poke()
  }, [])
  
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        {mon ? (
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center border-t-[12px] border-red-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-gray-50 rounded-full opacity-50 z-0 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="bg-linear-to-b from-slate-50 to-slate-100 rounded-full w-56 h-56 mx-auto mb-6 flex items-center justify-center p-6 border-4 border-white shadow-inner">
                <img 
                  src={mon.sprites} 
                  alt={mon.name} 
                  className="w-full h-full object-contain drop-shadow-xl" 
                />
              </div>
              
              <h1 className="text-5xl font-black text-gray-800 mb-3 capitalize tracking-tight">{mon.name}</h1>
              
              <span className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-lg font-bold font-mono mb-8 shadow-md">
                #{String(mon.number).padStart(3, '0')}
              </span>
              
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <p className="text-xl text-gray-700 leading-relaxed italic font-medium">
                  "{[...mon.description].map(c => /[^\n\f]+/g.test(c) ? c : " ").join('')}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-red-500 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-400 mb-2">Pokemon Explorer</h1>
            <p>Select a Pokemon from the sidebar to view details.</p>
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside className="w-80 bg-white border-l-4 border-red-700 flex flex-col h-full shadow-2xl z-10">
        {/* Red Pokedex Header */}
        <div className="p-5 bg-red-600 sticky top-0 z-10 shadow-md">
          <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
            Pokedex Data
          </h2>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search Pokemon..."
            className="w-full px-4 py-2.5 bg-white border-2 border-red-700 focus:border-yellow-400 rounded-lg shadow-inner outline-none text-sm font-medium placeholder-gray-400"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
          {filteredMons.map((pokemon) => (
            <div 
              key={pokemon.id} 
              onClick={() => setMon(pokemon)}
              className={`p-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 border-2 ${
                mon?.id === pokemon.id 
                  ? 'bg-yellow-50 border-yellow-400 shadow-md scale-[1.02]' 
                  : 'bg-white border-transparent hover:border-red-300 hover:shadow-sm'
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-lg shrink-0 p-1 border border-gray-100 shadow-sm">
                <img src={pokemon.sprites} alt={pokemon.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-700 capitalize truncate text-sm">{pokemon.name}</h2>
                <p className="text-xs text-gray-400 font-mono font-bold">#{String(pokemon.number).padStart(3, '0')}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default App
