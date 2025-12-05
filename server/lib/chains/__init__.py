"""
LangChain chains for the AI Tutor.

This module contains reusable chains for various teaching patterns,
including the Socratic method, concept explanation, and problem solving.
"""

from .socratic_chain import create_socratic_chain

__all__ = ["create_socratic_chain"]
