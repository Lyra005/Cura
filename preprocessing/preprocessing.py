import joblib
import pandas as pd

# Load fitted pipeline and training feature columns
pipeline = joblib.load("models/preprocessing_pipeline.joblib")
feature_columns = joblib.load("models/feature_columns.joblib")

def preprocess_input(data: dict):
    input_df = pd.DataFrame([data])
    input_df = input_df.reindex(columns=feature_columns, fill_value=0)
    processed_input = pipeline.transform(input_df)
    return processed_input
