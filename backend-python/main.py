# backend-python/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import requests
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

from heuristics import HeuristicBrain

# ==========================================
# 🔐 ENVIRONMENT VARIABLES
# ==========================================
load_dotenv()

KEYS = {
    "GROQ": os.getenv("GROQ_API_KEY"),
    "GEMINI_1": os.getenv("GEMINI_API_KEY_1"),
    "GEMINI_2": os.getenv("GEMINI_API_KEY_2"),
    "HF": os.getenv("HF_TOKEN")
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

safety_engine = HeuristicBrain()
print("🧠 Waking up Aura's Ultimate Waterfall Brain (Gemini 2.5 & Groq 🚀)...")

# ==========================================
# 🧠 LOCAL MODEL (Emotion Classifier)
# ==========================================
try:
    print("Loading distilbert-base-uncased-finetuned-emotion (Emotion Classifier)...")
    empathy_tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-emotion")
    empathy_model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert-base-uncased-finetuned-emotion",
        device_map="auto"
    )
    print("✅ Emotion classifier model loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load emotion classifier model. Using keyword fallback instead. Error: {e}")
    empathy_model = None
    empathy_tokenizer = None
    EMOTION_CLASSES = ["angry", "fearful", "joyful", "neutral", "sad", "surprised"]  # Common emotion labels
except Exception as e:
    print(f"⚠️ Warning: Could not load Aura_Brain. Falling back to zero-shot classification. Error: {e}")
    empathy_model = None
    empathy_tokenizer = None
    EMOTION_CLASSES = []

# ==========================================
# 🌊 THE WATERFALL LOGIC (API Callers)
# ==========================================
def call_groq(model, system_context, history, user_message, api_key):
    messages = [{"role": "system", "content": system_context}]
    for u_msg, b_msg in history:
        messages.extend([{"role": "user", "content": u_msg}, {"role": "assistant", "content": b_msg}])
    messages.append({"role": "user", "content": user_message})
    
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": model, "messages": messages, "temperature": 0.5}
    )
    response.raise_for_status() # Yeh exact HTTP error fekega agar kuch galat hua
    return response.json()['choices'][0]['message']['content']

def call_gemini(model, system_context, history, user_message, api_key):
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel(model)
    
    prompt = f"System: {system_context}\n\n"
    for u_msg, b_msg in history:
         prompt += f"User: {u_msg}\nAura: {b_msg}\n"
    prompt += f"User: {user_message}\nAura: "
    
    response = gemini_model.generate_content(prompt)
    return response.text

def call_hf(model, system_context, history, user_message, api_key):
    prompt = f"<|system|>\n{system_context}</s>\n"
    for u_msg, b_msg in history:
        prompt += f"<|user|>\n{u_msg}</s>\n<|assistant|>\n{b_msg}</s>\n"
    prompt += f"<|user|>\n{user_message}</s>\n<|assistant|>\n"
    
    response = requests.post(
        f"https://api-inference.huggingface.co/models/{model}",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"inputs": prompt, "parameters": {"max_new_tokens": 200, "return_full_text": False}}
    )
    response.raise_for_status()
    return response.json()[0]['generated_text']

# ==========================================
# 📋 WATERFALL MASTER LIST (Updated Models)
# ==========================================
WATERFALL_CONFIG = [
    # 1. GROQ (Speed King - Updated Models)
    {"provider": "GROQ", "key_name": "GROQ", "func": call_groq, "models": ["llama-3.3-70b-versatile", "gemma2-9b-it", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]},
    
    # 2. GEMINI ENGINE 1 (Tera Naya Tier List)
    {"provider": "GEMINI_1", "key_name": "GEMINI_1", "func": call_gemini, "models": ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]},
    
    # 3. GEMINI ENGINE 2 (Backup)
    {"provider": "GEMINI_2", "key_name": "GEMINI_2", "func": call_gemini, "models": ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]},
    
    # 4. HUGGING FACE (Last Resort)
    {"provider": "HF", "key_name": "HF", "func": call_hf, "models": ["meta-llama/Meta-Llama-3-8B-Instruct", "TinyLlama/TinyLlama-1.1B-Chat-v1.0"]}
]

# ==========================================
# 🌐 API ENDPOINTS
# ==========================================
class ChatRequest(BaseModel):
    user_message: str
    history: list = []

class SummarizeRequest(BaseModel):
    history_text: str

