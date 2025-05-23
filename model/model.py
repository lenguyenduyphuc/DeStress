from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "NguyenDuyPhuc/DistressAI"
model = AutoModelForCausalLM.from_pretrained(model_name).to(device)
tokenizer = AutoTokenizer.from_pretrained(model_name)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    messages = data.get('messages', [])
    
    max_tokens = data.get('max_tokens', 200)
    temperature = data.get('temperature', 0.8)
    top_p = data.get('top_p', 0.9)
    
    formatted_prompt = tokenizer.apply_chat_template(messages, tokenize=False)
    inputs = tokenizer(formatted_prompt, return_tensors="pt").to(device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        pad_token_id=tokenizer.eos_token_id
    )
    
    full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    assistant_response = extract_assistant_response(full_response, formatted_prompt)
    
    return jsonify({"response": assistant_response})

def extract_assistant_response(full_response, prompt):
    if full_response.startswith(prompt):
        response_without_prompt = full_response[len(prompt):].strip()
    else:
        response_without_prompt = full_response
 
    if "assistant" in response_without_prompt.lower():
        parts = response_without_prompt.split("assistant", 1)
        if len(parts) > 1:
            last_part = parts[-1].strip()
            last_part = last_part.lstrip(": ")
            return last_part
    
    if "user" in response_without_prompt.lower():
        user_parts = response_without_prompt.lower().split("user")
        if len(user_parts) > 1:
            last_user_section = user_parts[-1]
            if "assistant" in last_user_section:
                assistant_part = last_user_section.split("assistant", 1)[1].strip()
                return assistant_part.lstrip(": ")
    
    return response_without_prompt

if __name__ == '__main__':
    app.run(port=5000)