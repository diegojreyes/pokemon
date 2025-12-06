import requests
import json

def main():
    data = requests.get("http://127.0.0.1:8000/pokemon").json()    
    arr = []
    for p in data:
        url_fetch = requests.get(f"{p["species"]["url"]}").json()
        requests.post("http://127.0.0.1:8000/pokemon", json={
            "name" : p["name"],
            "number": p["id"],
            "sprites": p["sprites"]["front_default"],
            "description": url_fetch["flavor_text_entries"][0]["flavor_text"]
        })
     
if __name__ == "__main__":
    main()