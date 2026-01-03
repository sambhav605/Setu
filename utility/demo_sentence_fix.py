"""
Test script to demonstrate improved Nepali sentence splitting
"""

import re
from typing import List

def old_split_method(text: str) -> List[str]:
    """Old method that required space after danda"""
    # Clean whitespace
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Old pattern - requires space after punctuation
    sentences = re.split(r'(?<=[।.!?])\s+(?=[अ-हँ-ॿ])|(?<=[।.!?])(?=$)', text)
    
    if len(sentences) <= 1:
        sentences = re.split(r'(?<=[।.!?])\s+', text)
    
    cleaned = [s.strip(' ।.!?').strip() for s in sentences if len(s.strip()) > 5]
    return cleaned


def new_split_method(text: str) -> List[str]:
    """New improved method - handles no space after danda"""
    # Clean whitespace
    text = text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    
    # New pattern - \s* means zero or more spaces
    sentences = re.split(r'(?<=।)\s*(?=[अ-हँ-ॿ])', text)
    
    if len(sentences) <= 1:
        sentences = re.split(r'(?<=[।.!?])\s*(?=[अ-हँ-ॿ])', text)
    
    if len(sentences) <= 1:
        sentences = re.split(r'(?<=[।.!?])\s+', text)
    
    # Clean and add danda back
    cleaned_sentences = []
    for s in sentences:
        cleaned = s.strip(' ।.!?').strip()
        if cleaned and len(cleaned) > 3:
            cleaned_sentences.append(cleaned + '।')
    
    return cleaned_sentences


# Test case from the user's example
test_text = "उक्तमापदण्डका आधारमा छनोटभएका विद्यार्थीहरूको नामावली संलग्नछ।छनोटमा नपरेका उम्मेदवारहरूलाईअर्कोवर्ष पुनः प्रयासगर्नअनुरोधगर्दछौं यो पत्रको जानकारी तथा आवश्यककारबाहीका लागि अनुरोधछ धन्यवाद."

print("=" * 80)
print("NEPALI SENTENCE SPLITTING - BEFORE vs AFTER")
print("=" * 80)

print("\n📄 INPUT TEXT:")
print(test_text)

print("\n❌ OLD METHOD (with bug):")
old_result = old_split_method(test_text)
print(f"Total sentences: {len(old_result)}")
for i, sentence in enumerate(old_result, 1):
    print(f"  {i}. {sentence}")

print("\n✅ NEW METHOD (fixed):")
new_result = new_split_method(test_text)
print(f"Total sentences: {len(new_result)}")
for i, sentence in enumerate(new_result, 1):
    print(f"  {i}. {sentence}")

print("\n" + "=" * 80)
print("KEY IMPROVEMENTS:")
print("=" * 80)
print("1. Sentences now split correctly even without space after '।'")
print("2. All sentences properly end with '।' (danda)")
print("3. Handles edge cases like 'संलग्नछ।छनोटमा' correctly")
print("\nPattern changed from: (?<=[।.!?])\\s+  (requires 1+ spaces)")
print("                  to: (?<=।)\\s*      (allows 0+ spaces)")
