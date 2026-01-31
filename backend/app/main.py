# import modules
# make the api endpoint

from fastapi import FastAPI

app = FastAPI()
@app.get("/")
def process():
    return {"status":"OK!!!"}

from fastapi import FastAPI, Response

@app.get("/custom")
def custom_header_endpoint(response: Response):
    # Add a custom sticker
    response.headers["X-Project-Name"] = "Curamind"
    response.headers["X-Developer"] = "Ahmad"
    
    return {"message": "Look at my headers!"}