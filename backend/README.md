<<<<<<< HEAD
## Chạy backend
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
=======
# Sudoku Backend Application

This is a FastAPI-based backend application for a Sudoku game. It provides functionalities for user authentication, game management, and real-time interactions through WebSockets.

## Project Structure

```
sudoku-backend/
├── src/
│   ├── main.py                     # Entry point for the FastAPI application
│   ├── config/
│   │   └── db.py                  # Database configuration and connection logic
│   ├── models/
│   │   ├── user.py                 # User model and schema
│   │   ├── match.py                # Match model and schema
│   │   └── sudoku_board.py         # Sudoku board model and schema
│   ├── services/
│   │   ├── sudoku_service.py       # Business logic for Sudoku operations
│   │   ├── match_service.py        # Business logic for match operations
│   │   └── database_service.py     # Database interaction logic
│   ├── sockets/
│   │   └── socket_server.py        # WebSocket server for real-time communication
│   ├── routes/
│   │   ├── auth_api.py             # Authentication-related routes
│   │   ├── user_api.py             # User management routes
│   │   ├── leaderboard_api.py       # Leaderboard management routes
│   │   └── history_api.py          # User history routes
│   └── utils/
│       └── jwt.py                  # JWT utility functions
├── requirements.txt                 # Project dependencies
├── .env.example                     # Example environment variables
└── README.md                       # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd sudoku-backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in the necessary values.

5. **Run the application:**
   ```
   uvicorn src.main:app --reload
   ```

## Usage

- Access the API documentation at `http://localhost:8000/docs` after starting the server.
- Use the authentication routes to register and log in users.
- Interact with the Sudoku game through the provided endpoints.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.
>>>>>>> edf68831ed3dfad315959674b2c89d1151d3f4d9
