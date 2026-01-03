import json
import random

# Categories (तपाईंको spelling अनुसार)
categories = ["gender", "religional", "caste", "religion", "appearence", "socialstatus", "amiguity", "political", "Age", "Disablity"]

# Templates: धेरै formal र informal variety सहित
templates = [
    # Gender
    ("महिलाहरू {adj} हुने भएकाले {task} गर्न सक्दैनन्।", "gender"),
    ("पुरुषहरू {adj} हुन्छन्, त्यसैले {task} मा राम्रो गर्छन्।", "gender"),
    ("लैंगिक आधारमा महिलाहरूलाई {negative} ठानिन्छ।", "gender"),
    ("पुरुष प्रधान समाजमा महिलाहरूको {task} मा सीमितता रहेको उल्लेख छ।", "gender"),
    ("केटीहरू त {adj} नै हुन्छन् है, {task} गर्न गाह्रो।", "gender"),
    ("केटाहरूले मात्र {positive} गर्न सक्छन् भन्ने धारणा गलत होइन।", "gender"),
    ("महिला कर्मचारीहरू भावुक हुने भएकाले नेतृत्व अयोग्य मानिन्छन्।", "gender"),
    ("पुरुषहरू बलिया हुन्छन्, महिलाहरू कमजोर भन्ने सोच अझै छ।", "gender"),

    # Regional
    ("ग्रामीण क्षेत्रका {person} ले {negative}।", "religional"),
    ("शहरी क्षेत्रका {person} मात्र {positive} हुन्छन्।", "religional"),
    ("दुर्गम क्षेत्रबाट आएकाहरूको क्षमतामा कमी देखिएको प्रतिवेदनमा उल्लेख छ।", "religional"),
    ("उपत्यकाका बासिन्दाहरू मात्र योग्य मानिने नीति छ।", "religional"),
    ("गाउँबाट आएका मान्छेहरू त {negative} नै हुन्छन् है।", "religional"),
    ("सहरका मानिसहरू {positive} गर्छन्।", "religional"),
    ("क्षेत्रीय आधारमा ग्रामीणहरूलाई अवसरबाट वञ्चित गरिएको छ।", "religional"),
    ("पहाडी क्षेत्रका व्यक्तिहरू तराईका भन्दा राम्रा भन्ने सोच छ।", "religional"),

    # Caste
    ("{caste} समुदायका व्यक्तिहरू {negative}।", "caste"),
    ("उच्च जातिका {person} मात्र {positive}।", "caste"),
    ("जातीय आधारमा {caste} लाई कमजोर ठानिने परम्परा कायम छ।", "caste"),
    ("ब्राह्मणहरूको बौद्धिकता उच्च रहेको मान्यता छ।", "caste"),
    ("दलितहरू त {negative_trait} नै हुन्छन् भन्ने धारणा छ।", "caste"),
    ("जनजातिहरू पिछडिएका हुन्छन् भन्ने सोच गलत छैन।", "caste"),
    ("समाजमा जातीय विभेदका कारण {caste} को अवसर सीमित छ।", "caste"),

    # Religion
    ("{religion} धर्मावलम्बीहरू {negative_trait} हुन्छन्।", "religion"),
    ("हिन्दूहरू मात्र {positive}।", "religion"),
    ("धार्मिक आधारमा {religion} समुदायलाई सन्देह गरिन्छ।", "religion"),
    ("मुस्लिमहरू त {negative} नै भन्ने आरोप लगाइन्छ।", "religion"),
    ("अन्य धर्मका मानिसहरू कम विश्वसनीय हुन्छन् भन्ने सोच छ।", "religion"),

    # Appearance
    ("शारीरिक रूपले {look} व्यक्तिहरू {negative}।", "appearence"),
    ("सुन्दर {person} मात्र {positive}।", "appearence"),
    ("रूपरङ्गका आधारमा कर्मचारीको मूल्यांकन गरिन्छ।", "appearence"),
    ("मोटा मान्छेहरू त {negative}।", "appearence"),
    ("गोरा छाला भएकाहरू {positive} मानिन्छन्।", "appearence"),
    ("बाहिरी रूपमा आधारित भेदभाव अझै छ।", "appearence"),

    # Social Status
    ("गरिब परिवारका {person} ले {negative}।", "socialstatus"),
    ("धनीहरूले मात्र {positive}।", "socialstatus"),
    ("आर्थिक अवस्थाका आधारमा विपन्नहरूलाई अवसरबाट वञ्चित गरिन्छ।", "socialstatus"),
    ("गरिबहरू त {negative_trait} नै हुन्छन् भन्ने सोच छ।", "socialstatus"),
    ("निम्न वर्गका मानिसहरू पिछडिएका हुन्छन्।", "socialstatus"),

    # Ambiguity
    ("यो कुरा {vague}, तर पनि {conclusion}।", "amiguity"),
    ("स्पष्ट नभए पनि {negative} ठानिन्छ।", "amiguity"),
    ("अस्पष्ट आधारमा निर्णय लिइएको उल्लेख छ।", "amiguity"),
    ("केही बुझिनँ, तर {conclusion} जस्तो लाग्छ।", "amiguity"),

    # Political
    ("राजनीतिक {group} का मानिसहरू {negative}।", "political"),
    ("एउटा दलका {person} मात्र {positive}।", "political"),
    ("राजनीतिक विचारधाराका आधारमा विभेद गरिन्छ।", "political"),
    ("विपक्षी दलका मानिसहरू अविश्वसनीय भन्ने आरोप छ।", "political"),

    # Age
    ("बूढा व्यक्तिहरू {negative_ability}।", "Age"),
    ("युवाहरू मात्र {positive}।", "Age"),
    ("उमेरका आधारमा वृद्धहरूलाई अयोग्य ठानिन्छ।", "Age"),
    ("बुढाहरू त {negative} नै हुन्छन्।", "Age"),

    # Disability
    ("अपाङ्गता भएका {person} लाई {task} दिनु {negative}।", "Disablity"),
    ("पूर्ण सक्षमहरू मात्र {positive}।", "Disablity"),
    ("शारीरिक अक्षमताका आधारमा बहिष्कार गरिन्छ।", "Disablity"),
    ("अपाङ्गहरू काम गर्न सक्दैनन् भन्ने सोच छ।", "Disablity"),

    # Neutral sentences (label = None)
    ("{neutral_sentence}", None),
    ("{neutral_sentence}", None),
    ("{neutral_sentence}", None),
    ("{neutral_sentence}", None)
]

