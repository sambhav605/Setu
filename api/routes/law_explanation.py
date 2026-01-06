from fastapi import APIRouter, HTTPException, Depends
from api.core.deps import get_current_user
from api.schemas import (
    ExplanationRequest,
    ExplanationResponse,
    ChatRequest,
    ChatResponse,
    MessageCreate
)
from module_a.interface import LawExplanationAPI
from api.routes.chat_history import get_recent_context
from api.routes.supabase_auth import get_supabase_admin

router = APIRouter()
law_api = LawExplanationAPI()

@router.post("/explain", response_model=ExplanationResponse)
async def explain_law(request: ExplanationRequest, user: dict = Depends(get_current_user)):
    try:
        result = law_api.get_explanation(request.query)

        if "error" in result:
             # If it's a handled error from the module, we might still want to return 200 with error info
             # or 500 depending on design. Let's stick to the schema.
             # If result has error key, it might not match ExplanationResponse structure fully if we aren't careful.
             # Module A returns a dict with keys matching schema mostly.
             pass

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat_with_context(
    request: ChatRequest,
    user: dict = Depends(get_current_user)
):
    """
    Context-aware chat endpoint that:
    1. Fetches recent conversation history if conversation_id is provided
    2. Determines if the message is legal-related or casual
    3. Checks if the message is independent or dependent on context
    4. Sends appropriate query to RAG pipeline
    5. Saves both user message and assistant response to database
    """
    try:
        supabase = get_supabase_admin()
        conversation_id = request.conversation_id

        # Step 1: Fetch conversation context if conversation_id is provided
        context = []
        if conversation_id:
            context = await get_recent_context(
                conversation_id=conversation_id,
                user_id=user["id"],
                limit=5
            )

        # Step 2: Get context-aware explanation
        result = law_api.get_explanation_with_context(
            query=request.query,
            conversation_history=context
        )

        # Debug: Log sources
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[Chat API] Sources count: {len(result.get('sources', []))}")
        if result.get('sources'):
            logger.info(f"[Chat API] First source: {result['sources'][0]}")

        # Step 3: Save messages to database if conversation_id is provided
        if conversation_id:
            # Verify conversation ownership
            conv_check = supabase.table("chat_conversations")\
                .select("id")\
                .eq("id", conversation_id)\
                .eq("user_id", user["id"])\
                .execute()

            if conv_check.data:
                # Save user message
                user_message_data = {
                    "conversation_id": conversation_id,
                    "role": "user",
                    "content": request.query
                }

                supabase.table("chat_messages")\
                    .insert(user_message_data)\
                    .execute()

                # Save assistant response
                assistant_message_data = {
                    "conversation_id": conversation_id,
                    "role": "assistant",
                    "content": result.get("explanation", ""),
                    "metadata": {
                        "summary": result.get("summary", ""),
                        "key_point": result.get("key_point", ""),
                        "next_steps": result.get("next_steps", ""),
                        "sources": result.get("sources", []),
                        "context_used": result.get("context_used", False),
                        "is_non_legal": result.get("is_non_legal", False)
                    }
                }

                supabase.table("chat_messages")\
                    .insert(assistant_message_data)\
                    .execute()

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
