"""
Conversation Context Analyzer Module
Analyzes conversation context to determine message independence and relevance
"""

import logging
from typing import List, Dict, Optional
from .llm_client import MistralClient

logger = logging.getLogger(__name__)


class ConversationContextAnalyzer:
    """
    Analyzes conversation context to determine:
    1. Whether a message is legal-related or casual (greetings, thanks, etc.)
    2. Whether a message is independent or dependent on previous context
    3. Generates summaries for dependent conversations
    """

    def __init__(self, model: str = "mistral-small-latest"):
        """
        Initialize the context analyzer

        Args:
            model: Mistral model to use for analysis
        """
        self.llm_client = MistralClient(model=model)
        logger.info(f"ConversationContextAnalyzer initialized with model: {model}")

    def is_non_legal_query(self, message: str) -> bool:
        """
        Determine if a message is non-legal (greetings, thanks, casual conversation)

        Args:
            message: The user's message

        Returns:
            True if non-legal, False if legal-related
        """
        try:
            system_prompt = """You are a classifier that determines if a message is related to legal matters or is casual conversation.

Casual conversation includes:
- Greetings (hi, hello, hey, good morning, etc.)
- Thanks/gratitude (thank you, thanks, appreciate it, etc.)
- Goodbye (bye, see you, goodbye, etc.)
- Small talk (how are you, what's up, etc.)
- Acknowledgments (ok, okay, yes, no, sure, etc.)

Legal-related includes:
- Questions about laws, regulations, rights
- Legal issues, disputes, cases
- Questions about legal procedures
- Anything requiring legal information

Respond with ONLY one word: "LEGAL" or "NON_LEGAL"
"""

            prompt = f'Message: "{message}"\n\nClassify this message:'

            response = self.llm_client.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1  # Low temperature for consistent classification
            )

            result = response.strip().upper()
            is_non_legal = "NON_LEGAL" in result or "NON-LEGAL" in result

            logger.info(f"Non-legal query check: '{message[:50]}...' -> {is_non_legal}")
            return is_non_legal

        except Exception as e:
            logger.error(f"Error in is_non_legal_query: {e}")
            # On error, assume it's legal-related to be safe
            return False

    def is_independent_query(self, current_msg: str, context: List[Dict[str, str]]) -> bool:
        """
        Determine if the current message is independent of the conversation history

        Args:
            current_msg: The current user message
            context: List of previous messages [{"role": "user"/"assistant", "content": "..."}]

        Returns:
            True if independent, False if dependent on previous context
        """
        try:
            # If no context, it's independent
            if not context or len(context) == 0:
                return True

            # Format conversation history
            conversation_text = self._format_context(context)

            system_prompt = """You are an analyzer that determines if a message is independent or dependent on previous conversation.

INDEPENDENT messages:
- Introduce a completely new topic
- Can be understood without previous context
- Are self-contained questions

DEPENDENT messages:
- Reference previous discussion (pronouns like "he", "she", "it", "they", "this", "that")
- Continue or expand on previous topic
- Ask follow-up questions
- Require previous context to be understood

Respond with ONLY one word: "INDEPENDENT" or "DEPENDENT"
"""

            prompt = f"""Previous conversation:
{conversation_text}

Current message: "{current_msg}"

Is the current message independent or dependent on the conversation?"""

            response = self.llm_client.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1  # Low temperature for consistent classification
            )

            result = response.strip().upper()
            is_independent = "INDEPENDENT" in result

            logger.info(f"Independence check: '{current_msg[:50]}...' -> {'independent' if is_independent else 'dependent'}")
            return is_independent

        except Exception as e:
            logger.error(f"Error in is_independent_query: {e}")
            # On error, assume independent to avoid incorrect context merging
            return True

    def summarize_conversation(self, current_msg: str, context: List[Dict[str, str]]) -> str:
        """
        Create a concise summary combining conversation context and current message
        This summary will be sent to the RAG pipeline

        Args:
            current_msg: The current user message
            context: List of previous messages

        Returns:
            A concise query suitable for RAG retrieval
        """
        try:
            conversation_text = self._format_context(context)

            system_prompt = """You are a legal assistant that creates concise, clear queries for a legal information retrieval system.

Your task: Combine the conversation history with the current message to create ONE clear, self-contained legal query.

Requirements:
- Include all relevant context from the conversation
- Replace pronouns with actual entities (e.g., "he" -> "my brother")
- Keep it concise (1-3 sentences)
- Make it specific and searchable
- Focus on the legal aspect

Example:
Conversation:
Human: I had a fight with my brother over property
Assistant: [discusses property dispute laws]
Human: He is making fake allegations

Output: "My brother is making fake allegations against me in a property dispute. What are my legal rights and how should I respond?"
"""

            prompt = f"""Conversation history:
{conversation_text}

Current message: "{current_msg}"

Create a single, clear legal query:"""

            response = self.llm_client.generate_response(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.3  # Slightly higher for natural query generation
            )

            summarized_query = response.strip()

            logger.info(f"Summarized query: {summarized_query[:100]}...")
            return summarized_query

        except Exception as e:
            logger.error(f"Error in summarize_conversation: {e}")
            # Fallback: return the current message as-is
            return current_msg

    def _format_context(self, context: List[Dict[str, str]], max_messages: int = 10) -> str:
        """
        Format conversation context for LLM consumption

        Args:
            context: List of message dictionaries
            max_messages: Maximum number of messages to include

        Returns:
            Formatted conversation string
        """
        # Take only the most recent messages
        recent_context = context[-max_messages:] if len(context) > max_messages else context

        formatted_lines = []
        for msg in recent_context:
            role = msg.get("role", "")
            content = msg.get("content", "")

            if role == "user":
                formatted_lines.append(f"Human: {content}")
            elif role == "assistant":
                formatted_lines.append(f"Chatbot: {content}")

        return "\n".join(formatted_lines)
