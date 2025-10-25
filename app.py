from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import pandas as pd
from preprocessing.preprocessing import preprocess_input
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os, json
from datetime import datetime

# --- Flask setup ---
app = Flask(__name__)
CORS(app)  # allow cross-origin requests (mainly for dev)
load_dotenv()  # load Hugging Face token from .env

# --- Load ML models ---
reg_model = joblib.load("models/regression_model.joblib")
clf_model = joblib.load("models/classification_model.joblib")

# --- Chatbot setup ---
token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
chat_client = InferenceClient(model="mistralai/Mistral-7B-Instruct-v0.2", token=token)

CASES_FILE = "cases.json"


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

# --- Routes for main app ---
@app.route("/")
def home():
    return render_template("homePage.html")  

@app.route("/hospital")
def hospital():
    return render_template("Hospital.html")

@app.route("/patient")
def patient():
    return render_template("Patient.html")

@app.route("/chatbot")
def chatbot():
    return render_template("chatbot.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        processed_input = preprocess_input(data)

        reg_pred = reg_model.predict(processed_input)[0]
        clf_pred = clf_model.predict(processed_input)[0]

        return jsonify({
            "regression_prediction": float(reg_pred),
            "classification_prediction": int(clf_pred)
        })
    except Exception as e:
        return jsonify({"error": str(e)})

# --- Routes for chatbot ---
@app.route("/triage", methods=["POST"])
def triage():
    data = request.get_json()
    patient_text = data.get("message", "").strip()
    if not patient_text:
        return jsonify({"error": "No description provided"}), 400

    # System prompt explaining the assistant role
    system_prompt = (
    "You are a medical assistant providing information only. "
    "Do NOT give diagnoses. Choose one of the following options ONLY: "
    "'Go to the ER now', 'See a doctor within 24–48 hours', or 'Self-care at home'. "
    "Respond concisely in English in one or two sentences. "
    "Do NOT add extra explanations or hallucinate medications."
)


    # Format messages for chat_completion
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": patient_text}
    ]

    try:
        # Call the model using chat_completion
        api_response = chat_client.chat_completion(
            messages=messages,
            max_tokens=100,
            temperature=0.0
        )

        # Debug: see raw response (optional)
        # print(api_response)

        # Extract response safely
        if "choices" in api_response and len(api_response["choices"]) > 0:
            response = api_response["choices"][0]["message"]["content"]
        else:
            response = "⚠️ لم يتم تلقي رد من النموذج."

    except Exception as e:
        response = f"⚠️ حدث خطأ أثناء الاتصال بالنموذج: {str(e)}"

    # Save the case to JSON
    case = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "description": patient_text,
        "model_response": response
    }
    save_case(case)

    return jsonify({"reply": response})



@app.route("/cases", methods=["GET"])
def get_cases():
    """Return all logged patient cases"""
    return jsonify(load_cases())

# --- Run app ---
if __name__ == "__main__":
    app.run(debug=True)
