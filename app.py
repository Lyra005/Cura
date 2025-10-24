from flask import Flask, request, jsonify, send_from_directory
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os, json
from datetime import datetime

# Load token
load_dotenv()
token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Initialize Hugging Face API client
client = InferenceClient(model="mistralai/Mistral-7B-Instruct-v0.2", token=token)

# Initialize Flask
app = Flask(__name__, static_folder="static")

# File to store patient cases
CASES_FILE = "cases.json"

# --- Helper functions ---
def load_cases():
    if not os.path.exists(CASES_FILE):
        return []
    with open(CASES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_case(case):
    cases = load_cases()
    cases.append(case)
    with open(CASES_FILE, "w", encoding="utf-8") as f:
        json.dump(cases, f, ensure_ascii=False, indent=2)

# --- Routes ---
@app.route("/")
def home():
    return send_from_directory("static", "index.html")

@app.route("/triage", methods=["POST"])
def triage():
    data = request.get_json()
    patient_text = data.get("description", "").strip()
    if not patient_text:
        return jsonify({"error": "No description provided"}), 400

    # System prompt in Arabic
    system_prompt = (
        "أنت مساعد طبي للمعلومات فقط. لا تقدم تشخيصات. "
        "اختر أحد الخيارات التالية فقط: "
        "'اذهب إلى الطوارئ الآن'، 'راجع الطبيب خلال ٢٤–٤٨ ساعة'، أو 'العناية الذاتية في المنزل'. "
        "اشرح السبب بإيجاز."
    )

    prompt = f"{system_prompt}\n\nالمريض: {patient_text}\n\nالإجابة:"

    # Get model output
    try:
        api_response = client.post(json={"inputs": prompt})
        # Handle possible API return structures
        if isinstance(api_response, list):
            response = api_response[0].get("generated_text", "")
        elif isinstance(api_response, dict):
            response = api_response.get("generated_text", "")
        else:
            response = str(api_response)
    except Exception as e:
        response = f"⚠️ حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي: {str(e)}"

    # Create a case entry
    case = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "description": patient_text,
        "model_response": response
    }

    # Save the case
    save_case(case)

    return jsonify(case)

@app.route("/cases", methods=["GET"])
def get_cases():
    """Return all logged patient cases"""
    return jsonify(load_cases())

if __name__ == "__main__":
    app.run(debug=True)
