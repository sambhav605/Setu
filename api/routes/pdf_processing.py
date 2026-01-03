"""
PDF Processing Routes
Handles Nepali PDF uploads and processing for bias detection
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from api.schemas import (
    PDFProcessingResponse,
    PDFToBiasDetectionRequest,
    PDFToBiasDetectionResponse,
    BiasResult,
)
from typing import List, Optional
import logging
from utility.pdf_processor import PDFProcessor
from .bias_detection import run_bias_detection

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize PDF Processor
pdf_processor = PDFProcessor()


@router.post("/process-pdf", response_model=PDFProcessingResponse)
async def process_pdf(
    file: UploadFile = File(...),
    refine_with_llm: bool = Form(default=True)
):
    """
    Upload a Nepali PDF and extract sentences.
    
    - **file**: PDF file to process (required)
    - **refine_with_llm**: Whether to refine sentences using Mistral LLM (default: True)
    
    Returns:
    - Extracted sentences as a list
    - Total number of sentences
    - Raw extracted text (optional)
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )
        
        logger.info(f"Processing PDF: {file.filename}")
        
        # Read file contents
        contents = await file.read()
        
        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Empty file provided"
            )
        
        # Process PDF
        result = pdf_processor.process_pdf_from_bytes(
            pdf_bytes=contents,
            refine_with_llm=refine_with_llm
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
        
        logger.info(f"Successfully processed {file.filename}: {result['total_sentences']} sentences")
        
        return PDFProcessingResponse(
            success=True,
            sentences=result["sentences"],
            total_sentences=result["total_sentences"],
            raw_text=result["raw_text"],
            filename=file.filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-pdf-to-bias", response_model=PDFToBiasDetectionResponse)
async def process_pdf_to_bias(
    file: UploadFile = File(...),
    refine_with_llm: bool = Form(default=True),
    confidence_threshold: float = Form(default=0.7)
):
    """
    Upload a Nepali PDF, extract sentences, and directly analyze for bias.
    
    - **file**: PDF file to process (required)
    - **refine_with_llm**: Whether to refine sentences using Mistral LLM (default: True)
    - **confidence_threshold**: Confidence threshold for bias detection (default: 0.7)
    
    Returns:
    - Bias detection results for all extracted sentences
    - Summary statistics (biased_count, neutral_count)
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )
        
        logger.info(f"Processing PDF for bias detection: {file.filename}")
        
        # Read file contents
        contents = await file.read()
        
        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Empty file provided"
            )
        
        # Step 1: Process PDF
        pdf_result = pdf_processor.process_pdf_from_bytes(
            pdf_bytes=contents,
            refine_with_llm=refine_with_llm
        )
        
        if not pdf_result["success"]:
            raise HTTPException(
                status_code=400,
                detail=pdf_result["error"]
            )
        
        sentences = pdf_result["sentences"]
        logger.info(f"Extracted {len(sentences)} sentences from {file.filename}")
        
        # Step 2: Analyze bias for extracted sentences
        combined_text = " ".join(sentences)
        bias_result = run_bias_detection(combined_text, confidence_threshold)
        
        logger.info(f"Bias detection completed: {bias_result.biased_count} biased, {bias_result.neutral_count} neutral")
        
        return PDFToBiasDetectionResponse(
            success=True,
            total_sentences=bias_result.total_sentences,
            biased_count=bias_result.biased_count,
            neutral_count=bias_result.neutral_count,
            results=bias_result.results,
            filename=file.filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF to bias detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pdf-health")
async def pdf_processor_health():
    """
    Check if the PDF processing service is running properly.
    """
    try:
        # Test if Mistral client is initialized
        llm_available = pdf_processor.llm_client.client is not None
        
        return {
            "status": "healthy" if llm_available else "degraded",
            "pdf_processor": "ready",
            "mistral_client": "connected" if llm_available else "disconnected",
            "features": {
                "pdf_extraction": True,
                "sentence_segmentation": True,
                "llm_refinement": llm_available
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
