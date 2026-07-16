import google.generativeai as genai
import json
from core.config import settings

# This is equivalent to setting up a service like OpenAI or Anthropic in Node.js.
# We initialize the Gemini client with our API key.
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# We use the Gemini 2.5 Pro model for deep reasoning and data extraction
model = genai.GenerativeModel('gemini-2.5-pro')
# We use the embedding model to generate vectors for our semantic search
embed_model = 'models/gemini-embedding-2'

def analyze_article(text: str) -> dict:
    """
    Sends the article text to Gemini and asks for a structured JSON response
    containing the summary, business impact, technical impact, and a relevance flag.
    """
    prompt = f"""
    You are an expert AI business and technical analyst.
    Analyze the following article text and extract intelligence.
    
    Return EXACTLY a JSON object with the following schema, and no other text or markdown formatting:
    {{
      "bullet_points": "A concise 3-5 bullet point summary of the article's core facts",
      "technical_impact": "How this affects developers, engineers, or the tech stack",
      "business_impact": "How this affects founders, investors, or market dynamics",
      "business_relevant": true or false (Is this highly relevant to AI business/tech?)
    }}
    
    Article Text:
    {text}
    """
    
    try:
        print("🤖 Sending text to Gemini for analysis...")
        response = model.generate_content(prompt)
        
        # Clean up the response in case Gemini added markdown code blocks
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        result = json.loads(clean_text)
        return result
    except Exception as e:
        print(f"❌ Error parsing Gemini response: {e}")
        # Return a fallback structure if it fails
        return {
            "bullet_points": "Failed to generate summary.",
            "technical_impact": "N/A",
            "business_impact": "N/A",
            "business_relevant": False
        }

def generate_embedding(text: str) -> list:
    """
    Converts the text (usually the summary) into a 768-dimensional mathematical vector.
    """
    try:
        print("🔢 Generating embedding vector...")
        result = genai.embed_content(
            model=embed_model,
            content=text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        return result['embedding']
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return [0.0] * 768
