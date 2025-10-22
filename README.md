# CURΑ – Smart Hospital Crowd Predictor

**CURΑ** (Latin for "Cure") is an AI-powered web application that predicts **hospital crowding levels** in real-time. It helps administrators **optimize staff allocation**, **reduce waiting times**, and **improve the patient experience**.

## Table of Contents
- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Workflow](#workflow)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Machine Learning Models](#machine-learning-models)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project_structure)
- [Future Enhancements](#future-enhancements)
- [Team](#team)

## Problem Statement
Hospitals often struggle to manage patient flow efficiently, leading to:
- Long waiting times
- Under- or over-staffing
- Poor patient satisfaction

This project aims to **predict hospital crowding** for today and the next two days, allowing better scheduling and decision-making.

## Solution Overview
The system uses **Machine Learning models** in a two-step process:

1.Patient Count Prediction: The first model estimates the expected number of patients in each department.

2.Crowding Level Classification: The second model takes the output of the first model and determines the crowding level (Low, Medium, or High). These are the predictions displayed to users in the application.

**Administrator Benefits:**

The web dashboard allows them to:

- See predicted crowding by department and time slot.

- Adjust staff allocation based on forecasts.

- Filter predictions by department for targeted planning.

**Patient Benefits:**

The system helps patients choose the best time for non-urgent visits by:

- Showing expected crowding levels across departments and time slots.

- Allowing them to plan visits when wait times are likely lowest.

## Workflow
1. The frontend sends a request to `/predict` (Flask backend).
2. The backend loads the trained models.
3. Predictions are made for today + the next 2 days.
4. The frontend displays the results in a clean dashboard.

## Key Features
-  Predict crowding for today + next 2 days  
-  Department-based filtering  
-  Dual prediction models (Regression + Classification)   
-  Chatbot-ready design (for future enhancement)  

## Tech Stack

### **Frontend**
- HTML, CSS, JavaScript 
- Dashboard for viewing predictions

### **Backend**
- Python (Flask)
- Joblib (for loading ML models)
- Pandas, NumPy, Scikit-learn

### **ML Models**
- Regression Model → predicts the number of patients  
- Classification Model → predicts crowding level (High / Medium / Low)

## Machine Learning Models

## Machine Learning Models

| Model Type    | Target        |Algorithm              | Performance (Metric)         | Output                         | Notes / Rationale |
|---------------|---------------|----------------------|------------------------------|--------------------------------|------------------|
| Regression    | Num_Patients  | LinearRegression | MSE: 8.396        | Predicted number of patients  | Chosen for handling linear relationships and capturing feature interactions effectively |
| Classification| Label         | LogisticRegression| Precision: 0.83, recall: 0.82, F1-score: 0.82| Crowding level (High, Medium, Low) | Works well for multi-class classification and is robust to overfitting |


Both models were trained, tested, and saved using **joblib** for production use.

## Installation & Setup

1. Clone the Repository
```
git clone https://github.com/Lyra005/Cura.git
```

2. Create Virtual Environment
```
python -m venv venv 
venv\Scripts\activate
```

3. Install Dependencies
 ```
 pip install -r requirements.txt
 ```

4. Run Flask Server
```
python app.py
```

## Project Structure

```
CURA/
├─ models/
|  ├─ regression_model.joblib
|  ├─ classification_model.joblib
|  ├─ feature_columns.joblib
|  ├─ preprocessing_pipeline.joblib
|  ├─ train_models.ipynb
|  └─ hospital_crowding_data_v2.csv
├─ preprocessing/
|  ├─ preprocessing.py
├─ 
├─ app.py
├─ requirements.txt
└─ README.md
```

## Future Enhancements

- Integrate a chatbot can book an appointment for the patients.

- Add reminder system for appointments & checkups

- Build a mobile-friendly interface

## Team

- Sedra: Project Lead, UI/UX Designer, Frontend Developer

- Yazeed: AI Developer

- Leen: Backend & System Design
