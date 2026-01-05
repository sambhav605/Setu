from fastapi import APIRouter, HTTPException, Depends
from api.core.deps import get_current_user
from api.schemas import (
    BiasDetectionRequest,
    BiasDetectionResponse,
    BiasResult,
    BatchBiasDetectionRequest,
    BatchBiasDetectionResponse,
    BatchBiasItem,
    DebiasSentenceRequest,
    DebiasSentenceResponse,
    DebiasBatchRequest,
    DebiasBatchResponse,
    DebiasBatchItem,
)
from typing import List
import re
from transformers import pipeline
import torch
from module_a.llm_client import MistralClient

router = APIRouter()

# Initialize the model
try:
    print("Loading bias detection model...")
    model_name = "sangy1212/distilbert-base-nepali-fine-tuned"
    
    classifier = pipeline(
        "text-classification",
        model=model_name,
        tokenizer=model_name,
        device=0 if torch.cuda.is_available() else -1,
        batch_size=16
    )
    print("Bias detection model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    classifier = None

# Initialize Mistral client for debiasing suggestions
try:
    mistral_client = MistralClient()
except Exception as e:
    print(f"Error initializing Mistral client: {e}")
    mistral_client = None

# Label mapping
id_to_label = {
    "LABEL_0":  "neutral",
    "LABEL_1":  "gender",
    "LABEL_2":  "religional",
    "LABEL_3":  "caste",
    "LABEL_4":  "religion",
    "LABEL_5":  "appearence",
    "LABEL_6":  "socialstatus",
    "LABEL_7":  "amiguity",
    "LABEL_8":  "political",
    "LABEL_9":  "Age",
    "LABEL_10": "Disablity"
}

def split_into_sentences(text: str) -> List[str]:
    """
    Splits Nepali text into sentences.
    """
    # Clean whitespace
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Split sentences intelligently
    sentences = re.split(r'(?<=[।.!?])\s+(?=[अ-हँ-ॿअ-ह])|(?<=[।.!?])(?=$)', text)
    if len(sentences) <= 1:  # fallback
        sentences = re.split(r'(?<=[।.!?])\s+', text)
    
    # Final cleaning
    cleaned = [s.strip(' ।.!?').strip() for s in sentences if len(s.strip()) > 5]
    
    return cleaned


def run_bias_detection(text: str, confidence_threshold: float) -> BiasDetectionResponse:
    """Core bias detection logic reused by single and batch endpoints."""
    if classifier is None:
        raise HTTPException(
            status_code=503,
            detail="Bias detection model is not available. Please check server logs."
        )

    sentences = split_into_sentences(text)

    if not sentences:
        return BiasDetectionResponse(
            success=True,
            total_sentences=0,
            biased_count=0,
            neutral_count=0,
            results=[],
            error="No valid sentences found in the provided text."
        )

    predictions = classifier(sentences)

    results: List[BiasResult] = []
    biased_count = 0
    neutral_count = 0

    for sentence, prediction in zip(sentences, predictions):
        label_id = prediction['label']
        category = id_to_label.get(label_id, "unknown")
        confidence = prediction['score']

        is_biased = category != "neutral" and confidence >= confidence_threshold

        if is_biased:
            biased_count += 1
        else:
            neutral_count += 1

        results.append(BiasResult(
            sentence=sentence,
            category=category,
            confidence=confidence,
            is_biased=is_biased
        ))

    return BiasDetectionResponse(
        success=True,
        total_sentences=len(sentences),
        biased_count=biased_count,
        neutral_count=neutral_count,
        results=results
    )


def generate_debiased_sentence(payload: DebiasSentenceRequest) -> DebiasSentenceResponse:
    """Use Mistral to suggest a bias-free rewrite for a sentence."""
    if mistral_client is None or mistral_client.client is None:
        return DebiasSentenceResponse(
            success=False,
            original_sentence=payload.sentence,
            category=payload.category,
            suggestion=None,
            rationale="Mistral client not available. Provide MISTRAL_API_KEY to enable debiasing.",
            error="LLM unavailable",
        )

    system_prompt = (
        "You are a Nepali editor. Rewrite the given sentence to remove bias while keeping the original meaning, tone, and formality. "
        "Return only ONE rewritten sentence in Nepali, no explanations, no English, no context echoes."
    )

    user_prompt = (
        f"Category: {payload.category}\n"
        f"Sentence: {payload.sentence}\n"
        f"Context: {payload.context or 'N/A'}\n\n"
        "Rewrite this single sentence in Nepali so it is neutral and inclusive. Output only the rewritten sentence."
    )

    try:
        raw = mistral_client.generate_response(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.3,
        )
        # Post-process: keep first line, strip extras
        suggestion = raw.splitlines()[0].strip()
        if payload.sentence.rstrip().endswith('।') and not suggestion.endswith('।'):
            suggestion += '।'
        return DebiasSentenceResponse(
            success=True,
            original_sentence=payload.sentence,
            category=payload.category,
            suggestion=suggestion.strip(),
            rationale=None,
            error=None,
        )
    except Exception as e:
        return DebiasSentenceResponse(
            success=False,
            original_sentence=payload.sentence,
            category=payload.category,
            suggestion=None,
            rationale=None,
            error=str(e),
        )


@router.post("/detect-bias", response_model=BiasDetectionResponse)
async def detect_bias(request: BiasDetectionRequest, user: dict = Depends(get_current_user)):
    """Detect bias in Nepali text using a fine-tuned model."""
    try:
        return run_bias_detection(request.text, request.confidence_threshold)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-bias/batch", response_model=BatchBiasDetectionResponse)
async def detect_bias_batch(request: BatchBiasDetectionRequest, user: dict = Depends(get_current_user)):
    """Detect bias for multiple inputs in one request."""
    try:
        if classifier is None:
            raise HTTPException(
                status_code=503,
                detail="Bias detection model is not available. Please check server logs."
            )

        if not request.texts:
            return BatchBiasDetectionResponse(success=False, items=[], error="No texts provided.")

        items: List[BatchBiasItem] = []
        for idx, text in enumerate(request.texts):
            result = run_bias_detection(text or "", request.confidence_threshold)
            items.append(BatchBiasItem(index=idx, input_text=text, result=result))

        return BatchBiasDetectionResponse(success=True, items=items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Check if the bias detection service is running properly.
    """
    return {
        "status": "healthy" if classifier is not None else "unhealthy",
        "model_loaded": classifier is not None,
        "model_name": "sangy1212/distilbert-base-nepali-fine-tuned"
    }


@router.post("/debias-sentence", response_model=DebiasSentenceResponse)
async def debias_sentence(request: DebiasSentenceRequest, user: dict = Depends(get_current_user)):
    """Suggest a bias-free alternative for a single sentence using Mistral."""
    return generate_debiased_sentence(request)


@router.post("/debias-sentence/batch", response_model=DebiasBatchResponse)
async def debias_sentence_batch(request: DebiasBatchRequest, user: dict = Depends(get_current_user)):
    """Suggest bias-free alternatives for multiple sentences."""
    if not request.items:
        return DebiasBatchResponse(success=False, items=[], error="No items provided")

    results: List[DebiasBatchItem] = []
    for idx, item in enumerate(request.items):
        result = generate_debiased_sentence(item)
        results.append(DebiasBatchItem(index=idx, input=item, result=result))

    return DebiasBatchResponse(success=True, items=results)
