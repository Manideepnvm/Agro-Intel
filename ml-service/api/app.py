from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import pickle

app = Flask(__name__)
CORS(app)

# Load ML models
crop_prediction_model = tf.keras.models.load_model('../models/crop_prediction/model.h5')
yield_prediction_model = pickle.load(open('../models/yield_prediction/model.pkl', 'rb'))

@app.route('/predict/crop', methods=['POST'])
def predict_crop():
    data = request.json
    # Process input data and make predictions
    prediction = crop_prediction_model.predict(data)
    return jsonify({'prediction': prediction.tolist()})

@app.route('/predict/yield', methods=['POST'])
def predict_yield():
    data = request.json
    # Process input data and make predictions
    prediction = yield_prediction_model.predict(data)
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(port=5000) 