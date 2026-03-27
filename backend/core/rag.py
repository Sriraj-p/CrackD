"""
CrackD Local RAG
Reads rag_docs/ at startup and provides keyword-based retrieval.
Replaces Vertex AI RAG corpus from the original hackathon build.
"""

import os

RAG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "rag_docs")


def retrieve_interview_frameworks(query: str) -> str:
    """Retrieves relevant interview frameworks and best practices from the knowledge base.

    Args:
        query: The search query to find relevant interview frameworks.

    Returns:
        Relevant interview framework content from the knowledge base.
    """
    if not os.path.isdir(RAG_DIR):
        return "No RAG documents directory found."

    results = []
    query_lower = query.lower()

    for filename in os.listdir(RAG_DIR):
        filepath = os.path.join(RAG_DIR, filename)
        if not os.path.isfile(filepath):
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                # Match if any query word appears in the document
                if any(word in content.lower() for word in query_lower.split()):
                    results.append(content)
        except Exception:
            continue

    if results:
        return "\n\n---\n\n".join(results)
    return "No relevant frameworks found for this query."
