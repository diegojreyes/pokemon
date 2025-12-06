from fastapi import FastAPI, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
from database import engine, session_local, get_db
from typing import Annotated
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import httpx
import asyncio
import json
import models

# Add this line to create the tables in the database
models.Base.metadata.create_all(bind=engine)

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

db_dep = Annotated[Session, Depends(get_db)]


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
        tasks = [create_task(str(i), semaphore) for i in range(1, 152)]  
        res = await asyncio.gather(*tasks)
        app.state.redis.set("pokemon", json.dumps(res))
        return res
    return json.loads(res)

@app.get("/simple")
def get_simple(db: db_dep):
    res = app.state.redis.get("simple")
    if not res:
        data = db.query(models.Pokemon).all()
        app.state.redis.set("simple", json.dumps(jsonable_encoder(data)))
        return data
    return json.loads(res)
    
@app.post("/pokemon")
def upload(pokemon: models.Pokemon_Base, db: db_dep):
    try:
        # Assuming your DB model is named Pokemon
        db_pokemon = models.Pokemon(**pokemon.model_dump()) 
        db.add(db_pokemon)
        db.commit()
        db.refresh(db_pokemon)
        return db_pokemon
    except Exception as e:
        # This prints the error to your terminal
        print(f"SERVER ERROR: {e}") 
        # This sends the specific error back to Swagger UI
        raise HTTPException(status_code=500, detail=str(e))