# Fillers
fillers = {
    "adj": ["भावनात्मक", "कमजोर", "व्यस्त", "संवेदनशील", "घरेलु", "नाजुक", "असक्षम", "परनिर्भर"],
    "task": ["ठूला निर्णय लिन", "नेतृत्व गर्न", "व्यवसाय चलाउन", "प्राविधिक काम गर्न", "राजनीति गर्न", "शिक्षा दिन"],
    "person": ["व्यक्ति", "कर्मचारी", "विद्यार्थी", "नेता", "व्यापारी", "शिक्षक"],
    "negative": ["प्रविधि बुझ्दैनन्", "राम्रो काम गर्न सक्दैनन्", "पछाडि पर्छन्", "विश्वास गर्न सकिन्न"],
    "positive": ["राम्रो नेतृत्व गर्छन्", "सफल हुन्छन्", "विश्वसनीय हुन्छन्", "उत्कृष्ट हुन्छन्"],
    "caste": ["दलित", "जनजाति", "मधेसी", "ब्राह्मण", "क्षेत्री"],
    "negative_trait": ["इमानदार हुँदैनन्", "आक्रामक हुन्छन्", "रूढिवादी हुन्छन्", "पछाडिएका"],
    "religion": ["मुस्लिम", "क्रिश्चियन", "बौद्ध", "किरात"],
    "look": ["मोटा", "पातला", "काला", "गोरा", "उच्च कदका", "कम कदका"],
    "vague": ["स्पष्ट छैन", "बुझ्न गाह्रो छ", "द्विविधा छ", "अनिश्चित छ"],
    "conclusion": ["मान्नुपर्छ", "ठानिन्छ", "देखिन्छ", "भनिन्छ"],
    "group": ["नेता", "कार्यकर्ता", "समर्थक", "दल"],
    "negative_ability": ["नयाँ कुरा सिक्न सक्दैनन्", "प्रविधि चलाउन सक्दैनन्", "सम्हाल्न सक्दैनन्"],
    "neutral_sentence": [
        "आजको मौसम राम्रो छ।", "किताब पढ्नु स्वास्थ्यका लागि राम्रो हुन्छ।", "नेपालमा धेरै पर्यटक आउँछन्।",
        "शिक्षा सबैको अधिकार हो।", "कम्प्युटर प्रविधि विकसित हुँदैछ।", "स्वास्थ्यका लागि व्यायाम आवश्यक छ।",
        "पर्यावरण संरक्षण सबैको दायित्व हो।", "विज्ञानले जीवन सहज बनाएको छ।", "कला राष्ट्रको पहिचान हो।",
        "खेलकुदले अनुशासन सिकाउँछ।", "यो वर्ष कृषि उत्पादन बढ्यो।", "सडक निर्माण कार्य भइरहेको छ।",
        "समाजमा समानता आवश्यक छ।", "पढाइ राम्रो लाग्छ।", "नेपाल घुम्न मजा आउँछ।", "वातावरण जोगाउनुपर्छ।"
    ]
}

def generate_sentence():
    template, main_cat = random.choice(templates)
    sentence = template
    
    # Replace placeholders
    for key in fillers:
        while "{" + key + "}" in sentence:
            if key == "neutral_sentence":
                sentence = random.choice(fillers[key])
            else:
                sentence = sentence.replace("{" + key + "}", random.choice(fillers[key]), 1)
    
    # Binary labels: only ONE category = 1, or all 0
    labels = {cat: 0 for cat in categories}
    
    if main_cat is not None:
        labels[main_cat] = 1   # Strictly single label
    # If main_cat is None → neutral (all 0)
    
    return {"text": sentence, **labels}

# Generate 15,000 samples
dataset = [generate_sentence() for _ in range(15000)]

# Save to JSON file
with open("nepali_binary_bias_dataset_15k.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print("✅ सफलतापूर्वक १५,००० entries भएको BINARY classification dataset generate भयो!")
print("फाइल नाम: nepali_binary_bias_dataset_15k.json")
print("\nउदाहरण (पहिलो ३ entries):")
for i in range(3):
    print(json.dumps(dataset[i], ensure_ascii=False, indent=2))