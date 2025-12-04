from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
import httpx
import asyncio
import json
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.redis = Redis(host="localhost", port=6379)
    app.state.client = httpx.AsyncClient(
        timeout=60.0,  
        limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
    )
    yield
    # Shutdown
    await app.state.client.aclose()
    app.state.redis.close()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173",
                   ],  # Add 127.0.0.1
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/pokemon")
async def get_pokemon():
    res = app.state.redis.get("pokemon")
    
    async def create_task(id: str, semaphore):
        async with semaphore:
            response = await app.state.client.get(f"https://pokeapi.co/api/v2/pokemon/{id}")
            response.raise_for_status()
            return response.json()

    if not res:
        semaphore = asyncio.Semaphore(3)  
        tasks = [create_task(str(i), semaphore) for i in range(1, 152)]  # Fetch 20 Pokemon
        res = await asyncio.gather(*tasks)
        app.state.redis.set("pokemon", json.dumps(res))
        return res
    return json.loads(res)
    
