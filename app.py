from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from preprocessing.preprocessing import preprocess_input

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load models 
reg_model = joblib.load("models/regression_model.joblib")
clf_model = joblib.load("models/classification_model.joblib")

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

if __name__ == "__main__":
    app.run(debug=True)