@app.post("/api/summarize_chat")
async def summarize_chat(request: SummarizeRequest):
    history_text = request.history_text
    
    system_context = """
    You are an emotion-focused psychological analyzer. The user has been talking to a wellness bot (Aura) for a day.
    Based on the following transcript, provide:
    1. A short, compassionate 2-3 sentence summary of the main concerns/topics the user discussed.
    2. A 'category' classification of either "positive" or "tough" depending on the overall day's discussion weight.
    
    Return pure JSON exclusively in this exact format:
    {"summary": "your short summary here", "day_category": "positive or tough"}
    """

    for config in WATERFALL_CONFIG:
        api_key = KEYS[config["key_name"]]
        if not api_key:
            continue
            
        for model in config["models"]:
            try:
                # Use standard generator function mapping (ignoring history for this pure prompt)
                if config["provider"] == "GROQ":
                    reply = call_groq(model, system_context, [], history_text, api_key)
                elif "GEMINI" in config["provider"]:
                    reply = call_gemini(model, system_context, [], history_text, api_key)
                else:
                    reply = call_hf(model, system_context, [], history_text, api_key)
                
                # Cleanup logic if markdown codeblocks were returned
                cleaned = reply.replace("```json", "").replace("```", "").strip()
                import json
                data = json.loads(cleaned)
                return {"summary": data.get("summary", ""), "day_category": data.get("day_category", "positive").lower()}
            except Exception as e:
                continue

    return {"summary": "Aura analyzed your day and noticed engaging conversations to regulate anxiety.", "day_category": "positive"}

@app.post("/api/chat")
async def chat_with_aura(request: ChatRequest):
    message = request.user_message
    history = request.history
    
    # --- 1. HEURISTICS ---
    heuristic_result = safety_engine.analyze(message) 
    if heuristic_result.get("crisis"):
        return {"response": heuristic_result.get("response"), "action": "trigger_warning"}
        
    # --- 2. INTENT CLASSIFICATION ---
    detected_intent = "neutral"
    if empathy_model:
        try:
            inputs = empathy_tokenizer(message, return_tensors="pt", truncation=True, max_length=512).to(empathy_model.device)
            predicted_class_id = empathy_model(**inputs).logits.argmax().item()
            detected_intent = empathy_model.config.id2label.get(predicted_class_id, "unknown")
        except: pass

    # --- 3. WATERFALL GENERATION ---
    system_context = f"You are Aura, an empathetic wellness companion. The user is feeling: {detected_intent}. Keep your response concise, conversational, and compassionate."
    
    for config in WATERFALL_CONFIG:
        api_key = KEYS[config["key_name"]]
        if not api_key:
            print(f"⚠️ Skipping {config['provider']} - API Key missing in .env")
            continue 
            
        for model in config["models"]:
            try:
                print(f"🔄 Attempting Generation via {config['provider']} | Model: {model}...")
                reply = config["func"](model, system_context, history, message, api_key)
                
                if reply:
                    print(f"✅ SUCCESS! Generated via {config['provider']} ({model})")
                    return {"response": reply.strip(), "action": "normal_chat"}
                    
            except Exception as e:
                # 🚨 YAHAN ASLI ERROR PRINT HOGA AB!
                print(f"❌ {config['provider']} ({model}) FAILED!")
                print(f"   Reason: {str(e)}")
                continue 

    return {
        "response": "I'm having a little cognitive glitch right now. All my thought streams are busy. Give me a second and try again!",
        "action": "normal_chat"
    }

# ==========================================
# 🎯 MOOD ANALYSIS ENDPOINT
# ==========================================
class MoodAnalysisRequest(BaseModel):
    text: str
    mood_score: int = None  # Optional: 1-5 scale

