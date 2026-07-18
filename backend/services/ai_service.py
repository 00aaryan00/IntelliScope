import google.generativeai as genai
import json
from core.config import settings

# This is equivalent to setting up a service like OpenAI or Anthropic in Node.js.
# We initialize the Gemini client with our API key.
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# We use the Gemini 2.0 Flash model for deep reasoning and data extraction
model = genai.GenerativeModel('gemini-2.0-flash')
# We use the embedding model to generate vectors for our semantic search
embed_model = 'models/gemini-embedding-2'

import requests

def analyze_article(text: str) -> dict:
    """
    Sends the article text to Groq and asks for a structured JSON response
    containing the summary, business impact, technical impact, and a relevance flag.
    """
    prompt = f"""
    You are an expert AI business and technical analyst.
    Analyze the following article text and extract intelligence.
    
    Return EXACTLY a JSON object with the following schema, and NO other text, markdown, or explanations:
    {{
      "bullet_points": "A concise 3-5 bullet point summary of the article's core facts",
      "technical_impact": "How this affects developers, engineers, or the tech stack",
      "business_impact": "How this affects founders, investors, or market dynamics",
      "business_relevant": true or false (Is this highly relevant to AI business/tech?),
      "entities": ["list", "of", "companies", "people", "or", "technologies", "mentioned"],
      "locations": ["list", "of", "countries", "mentioned", "or", "impacted"],
      "category": "Must be exactly one of: [news, funding, research, models, vc, gov, opensource, dev, social, business]",
      "sentiment": "Must be one of: [Positive, Neutral, Negative, Cautionary]",
      "action_hint": "Must be one of: [Watch, Research Further, Consider Action, Informational Only]"
    }}
    
    Article Text:
    {text}
    """
    
    API_URL = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }
    
    try:
        print(f"[AI] Sending text to Groq ({API_URL}) for analysis...")
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        output_text = response.json()['choices'][0]['message']['content']
        
        # Clean up the response in case the model added markdown code blocks
        clean_text = output_text.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean_text)
        return result
    except Exception as e:
        print(f"[ERROR] Error parsing Groq response: {e}")
        if 'response' in locals() and hasattr(response, 'text'):
            print(f"[ERROR] Raw response: {response.text}")
        
        # Return a fallback structure if it fails
        return {
            "bullet_points": "Failed to generate summary.",
            "technical_impact": "N/A",
            "business_impact": "N/A",
            "business_relevant": False,
            "category": "news",
            "entities": [],
            "locations": [],
            "sentiment": "Neutral",
            "action_hint": "Informational Only"
        }

def generate_embedding(text) -> list:
    """
    Converts the text (usually the summary) into a 768-dimensional mathematical vector.
    """
    # Force the input to be a string just in case Groq returned a list for bullet_points
    if isinstance(text, list):
        text = " ".join(str(item) for item in text)
    elif not isinstance(text, str):
        text = str(text)
        
    try:
        print("[AI] Generating embedding vector...")
        result = genai.embed_content(
            model=embed_model,
            content=text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        
        emb = result['embedding']
        # If the API accidentally returned a batch (list of lists), grab the first one
        if isinstance(emb, list) and len(emb) > 0 and isinstance(emb[0], list):
            return emb[0]
            
        return emb
    except Exception as e:
        print(f"[ERROR] Error generating embedding: {e}")
        return [0.0] * 768
