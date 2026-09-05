import logging
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types
from google.genai.errors import APIError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from .config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

T = TypeVar('T', bound=BaseModel)

def get_client() -> Optional[genai.Client]:
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not set. LLM client cannot be initialized.")
        return None
    return genai.Client(api_key=settings.GEMINI_API_KEY)

# Retry logic: Retry on API errors up to 3 times, with exponential backoff
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(APIError),
    reraise=True
)
async def _call_gemini_structured(
    client: genai.Client, 
    system_instruction: str, 
    user_prompt: str, 
    schema: Type[T], 
    model: str
) -> T:
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        response_schema=schema,
    )
    
    response = await client.aio.models.generate_content(
        model=model,
        contents=user_prompt,
        config=config
    )
    
    # Google GenAI parses it automatically into the pydantic model if response_schema is provided
    if not response.parsed:
        raise ValueError("Failed to parse structured output from Gemini.")
        
    return response.parsed

async def generate_structured_output_async(
    system_instruction: str, 
    user_prompt: str, 
    schema: Type[T], 
    model: str = settings.DEFAULT_MODEL
) -> T:
    """
    Calls the Gemini LLM asynchronously and guarantees the output matches the provided Pydantic schema.
    """
    client = get_client()
    if not client:
        raise ValueError("Missing API Key: Cannot generate structured output.")

    try:
        logger.info(f"Generating structured output using model: {model}")
        result = await _call_gemini_structured(client, system_instruction, user_prompt, schema, model)
        logger.info("Successfully generated and validated structured output.")
        return result
    except APIError as e:
        logger.error(f"Gemini API Error after retries: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error generating structured output: {str(e)}")
        raise e
