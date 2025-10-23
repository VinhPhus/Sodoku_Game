from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from typing import List

app = FastAPI()

# Store connected WebSocket clients
clients: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await broadcast(data)
    except WebSocketDisconnect:
        clients.remove(websocket)

async def broadcast(message: str):
    for client in clients:
        await client.send_text(message)

@app.get("/")
async def get():
    return HTMLResponse("""
    <html>
        <head>
            <title>WebSocket Test</title>
        </head>
        <body>
            <h1>WebSocket Test</h1>
            <form action="" onsubmit="sendMessage(event)">
                <input type="text" id="messageText" autocomplete="off"/>
                <button>Send</button>
            </form>
            <ul id='messages'></ul>
            <script>
                var ws = new WebSocket("ws://localhost:8000/ws");
                ws.onmessage = function(event) {
                    var messages = document.getElementById('messages');
                    var message = document.createElement('li');
                    message.appendChild(document.createTextNode(event.data));
                    messages.appendChild(message);
                };
                function sendMessage(event) {
                    var input = document.getElementById("messageText");
                    ws.send(input.value);
                    input.value = '';
                    event.preventDefault();
                }
            </script>
        </body>
    </html>
    """)