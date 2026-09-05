from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import edge_tts
import io

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    is_male: bool = False

async def _tts_stream(text: str, is_male: bool):
    voice = "en-US-ChristopherNeural" if is_male else "en-US-AriaNeural"

    communicate = edge_tts.Communicate(text, voice)

    async def audio_stream():
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")

@router.post("")
async def generate_tts(request: TTSRequest):
    return await _tts_stream(request.text, request.is_male)

@router.get("")
async def generate_tts_get(text: str, gender: str = "female"):
    return await _tts_stream(text, gender.lower() == "male")
