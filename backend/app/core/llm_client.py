import json
import logging
import re
from typing import Optional, Type, TypeVar

import httpx
from pydantic import BaseModel, ValidationError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from .config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

T = TypeVar('T', bound=BaseModel)

class LLMRequestError(RuntimeError):
    pass

def _base_url() -> str:
    return (settings.LLM_BASE_URL or "http://127.0.0.1:8081/openai/v1").rstrip("/")

def _headers(api_key: Optional[str]) -> dict:
    effective_key = api_key or settings.GEMINI_API_KEY or "sk-gemini"
    return {
        "Authorization": f"Bearer {effective_key}",
        "Content-Type": "application/json",
    }

def _strip_fences(text: str) -> str:
    text = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return fence.group(1) if fence else text

# Retry logic: Retry on API errors up to 3 times, with exponential backoff
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((LLMRequestError, httpx.HTTPError)),
    reraise=True
)
async def _call_gemini_structured(
    system_instruction: str,
    user_prompt: str,
    schema: Type[T],
    model: str,
    api_key: Optional[str],
) -> T:
    schema_text = json.dumps(schema.model_json_schema())
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    system_instruction
                    + "\n\nRespond with a single raw JSON object (no markdown fences) "
                      "that validates against this JSON Schema exactly:\n"
                    + schema_text
                ),
            },
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
    }

    url = f"{_base_url()}/chat/completions"
    async with httpx.AsyncClient(timeout=180) as client:
        resp = await client.post(url, headers=_headers(api_key), json=payload)

    if resp.status_code >= 400:
        raise LLMRequestError(f"LLM HTTP {resp.status_code}: {resp.text[:500]}")

    try:
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, ValueError) as e:
        raise LLMRequestError(f"Unexpected LLM response shape: {resp.text[:500]}") from e

    if not content:
        raise LLMRequestError("LLM returned empty content")

    try:
        return schema.model_validate_json(_strip_fences(content))
    except ValidationError as e:
        raise LLMRequestError(f"LLM output did not match schema: {e}") from e

async def generate_structured_output_async(
    system_instruction: str,
    user_prompt: str,
    schema: Type[T],
    model: str = settings.DEFAULT_MODEL,
    api_key: Optional[str] = None
) -> T:
    """
    Calls the local Gemini-compatible backend (gemini-web-to-api via OpenAI chat completions)
    and guarantees the output matches the provided Pydantic schema.
    Pass `api_key` to use a per-student key instead of the shared server key.
    """
    logger.info(f"Generating structured output using model: {model}")
    try:
        result = await _call_gemini_structured(system_instruction, user_prompt, schema, model, api_key)
        logger.info("Successfully generated and validated structured output.")
        return result
    except Exception as e:
        logger.error(f"Unexpected error generating structured output: {str(e)}")
        raise e