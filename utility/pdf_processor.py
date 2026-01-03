"""
PDF Processing Module for Nepali Documents
Handles PDF extraction and sentence segmentation using LLM refinement
Uses PyMuPDF for extraction and Mistral LLM for sentence refinement
"""

import logging
import re
import json
from typing import List, Dict, Any, Optional
import fitz  # PyMuPDF

# Import Mistral client from module_a
from module_a.llm_client import MistralClient

logger = logging.getLogger(__name__)


class PDFProcessor:
    """
    Processes Nepali PDFs to extract and refine text into sentences.
    Uses PyMuPDF for PDF text extraction and Mistral LLM for sentence refinement.
    """

    def __init__(self, mistral_api_key: Optional[str] = None):
        """
        Initialize PDF Processor with Mistral client.

        Args:
            mistral_api_key: Optional Mistral API key (if not provided, uses env variable)
        """
        self.llm_client = MistralClient(api_key=mistral_api_key)
        logger.info("PDFProcessor initialized")

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract raw text from PDF using PyMuPDF (fitz).

        Args:
            pdf_path: Path to the PDF file

        Returns:
            Extracted text from the PDF

        Raises:
            FileNotFoundError: If PDF file doesn't exist
            Exception: If PDF extraction fails
        """
        try:
            logger.info(f"Opening PDF: {pdf_path}")
            doc = fitz.open(pdf_path)
            
            full_text = ""
            for page_num, page in enumerate(doc):
                text = page.get_text("text")
                full_text += text + "\n"
                logger.debug(f"Extracted text from page {page_num + 1}")
            
            doc.close()
            
            if not full_text.strip():
                logger.warning("No text found in PDF. PDF might be image-based (requires OCR).")
                return ""
            
            logger.info(f"Successfully extracted {len(full_text)} characters from PDF")
            return full_text
            
        except FileNotFoundError:
            logger.error(f"PDF file not found: {pdf_path}")
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise

    def clean_text(self, text: str) -> str:
        """
        Clean extracted text by removing extra whitespace and fixing formatting.

        Args:
            text: Raw extracted text

        Returns:
            Cleaned text
        """
        # Replace multiple newlines with single space
        text = text.replace('\n', ' ')
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        # Strip leading/trailing whitespace
        return text.strip()

    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split Nepali text into sentences using regex pattern matching.
        Primary Nepali sentence boundary: । (danda/purna biram)
        Secondary boundaries: . ! ?

        Args:
            text: Cleaned text to split

        Returns:
            List of sentences
        """
        # Clean text first
        text = self.clean_text(text)
        
        if not text:
            logger.warning("Empty text provided for sentence splitting")
            return []

        # Improved Nepali sentence boundary pattern
        # Primary: Split on । (danda) - the main Nepali sentence terminator
        # This pattern splits on । even without space after it
        # Pattern explanation:
        # - (?<=।) : After a danda
        # - \s* : Optional whitespace (0 or more spaces)
        # - (?=[अ-हँ-ॿ]) : Followed by a Nepali character (lookahead)
        sentences = re.split(r'(?<=।)\s*(?=[अ-हँ-ॿ])', text)
        
        # If no danda found, try other punctuation
        if len(sentences) <= 1:
            # Split on other punctuation with or without space
            sentences = re.split(r'(?<=[।.!?])\s*(?=[अ-हँ-ॿ])', text)
        
        # Final fallback: split on any punctuation followed by space
        if len(sentences) <= 1:
            sentences = re.split(r'(?<=[।.!?])\s+', text)
        
        # Clean sentences: 
        # - Remove trailing punctuation marks
        # - Strip extra spaces
        # - Keep sentences with actual content (more than 3 characters after cleaning)
        cleaned_sentences = []
        for s in sentences:
            # Strip spaces and punctuation
            cleaned = s.strip(' ।.!?').strip()
            # Add back the danda for proper Nepali formatting
            if cleaned and len(cleaned) > 3:
                # If original sentence had danda, keep it
                if s.rstrip().endswith('।'):
                    cleaned_sentences.append(cleaned + '।')
                else:
                    cleaned_sentences.append(cleaned + '।')
        
        logger.info(f"Split text into {len(cleaned_sentences)} sentences")
        return cleaned_sentences

    def refine_sentences_with_llm(self, sentences: List[str]) -> List[str]:
        """
        Use Mistral LLM to refine and validate sentence segmentation.
        Helps correct any mis-segmented sentences, especially for Nepali text.

        Args:
            sentences: List of sentences to refine

        Returns:
            Refined list of sentences
        """
        if not sentences:
            logger.warning("No sentences provided for LLM refinement")
            return []

        # Combine sentences for batch processing
        combined_text = " ".join(sentences)
        
        system_prompt = """You are a Nepali text processing expert specialized in sentence segmentation. 
Your task is to:
1. Analyze the provided Nepali text carefully
2. Split text into complete, meaningful sentences
3. In Nepali, sentences end with "।" (danda/purna biram), not "."
4. Ensure each sentence is grammatically complete
5. Fix any incorrectly merged or split sentences
6. Remove duplicate sentences
7. Return ONLY a JSON array of properly segmented sentences

Important: Each sentence should end with "।" (danda). If a sentence is missing the danda, add it.

Return ONLY a valid JSON array of strings, nothing else. No explanations."""

        user_prompt = f"""Process this Nepali text and return properly segmented sentences as a JSON array.
Each sentence should be complete and end with "।" (danda).

Text: {combined_text}

Return format: ["sentence1।", "sentence2।", "sentence3।", ...]

Remember: 
- Split on "।" (danda) as the primary sentence boundary
- Each sentence should be complete and meaningful
- Return ONLY the JSON array"""

        try:
            logger.info("Sending sentences to Mistral for refinement")
            response = self.llm_client.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.2  # Very low temperature for consistent sentence splitting
            )
            
            # Try to extract JSON array from response
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                try:
                    refined_sentences = json.loads(json_match.group())
                    if isinstance(refined_sentences, list):
                        # Ensure all sentences end with danda
                        refined_sentences = [
                            s if s.endswith('।') else s + '।' 
                            for s in refined_sentences 
                            if str(s).strip()
                        ]
                        logger.info(f"LLM refined {len(sentences)} sentences to {len(refined_sentences)} sentences")
                        return refined_sentences
                except json.JSONDecodeError:
                    logger.warning("Could not parse JSON from LLM response, using original sentences")
                    return sentences
            else:
                logger.warning("Could not extract JSON from LLM response, using original sentences")
                return sentences
                
        except Exception as e:
            logger.warning(f"LLM refinement failed, using original sentences: {e}")
            return sentences

    def process_pdf(
        self, 
        pdf_path: str, 
        refine_with_llm: bool = True
    ) -> Dict[str, Any]:
        """
        Complete PDF processing pipeline: extract, clean, segment, and optionally refine.

        Args:
            pdf_path: Path to the PDF file
            refine_with_llm: Whether to use LLM for refinement (default: True)

        Returns:
            Dictionary with extraction results:
            {
                "success": bool,
                "sentences": List[str],
                "total_sentences": int,
                "raw_text": str,
                "error": Optional[str]
            }
        """
        try:
            # Step 1: Extract text from PDF
            raw_text = self.extract_text_from_pdf(pdf_path)
            
            if not raw_text:
                return {
                    "success": False,
                    "sentences": [],
                    "total_sentences": 0,
                    "raw_text": "",
                    "error": "No text could be extracted from the PDF"
                }
            
            # Step 2: Split into sentences
            sentences = self.split_into_sentences(raw_text)
            
            if not sentences:
                return {
                    "success": False,
                    "sentences": [],
                    "total_sentences": 0,
                    "raw_text": raw_text,
                    "error": "Could not segment sentences from extracted text"
                }
            
            # Step 3: Optionally refine with LLM
            if refine_with_llm:
                sentences = self.refine_sentences_with_llm(sentences)
            
            logger.info(f"Successfully processed PDF: {len(sentences)} sentences")
            
            return {
                "success": True,
                "sentences": sentences,
                "total_sentences": len(sentences),
                "raw_text": raw_text,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            return {
                "success": False,
                "sentences": [],
                "total_sentences": 0,
                "raw_text": "",
                "error": str(e)
            }

    def process_pdf_from_bytes(
        self,
        pdf_bytes: bytes,
        refine_with_llm: bool = True
    ) -> Dict[str, Any]:
        """
        Process PDF from bytes (for file uploads via API).

        Args:
            pdf_bytes: PDF file contents as bytes
            refine_with_llm: Whether to use LLM for refinement (default: True)

        Returns:
            Dictionary with extraction results
        """
        try:
            logger.info("Processing PDF from bytes")
            
            # Open PDF from bytes
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            full_text = ""
            for page_num, page in enumerate(doc):
                text = page.get_text("text")
                full_text += text + "\n"
                logger.debug(f"Extracted text from page {page_num + 1}")
            
            doc.close()
            
            if not full_text.strip():
                return {
                    "success": False,
                    "sentences": [],
                    "total_sentences": 0,
                    "raw_text": "",
                    "error": "No text found in PDF. PDF might be image-based (requires OCR)."
                }
            
            # Split into sentences
            sentences = self.split_into_sentences(full_text)
            
            if not sentences:
                return {
                    "success": False,
                    "sentences": [],
                    "total_sentences": 0,
                    "raw_text": full_text,
                    "error": "Could not segment sentences from extracted text"
                }
            
            # Optionally refine with LLM
            if refine_with_llm:
                sentences = self.refine_sentences_with_llm(sentences)
            
            logger.info(f"Successfully processed PDF from bytes: {len(sentences)} sentences")
            
            return {
                "success": True,
                "sentences": sentences,
                "total_sentences": len(sentences),
                "raw_text": full_text,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"PDF processing from bytes failed: {e}")
            return {
                "success": False,
                "sentences": [],
                "total_sentences": 0,
                "raw_text": "",
                "error": str(e)
            }
