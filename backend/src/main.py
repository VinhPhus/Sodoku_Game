from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import auth_api, user_api, leaderboard_api, history_api

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this as needed for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_api.router)
app.include_router(user_api.router)
app.include_router(leaderboard_api.router)
app.include_router(history_api.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sudoku backend API!"}