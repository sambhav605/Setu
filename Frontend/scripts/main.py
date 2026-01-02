from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    type: str

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Process your AI logic here with Python libraries (langchain, etc.)
    last_msg = request.messages[-1].content
    return {"content": f"Python AI says: I processed your query about {last_msg}"}
