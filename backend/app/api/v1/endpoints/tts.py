from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import edge_tts
import io

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    is_male: bool = False

@router.post("")
async def generate_tts(request: TTSRequest):
    # Using good multilingual voices
    voice = "en-US-ChristopherNeural" if request.is_male else "en-US-AriaNeural"
    
    communicate = edge_tts.Communicate(request.text, voice)
    
    async def audio_stream():
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")
