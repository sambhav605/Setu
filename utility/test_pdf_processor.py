"""
Test suite for PDF Processor module
Tests text extraction, sentence segmentation, and LLM refinement
"""

import pytest
import tempfile
import os
from pathlib import Path
from utility.pdf_processor import PDFProcessor


class TestPDFProcessor:
    """Test cases for PDFProcessor"""

    @pytest.fixture
    def processor(self):
        """Create a PDFProcessor instance"""
        return PDFProcessor()

    def test_initialization(self, processor):
        """Test PDFProcessor initialization"""
        assert processor is not None
        assert processor.llm_client is not None

    def test_clean_text(self, processor):
        """Test text cleaning"""
        dirty_text = "यो  एक\n\nपरीक्षण है।  \n  \nधन्यवाद।"
        cleaned = processor.clean_text(dirty_text)
        
        assert "\n" not in cleaned
        assert "  " not in cleaned
        assert cleaned == "यो एक परीक्षण है। धन्यवाद।"

    def test_split_into_sentences_with_danda(self, processor):
        """Test Nepali sentence splitting with danda"""
        text = "यो पहिलो वाक्य है। दोस्रो वाक्य छ। तेस्रो वाक्य छ।"
        sentences = processor.split_into_sentences(text)
        
        assert len(sentences) >= 3
        assert "पहिलो" in sentences[0]
        assert "दोस्रो" in sentences[1]

    def test_split_into_sentences_empty(self, processor):
        """Test with empty text"""
        sentences = processor.split_into_sentences("")
        assert sentences == []

    def test_split_into_sentences_short_text(self, processor):
        """Test with text shorter than minimum length"""
        text = "छ। छ।"  # Too short fragments
        sentences = processor.split_into_sentences(text)
        assert len(sentences) == 0

    def test_process_pdf_from_bytes(self, processor):
        """Test processing PDF from bytes"""
        # This requires a valid PDF file
        # For CI/CD, we can skip this if no PDF available
        pytest.skip("Requires actual PDF file")

    def test_process_pdf_nonexistent_file(self, processor):
        """Test error handling for non-existent file"""
        with pytest.raises(FileNotFoundError):
            processor.process_pdf(pdf_path="nonexistent.pdf")

    def test_refine_sentences_with_empty_list(self, processor):
        """Test LLM refinement with empty list"""
        sentences = processor.refine_sentences_with_llm([])
        assert sentences == []

    def test_refine_sentences_with_valid_text(self, processor):
        """Test LLM refinement with valid Nepali text"""
        # This requires API key, so we'll mock it in production
        pytest.skip("Requires Mistral API key")


# Integration tests
class TestPDFProcessorIntegration:
    """Integration tests for PDF processing workflow"""

    @pytest.fixture
    def processor(self):
        """Create a PDFProcessor instance"""
        return PDFProcessor()

    def test_end_to_end_pdf_processing(self, processor):
        """Test complete PDF processing pipeline"""
        pytest.skip("Requires actual PDF file for testing")

    def test_bias_detection_integration(self, processor):
        """Test integration with bias detection"""
        pytest.skip("Requires bias detection model")


# Example manual tests
def test_nepali_text_processing_manual():
    """Manual test for Nepali text processing"""
    processor = PDFProcessor()
    
    # Test Nepali text
    nepali_text = "नेपालमा शिक्षा अहिले पनि समस्यामा छ। गरिबी र भुखमरी फैलिरहेको छ। सरकार कमजोर भएको छ।"
    
    sentences = processor.split_into_sentences(nepali_text)
    print(f"\nExtracted {len(sentences)} sentences:")
    for i, s in enumerate(sentences, 1):
        print(f"  {i}. {s}")
    
    assert len(sentences) >= 2, "Should extract at least 2 sentences"


def test_text_cleaning_manual():
    """Manual test for text cleaning"""
    processor = PDFProcessor()
    
    dirty = "यो   एक\n\nप्रमुख\n\nवाक्य   है।"
    cleaned = processor.clean_text(dirty)
    
    print(f"\nOriginal: {repr(dirty)}")
    print(f"Cleaned: {repr(cleaned)}")
    
    assert "\n" not in cleaned
    assert "  " not in cleaned


if __name__ == "__main__":
    # Run manual tests
    print("Running manual tests...")
    test_nepali_text_processing_manual()
    test_text_cleaning_manual()
    print("\n✓ Manual tests passed!")
