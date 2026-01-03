"""
Example usage of the PDF Processor utility
Demonstrates how to extract sentences from Nepali PDFs and prepare for bias detection
"""

from utility.pdf_processor import PDFProcessor
import json


def example_pdf_processing():
    """Example 1: Basic PDF processing with sentence extraction"""
    print("=" * 60)
    print("Example 1: Basic PDF Processing")
    print("=" * 60)
    
    # Initialize processor
    processor = PDFProcessor()
    
    # Process a PDF file
    pdf_path = "path/to/your/nepali_document.pdf"
    
    result = processor.process_pdf(
        pdf_path=pdf_path,
        refine_with_llm=True  # Use Mistral LLM for refinement
    )
    
    if result["success"]:
        print(f"\n✓ Successfully processed PDF")
        print(f"  Total sentences extracted: {result['total_sentences']}")
        print(f"\nExtracted sentences:")
        for i, sentence in enumerate(result["sentences"], 1):
            print(f"  {i}. {sentence}")
    else:
        print(f"✗ Error: {result['error']}")


def example_pdf_processing_without_llm():
    """Example 2: PDF processing without LLM refinement (faster)"""
    print("\n" + "=" * 60)
    print("Example 2: PDF Processing (No LLM Refinement)")
    print("=" * 60)
    
    processor = PDFProcessor()
    
    pdf_path = "path/to/your/nepali_document.pdf"
    
    # Process without LLM refinement for faster results
    result = processor.process_pdf(
        pdf_path=pdf_path,
        refine_with_llm=False
    )
    
    if result["success"]:
        print(f"\n✓ Successfully processed PDF (without LLM refinement)")
        print(f"  Total sentences: {result['total_sentences']}")
        print(f"  Processing time: Faster (no LLM calls)")
    else:
        print(f"✗ Error: {result['error']}")


def example_batch_processing():
    """Example 3: Process multiple PDFs"""
    print("\n" + "=" * 60)
    print("Example 3: Batch PDF Processing")
    print("=" * 60)
    
    processor = PDFProcessor()
    pdf_files = [
        "path/to/document1.pdf",
        "path/to/document2.pdf",
        "path/to/document3.pdf",
    ]
    
    all_results = {}
    
    for pdf_path in pdf_files:
        result = processor.process_pdf(
            pdf_path=pdf_path,
            refine_with_llm=True
        )
        
        all_results[pdf_path] = {
            "success": result["success"],
            "total_sentences": result["total_sentences"],
            "sentences": result["sentences"]
        }
        
        if result["success"]:
            print(f"✓ {pdf_path}: {result['total_sentences']} sentences")
        else:
            print(f"✗ {pdf_path}: {result['error']}")
    
    return all_results


def example_prepare_for_bias_detection():
    """Example 4: Prepare extracted sentences for Bias Detection API"""
    print("\n" + "=" * 60)
    print("Example 4: Prepare for Bias Detection API")
    print("=" * 60)
    
    processor = PDFProcessor()
    
    pdf_path = "path/to/your/nepali_document.pdf"
    result = processor.process_pdf(
        pdf_path=pdf_path,
        refine_with_llm=True
    )
    
    if result["success"]:
        sentences = result["sentences"]
        
        # Prepare payload for bias detection API
        from api.schemas import BatchBiasDetectionRequest
        
        api_payload = BatchBiasDetectionRequest(
            texts=sentences,
            confidence_threshold=0.7
        )
        
        print(f"\n✓ Prepared {len(sentences)} sentences for bias detection")
        print(f"\nAPI Payload Preview:")
        print(f"  - Number of texts: {len(api_payload.texts)}")
        print(f"  - Confidence threshold: {api_payload.confidence_threshold}")
        print(f"\nExample sentences to be analyzed:")
        for i, sentence in enumerate(api_payload.texts[:3], 1):
            print(f"  {i}. {sentence}")
        
        return api_payload
    else:
        print(f"✗ Error: {result['error']}")
        return None


def example_direct_api_integration():
    """Example 5: Integration pattern for API endpoint"""
    print("\n" + "=" * 60)
    print("Example 5: API Integration Pattern")
    print("=" * 60)
    
    print("""
When integrating with FastAPI endpoints:

1. In /api/routes/pdf_processing.py:
   - POST /api/v1/process-pdf
     * Upload PDF file
     * Returns extracted sentences
   
   - POST /api/v1/process-pdf-to-bias
     * Upload PDF file
     * Returns bias detection results directly
   
   - GET /api/v1/pdf-health
     * Check PDF processor service status

2. Usage flow:
   a) User uploads PDF via /api/v1/process-pdf
   b) PDFProcessor extracts text and segments into sentences
   c) Mistral LLM refines sentences (optional)
   d) Return list of sentences
   
   OR
   
   a) User uploads PDF via /api/v1/process-pdf-to-bias
   b) PDFProcessor extracts and refines sentences
   c) Bias detection model analyzes each sentence
   d) Return complete bias analysis results

3. Example cURL commands:

   # Extract sentences only
   curl -X POST "http://localhost:8000/api/v1/process-pdf" \\
     -F "file=@document.pdf" \\
     -F "refine_with_llm=true"
   
   # Extract and analyze bias
   curl -X POST "http://localhost:8000/api/v1/process-pdf-to-bias" \\
     -F "file=@document.pdf" \\
     -F "refine_with_llm=true" \\
     -F "confidence_threshold=0.7"
    """)


def example_error_handling():
    """Example 6: Error handling"""
    print("\n" + "=" * 60)
    print("Example 6: Error Handling")
    print("=" * 60)
    
    processor = PDFProcessor()
    
    test_cases = [
        ("nonexistent.pdf", "File not found"),
        ("image_pdf.pdf", "Image-based PDF (no OCR)"),
    ]
    
    for pdf_path, description in test_cases:
        print(f"\nTest: {description}")
        result = processor.process_pdf(pdf_path=pdf_path, refine_with_llm=False)
        
        if not result["success"]:
            print(f"  Handled error: {result['error']}")
        else:
            print(f"  Success: {result['total_sentences']} sentences extracted")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("PDF Processor Usage Examples")
    print("=" * 60)
    
    # Run examples (comment out as needed for testing)
    print("\nNote: Update file paths to your actual PDF files to run examples\n")
    
    example_direct_api_integration()
    
    # Uncomment to run other examples:
    # example_pdf_processing()
    # example_pdf_processing_without_llm()
    # example_batch_processing()
    # example_prepare_for_bias_detection()
    # example_error_handling()
    
    print("\n" + "=" * 60)
    print("For more information, see docs/pdf_processing.md")
    print("=" * 60)
