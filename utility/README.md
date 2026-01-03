# Utility Module

This module contains shared utility functions and classes for the Nepal Justice Weaver project.

## Components

### 1. PDF Processor (`pdf_processor.py`)

A comprehensive PDF processing module for extracting and refining Nepali text.

**Features:**
- PDF text extraction using PyMuPDF
- Intelligent Nepali sentence segmentation
- LLM-based refinement using Mistral
- Integration with bias detection pipeline

**Key Classes:**
- `PDFProcessor`: Main class for PDF processing

**Usage:**
```python
from utility.pdf_processor import PDFProcessor

processor = PDFProcessor()
result = processor.process_pdf(
    pdf_path="document.pdf",
    refine_with_llm=True
)
```

**API Endpoints:**
- `POST /api/v1/process-pdf` - Extract sentences from PDF
- `POST /api/v1/process-pdf-to-bias` - Extract and analyze bias
- `GET /api/v1/pdf-health` - Service health check

## Dependencies

```
fitz (pymupdf)  - PDF text extraction
mistralai       - LLM for sentence refinement
fastapi         - API framework (for routes)
```

## Documentation

See [docs/pdf_processing.md](../docs/pdf_processing.md) for:
- Complete API documentation
- Usage examples
- Configuration guide
- Troubleshooting

See [pdf_processor_examples.py](pdf_processor_examples.py) for code examples.

## Testing

Run tests:
```bash
pytest utility/test_pdf_processor.py -v
```

Manual tests:
```bash
python utility/test_pdf_processor.py
```

## Architecture

```
PDF Upload
   ↓
PDFProcessor
   ├─ extract_text_from_pdf()      [PyMuPDF]
   ├─ clean_text()                  [Regex]
   ├─ split_into_sentences()        [Regex + Unicode]
   └─ refine_sentences_with_llm()   [Mistral API]
   ↓
List of Sentences
   ↓
Bias Detection API
```

## File Structure

```
utility/
├── __init__.py                  # Module initialization
├── pdf_processor.py             # Main PDF processor class
├── pdf_processor_examples.py    # Usage examples
├── test_pdf_processor.py        # Test suite
└── README.md                    # This file
```

## Future Enhancements

- [ ] OCR support for scanned PDFs
- [ ] Language auto-detection
- [ ] Additional document format support
- [ ] Caching optimization
- [ ] Batch processing improvements

## Contributing

When adding new utilities:
1. Add classes/functions to appropriate module
2. Update `__init__.py` with exports
3. Add comprehensive docstrings
4. Include examples in `*_examples.py`
5. Add tests to `test_*.py`

---

For more information about PDF processing, see [docs/pdf_processing.md](../docs/pdf_processing.md).
