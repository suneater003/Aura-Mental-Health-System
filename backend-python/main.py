# backend-python/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

# 🚨 Tumhari file se import
from heuristics import HeuristicBrain

app = FastAPI()

# 🛡️ Heuristics Class ko initialize kar rahe hain
safety_engine = HeuristicBrain()

print("🧠 Waking up Aura's Brain on Local Machine...")

# --- 1. LOAD THE FINE-TUNED MODEL FROM YOUR ZIP FOLDER ---
base_model_id = "google/gemma-2-2b-it"

# Tokenizer tumhare 'Aura_Brain' folder se load hoga
tokenizer = AutoTokenizer.from_pretrained("./Aura_Brain")

# Base model load kar rahe hain (Float16 taaki laptop crash na ho)
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_id,
    device_map="auto",
    torch_dtype=torch.float16
)

# Base model ke upar tumhara Trained Dimaag (Adapter) attach kar rahe hain
model = PeftModel.from_pretrained(base_model, "./Aura_Brain")

print("✅ Aura is Ready and Listening!")

# --- 2. API ENDPOINTS ---

class ChatRequest(BaseModel):
    user_message: str
    history: list = []

@app.post("/api/chat")
def chat_with_aura(request: ChatRequest):
    message = request.user_message
    history = request.history
    
    # ---------------------------------------------------------
    # STEP 1: TUMHARA HEURISTICS SYSTEM (Safety Check)
    # ---------------------------------------------------------
    # 🚨 'analyze_text' ko apne actual function naam se replace kar dena agar alag hai
    heuristic_result = safety_engine.analyze(message) 
    
    # Agar heuristics function se koi trigger mila, toh model ko bypass karo
    if heuristic_result.get("triggered"):
        return {
            "response": heuristic_result["response"],
            "action": heuristic_result["action"] # e.g., 'trigger_breathing', 'trigger_warning'
        }
        
    # ---------------------------------------------------------
    # STEP 2: MODEL GENERATION (Agar heuristics safe hai)
    # ---------------------------------------------------------
    prompt = ""
    is_first_message = True
    
    # History build karna
    for user_msg, bot_msg in history:
        if is_first_message:
             prompt += f"<start_of_turn>user\nYou are Aura, an empathetic mental health companion.\n\nUser: {user_msg}<end_of_turn>\n<start_of_turn>model\n{bot_msg}<end_of_turn>\n"
             is_first_message = False
        else:
             prompt += f"<start_of_turn>user\n{user_msg}<end_of_turn>\n<start_of_turn>model\n{bot_msg}<end_of_turn>\n"
             
    # Naya message add karo
    if is_first_message:
        prompt += f"<start_of_turn>user\nYou are Aura, an empathetic mental health companion.\n\nUser: {message}<end_of_turn>\n<start_of_turn>model\n"
    else:
        prompt += f"<start_of_turn>user\n{message}<end_of_turn>\n<start_of_turn>model\n"
    
    # Inputs taiyar karo GPU/CPU ke liye
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    
    # Model se response generate karwao
    outputs = model.generate(
        **inputs, 
        max_new_tokens=200, 
        temperature=0.4, 
        do_sample=True,      
        top_p=0.9,           
        repetition_penalty=1.2 
    )
    
    # Response ko decode karke clean text nikalo
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    final_reply = response.split("model\n")[-1].strip()
    
    return {
        "response": final_reply,
        "action": "normal_chat"
    }