# ─────────────────────────────────────────────────────────
# FILE: backend/core/llm.py
# Dual-client LLM wrapper — abstracts OpenAI and Anthropic
# behind a unified interface so the rest of the codebase
# doesn't care which provider is being used.
# ─────────────────────────────────────────────────────────

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from typing import Any

from openai import OpenAI
from anthropic import Anthropic


# ─── Response ────────────────────────────────────────────

@dataclass
class LLMResponse:
    """Provider-agnostic response object."""
    content: str
    model: str
    provider: str
    usage: dict = field(default_factory=dict)
    parsed: dict | None = None


# ─── OpenAI client ───────────────────────────────────────

class OpenAIClient:
    """Thin wrapper around the OpenAI SDK."""

    provider = "openai"

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self._client = OpenAI(api_key=self.api_key)

    def chat(
        self,
        messages: list[dict],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> LLMResponse:
        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        choice = response.choices[0]
        return LLMResponse(
            content=choice.message.content,
            model=response.model,
            provider=self.provider,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
            },
        )

    def chat_json(
        self,
        messages: list[dict],
        json_schema: dict[str, Any],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> LLMResponse:
        """Chat completion with OpenAI structured output (response_format).

        `json_schema` is the value for response_format.json_schema.schema.
        The response is guaranteed to conform to the schema.
        """
        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "analysis_result",
                    "strict": True,
                    "schema": json_schema,
                },
            },
        )
        choice = response.choices[0]
        parsed = json.loads(choice.message.content)
        return LLMResponse(
            content=choice.message.content,
            model=response.model,
            provider=self.provider,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
            },
            parsed=parsed,
        )

    def ping(self) -> bool:
        """Lightweight check that the API key is valid."""
        try:
            self._client.models.list()
            return True
        except Exception:
            return False


# ─── Anthropic client ────────────────────────────────────

class AnthropicClient:
    """Thin wrapper around the Anthropic SDK."""

    provider = "anthropic"

    def __init__(self, api_key: str | None = None, model: str | None = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.model = model or os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")
        self._client = Anthropic(api_key=self.api_key)

    def chat(
        self,
        messages: list[dict],
        *,
        temperature: float = 0.7,
        max_tokens: int = 4000,
    ) -> LLMResponse:
        # Anthropic expects 'system' as a top-level param, not inside messages.
        system_text = ""
        chat_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_text += msg["content"] + "\n"
            else:
                chat_messages.append({"role": msg["role"], "content": msg["content"]})

        response = self._client.messages.create(
            model=self.model,
            system=system_text.strip(),
            messages=chat_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return LLMResponse(
            content=response.content[0].text,
            model=response.model,
            provider=self.provider,
            usage={
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
        )

    def ping(self) -> bool:
        """Lightweight check that the API key is valid."""
        try:
            self._client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[{"role": "user", "content": "ping"}],
            )
            return True
        except Exception:
            return False


# ─── Provider registry ───────────────────────────────────

_clients: dict[str, OpenAIClient | AnthropicClient] = {}


def get_client(provider: str = "openai") -> OpenAIClient | AnthropicClient:
    """Return a cached client instance for the given provider.

    Usage:
        from backend.core.llm import get_client
        client = get_client("anthropic")
        resp = client.chat(messages=[...])
    """
    if provider not in _clients:
        if provider == "openai":
            _clients[provider] = OpenAIClient()
        elif provider == "anthropic":
            _clients[provider] = AnthropicClient()
        else:
            raise ValueError(f"Unknown LLM provider: {provider!r}. Use 'openai' or 'anthropic'.")
    return _clients[provider]


def check_providers() -> dict[str, bool]:
    """Check connectivity for all configured providers. Used by health endpoint."""
    results = {}
    if os.getenv("OPENAI_API_KEY"):
        results["openai"] = get_client("openai").ping()
    else:
        results["openai"] = False
    if os.getenv("ANTHROPIC_API_KEY"):
        results["anthropic"] = get_client("anthropic").ping()
    else:
        results["anthropic"] = False
    return results