@app.post("/api/analyze_mood")
async def analyze_mood(request: MoodAnalysisRequest):
    """
    Analyzes text input for emotion classification.
    Returns emotion classification and valence (positive/tough/neutral).
    Uses both ML model and keyword fallback for robust detection.
    """
    text = request.text
    mood_score = request.mood_score  # Can be 1-5 from client
    
    emotion_label = "neutral"
    confidence = 0.0
    valence = "neutral"  # positive, neutral, tough
    
    # --- KEYWORD-BASED EMOTION DETECTION (Primary Method) ---
    # This is more reliable than ML models for simple detection
    positive_keywords = {
        "happy": "joy", "joyful": "joy", "great": "joy", "excited": "joy", 
        "amazing": "joy", "wonderful": "joy", "love": "joy", "peaceful": "joy",
        "calm": "joy", "grateful": "joy", "good": "joy", "excellent": "joy",
        "fantastic": "joy", "lovely": "joy", "brilliant": "joy", "blessed": "joy",
        "energized": "joy", "motivated": "joy", "confident": "joy"
    }
    
    negative_keywords = {
        "sad": "sadness", "depressed": "sadness", "down": "sadness", "unhappy": "sadness",
        "angry": "anger", "frustrated": "anger", "mad": "anger", "irritated": "anger",
        "anxious": "fear", "scared": "fear", "worried": "fear", "stressed": "fear",
        "terrified": "fear", "panic": "fear", "nervous": "fear",
        "tired": "sadness", "exhausted": "sadness", "drained": "sadness", "empty": "sadness",
        "lonely": "sadness", "hopeless": "sadness", "worthless": "sadness", "guilty": "sadness",
        "ashamed": "sadness", "regret": "sadness", "upset": "sadness", "miserable": "sadness",
        "devastated": "sadness", "useless": "sadness", "stupid": "sadness"
    }
    
    text_lower = text.lower()
    
    # Count sentiment keywords
    pos_score = 0
    neg_score = 0
    detected_emotion = "neutral"
    
    for keyword, emotion in positive_keywords.items():
        if keyword in text_lower:
            pos_score += text_lower.count(keyword)
            detected_emotion = emotion
    
    for keyword, emotion in negative_keywords.items():
        if keyword in text_lower:
            neg_score += text_lower.count(keyword)
            detected_emotion = emotion
    
    print(f"🎯 Analyzing mood: '{text[:60]}...'")
    print(f"   Keyword scores: positive={pos_score}, negative={neg_score}")
    
    # Determine emotion and valence from keyword analysis
    if neg_score > pos_score and neg_score > 0:
        emotion_label = detected_emotion
        valence = "tough"
        confidence = min(0.95, 0.5 + (neg_score * 0.1))
        print(f"   ✅ Detected: {emotion_label} (negative, confidence: {confidence:.2f})")
    elif pos_score > neg_score and pos_score > 0:
        emotion_label = detected_emotion
        valence = "positive"
        confidence = min(0.95, 0.5 + (pos_score * 0.1))
        print(f"   ✅ Detected: {emotion_label} (positive, confidence: {confidence:.2f})")
    else:
        # --- FALLBACK: USE ML MODEL IF AVAILABLE ---
        if empathy_model and empathy_tokenizer:
            try:
                print(f"   Using ML model as fallback...")
                inputs = empathy_tokenizer(text, return_tensors="pt", truncation=True, max_length=512).to(empathy_model.device)
                
                with torch.no_grad():
                    outputs = empathy_model(**inputs)
                    logits = outputs.logits
                    probabilities = torch.softmax(logits, dim=-1)
                    predicted_class_id = logits.argmax().item()
                    confidence = probabilities[0][predicted_class_id].item()
                
                if hasattr(empathy_model.config, 'id2label'):
                    emotion_label = empathy_model.config.id2label.get(predicted_class_id, "neutral")
                else:
                    emotion_label = "neutral"
                
                print(f"   ✅ ML Model: {emotion_label} (confidence: {confidence:.2f})")
                
                # Infer valence from emotion
                emotion_lower = emotion_label.lower()
                if any(neg in emotion_lower for neg in ["sad", "angry", "fear", "anxious", "stressed", "depressed"]):
                    valence = "tough"
                elif any(pos in emotion_lower for pos in ["joy", "happy", "love", "peaceful", "excited"]):
                    valence = "positive"
                else:
                    valence = "neutral"
                    
            except Exception as e:
                print(f"   ⚠️ ML Model failed: {e}, using mood_score")
                if mood_score:
                    if mood_score >= 4:
                        valence = "positive"
                    elif mood_score <= 2:
                        valence = "tough"
        else:
            print(f"   No model available, using mood_score fallback")
            if mood_score:
                if mood_score >= 4:
                    valence = "positive"
                    emotion_label = "positive"
                elif mood_score <= 2:
                    valence = "tough"
                    emotion_label = "sad"
                else:
                    emotion_label = "neutral"
                confidence = 0.5
    
    return {
        "emotion": emotion_label,
        "confidence": confidence,
        "valence": valence,
        "text": text[:100]
    }


# ==========================================
# 🚀 SERVER STARTUP
# ==========================================
if __name__ == "__main__":
    import uvicorn
    print("\n✅ FastAPI app is ready!")
    print("🚀 Starting Uvicorn server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)