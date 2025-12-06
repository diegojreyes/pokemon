from fastapi import FastAPI, HTTPException, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from redis import Redis
from database import engine, session_local, get_db
from typing import Annotated
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
import asyncio
import json
import os    
import httpx 
import models

models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    app.state.redis = Redis.from_url(redis_url, decode_responses=True)
    
    app.state.client = httpx.AsyncClient()
    
    yield
    
    await app.state.client.aclose()
    app.state.redis.close()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173",
                   "https://pokemon-static-p77n.onrender.com"
                   ],
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
    try:
        res = app.state.redis.get("simple")
        if res:
            return json.loads(res)
    except Exception as e:
        print(f"Redis connection failed (skipping cache): {e}")

    data = db.query(models.Pokemon).all()
    encoded_data = jsonable_encoder(data)
    
    try:
        app.state.redis.set("simple", json.dumps(encoded_data))
    except Exception as e:
        print(f"Could not save to Redis: {e}")
    
    return encoded_data
    
@app.post("/pokemon")
def upload(pokemon: models.Pokemon_Base, db: db_dep):
    try:
        db_pokemon = models.Pokemon(**pokemon.model_dump()) 
        db.add(db_pokemon)
        db.commit()
        db.refresh(db_pokemon)
        return db_pokemon
    except Exception as e:
        print(f"SERVER ERROR: {e}") 
        raise HTTPException(status_code=500, detail=str(e))
