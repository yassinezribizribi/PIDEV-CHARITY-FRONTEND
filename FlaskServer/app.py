from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Update file paths
prophet_forecast_file = os.path.join(current_dir, 'data', 'prophet_forecast.csv')
data_file = os.path.join(current_dir, 'data', 'data1.csv')

# Load Prophet forecast data
try:
    logger.info(f"Loading Prophet forecast from: {prophet_forecast_file}")
    prophet_forecast = pd.read_csv(prophet_forecast_file)
    logger.info("Prophet forecast data loaded successfully")
except Exception as e:
    logger.error(f"Error loading Prophet forecast data: {str(e)}")
    prophet_forecast = None

# Load crisis data
try:
    logger.info(f"Loading data from: {data_file}")
    df = pd.read_csv(data_file)
    logger.info(f"Data loaded successfully. {len(df)} records found.")
except Exception as e:
    logger.error(f"Error loading data: {str(e)}")
    df = pd.DataFrame()

# Data loading and preprocessing
def load_and_preprocess_data():
    try:
        logger.info(f"Loading data from: {data_file}")
        df = pd.read_csv(data_file, parse_dates=['Date'])
        
        # Clean and standardize data
        df['Need Type'] = df['Need Type'].str.strip().str.lower().str.replace('&', 'and')
        df['Governorate'] = df['Governorate'].str.strip().str.title()
        df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce').fillna(0)
        
        # Remove future dates (beyond current date)
        current_date = datetime.now()
        df = df[df['Date'] <= current_date]
        
        logger.info(f"Data loaded successfully. {len(df)} records found.")
        return df
    
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return pd.DataFrame()

# Global crisis dataframe
CRISIS_DF = load_and_preprocess_data()

@app.route('/api/flask/predict/resource-allocation', methods=['GET'])
def get_available_data():
    try:
        if CRISIS_DF.empty:
            return jsonify({'error': 'No data available'}), 500
            
        available_governorates = sorted(CRISIS_DF['Governorate'].unique().tolist())
        available_need_types = sorted(CRISIS_DF['Need Type'].unique().tolist())
        
        return jsonify({
            'available_governorates': available_governorates,
            'available_need_types': available_need_types
        })
    except Exception as e:
        logger.error(f"Error in get_available_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/flask/predict/resource-allocation', methods=['POST'])
def predict_resource_allocation():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Empty request body'}), 400
        
        # Get crisis data from request
        crisis_location = data.get('location')  # This comes from the crisis object
        crisis_status = data.get('status')      # This comes from the crisis object
        need_type = data.get('resourceType')
        
        if not crisis_location or not need_type:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Filter data for the crisis location and need type
        filtered_data = CRISIS_DF[
            (CRISIS_DF['Governorate'].str.lower() == crisis_location.lower()) & 
            (CRISIS_DF['Need Type'].str.lower() == need_type.lower())
        ]
        
        if len(filtered_data) < 2:
            return jsonify({'error': 'Insufficient data for prediction'}), 400
        
        # Get forecast data from Prophet
        forecast_df = prophet_forecast[
            (prophet_forecast['ds'] >= datetime.now()) & 
            (prophet_forecast['ds'] <= (datetime.now() + timedelta(days=14)))
        ]
        
        forecast = []
        for _, row in forecast_df.iterrows():
            forecast.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'predicted': round(row['yhat'], 2),
                'upper': round(row['yhat_upper'], 2),
                'lower': round(row['yhat_lower'], 2)
            })
        
        # Calculate risk score based on crisis status and historical data
        max_quantity = filtered_data['Quantity'].max()
        total_quantity = filtered_data['Quantity'].sum()
        
        # Adjust risk score based on crisis status
        base_risk_score = min(100, max(0, int((max_quantity / total_quantity) * 100)))
        if crisis_status == 'HIGH':
            risk_score = min(100, base_risk_score + 30)
        elif crisis_status == 'MEDIUM':
            risk_score = min(100, base_risk_score + 15)
        else:
            risk_score = base_risk_score
        
        # Resource allocation based on crisis status
        if crisis_status == 'HIGH':
            allocation = [
                {'location': crisis_location, 'resources': int(total_quantity * 0.6), 'priority': 'HIGH'},
                {'location': 'Regional Centers', 'resources': int(total_quantity * 0.3), 'priority': 'MEDIUM'},
                {'location': 'National Reserve', 'resources': int(total_quantity * 0.1), 'priority': 'LOW'}
            ]
        elif crisis_status == 'MEDIUM':
            allocation = [
                {'location': crisis_location, 'resources': int(total_quantity * 0.5), 'priority': 'HIGH'},
                {'location': 'Regional Centers', 'resources': int(total_quantity * 0.3), 'priority': 'MEDIUM'},
                {'location': 'National Reserve', 'resources': int(total_quantity * 0.2), 'priority': 'LOW'}
            ]
        else:
            allocation = [
                {'location': crisis_location, 'resources': int(total_quantity * 0.4), 'priority': 'MEDIUM'},
                {'location': 'Regional Centers', 'resources': int(total_quantity * 0.4), 'priority': 'MEDIUM'},
                {'location': 'National Reserve', 'resources': int(total_quantity * 0.2), 'priority': 'LOW'}
            ]
        
        response = {
            'crisis_status': crisis_status,
            'risk_score': risk_score,
            'forecast': forecast,
            'resource_allocation': allocation
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
