from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
import re

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Get the current directory and data file path
current_dir = os.path.dirname(os.path.abspath(__file__))
data_file = os.path.join(current_dir, 'app', 'data', 'data1.csv')

def clean_numeric(value):
    """Clean numeric values by removing quotes, commas, and converting to float/int"""
    if not value:
        return 0
    # Remove all quotes and commas
    cleaned = value.replace('"', '').replace(',', '')
    try:
        return float(cleaned)
    except ValueError:
        return 0

def parse_line(line):
    """Parse a line of CSV data with proper handling of quoted fields"""
    # Remove trailing semicolon if present
    line = line.strip().rstrip(';')
    
    # First split by comma
    raw_fields = line.split(',')
    fields = []
    
    i = 0
    while i < len(raw_fields):
        field = raw_fields[i].strip()
        
        # Handle double quotes at the start
        if field.startswith('""'):
            field = field[2:]  # Remove the double quotes
            # Combine with next field if it contains the closing quote
            if i + 1 < len(raw_fields):
                next_field = raw_fields[i + 1].strip()
                if next_field.endswith('"'):
                    field = field + ',' + next_field[:-1]  # Remove the closing quote
                    i += 1
        
        # Clean the field
        field = field.strip().strip('"')
        fields.append(field)
        i += 1
    
    return fields

# Load and preprocess the crisis data
try:
    print(f"Attempting to load data from: {data_file}")
    # Read the raw file first
    with open(data_file, 'r', encoding='latin1') as f:
        lines = f.readlines()
    
    print("\nFirst few lines of the file:")
    for i, line in enumerate(lines[:5]):
        print(f"Line {i+1}: {line.strip()}")
    
    # Skip header row and clean and parse the data
    cleaned_data = []
    for line_num, line in enumerate(lines[1:], 2):  # Start from line 2 (after header)
        try:
            # Parse the line with proper handling of quoted fields
            fields = parse_line(line)
            print(f"\nProcessing line {line_num}:")
            print(f"Parsed fields: {fields}")
            
            if len(fields) >= 13:  # Ensure we have all required fields
                # Parse date
                try:
                    date_str = fields[0].strip()
                    print(f"Date string: {date_str}")
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                except ValueError as e:
                    print(f"Warning: Invalid date format in line {line_num}: {date_str}")
                    print(f"Error: {str(e)}")
                    continue
                
                # Extract and clean fields
                governorate = fields[1].strip()
                latitude = clean_numeric(fields[2])
                longitude = clean_numeric(fields[3])
                
                # Handle population (remove quotes and commas)
                population_str = fields[4].replace('"', '').replace(',', '')
                population = int(population_str) if population_str.strip() else 0
                
                # Need Type
                need_type = fields[5].strip()
                
                # Quantity (remove quotes and commas)
                quantity_str = fields[6].replace('"', '').replace(',', '')
                quantity = int(quantity_str) if quantity_str.strip() else 0
                
                # Beneficiaries type (string)
                beneficiaries_type = fields[7].strip()
                
                # Urgency (remove quotes and commas)
                urgency_str = fields[8].replace('"', '').replace(',', '')
                urgency = int(urgency_str) if urgency_str.strip() else 0
                
                # Remaining fields
                crisis_type = fields[9].strip()
                external_data_type = fields[10].strip()
                external_event = fields[11].strip() if len(fields) > 11 else ""
                source = fields[12].replace(';', '').strip() if len(fields) > 12 else ""
                
                # Validate numeric fields
                if not all(isinstance(x, (int, float)) for x in [latitude, longitude, population, quantity, urgency]):
                    print(f"Warning: Invalid numeric values in line {line_num}")
                    continue
                
                # Validate string fields
                if not all(isinstance(x, str) for x in [governorate, need_type, beneficiaries_type, crisis_type, external_data_type]):
                    print(f"Warning: Invalid string values in line {line_num}")
                    continue
                
                cleaned_data.append({
                    'Date': date_obj,
                    'Governorate': governorate,
                    'Latitude': latitude,
                    'Longitude': longitude,
                    'Population': population,
                    'Need Type': need_type,
                    'Quantity': quantity,
                    'Beneficiaries Type': beneficiaries_type,
                    'Urgency': urgency,
                    'Common Crisis Type': crisis_type,
                    'External Data Type': external_data_type,
                    'External Event': external_event,
                    'Source': source
                })
                print(f"Successfully processed line {line_num}")
        except (ValueError, IndexError) as e:
            print(f"Warning: Error processing line {line_num}: {str(e)}")
            print(f"Line content: {line.strip()}")
            continue
    
    if not cleaned_data:
        raise Exception("No valid data rows found in the CSV file")
    
    # Convert to DataFrame
    CRISIS_DF = pd.DataFrame(cleaned_data)
    
    # Ensure proper data types
    CRISIS_DF['External Data Type'] = CRISIS_DF['External Data Type'].astype(str)
    CRISIS_DF['External Event'] = CRISIS_DF['External Event'].astype(str)
    CRISIS_DF['Source'] = CRISIS_DF['Source'].astype(str)
    
    print("\nData loaded successfully!")
    print("Columns:", CRISIS_DF.columns.tolist())
    print("\nFirst few rows:")
    print(CRISIS_DF.head())
    print("\nData types:")
    print(CRISIS_DF.dtypes)
except Exception as e:
    print(f"Error loading data: {str(e)}")
    CRISIS_DF = pd.DataFrame()

@app.route('/api/flask/predict/resource-allocation', methods=['POST'])
def predict_resource_allocation():
    try:
        data = request.get_json()
        print(f"Received request data: {data}")  # Debug print
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'details': 'Request body is empty'
            }), 400
            
        # Map the incoming parameters to the expected names
        governorate = data.get('region')  # Changed from 'governorate' to 'region'
        need_type = data.get('resourceType')  # Changed from 'needType' to 'resourceType'
        
        print(f"Extracted parameters - region: {governorate}, resourceType: {need_type}")  # Debug print
        
        if not governorate or not need_type:
            return jsonify({
                'error': 'Missing required parameters',
                'details': 'Both region and resourceType are required',
                'received_data': data
            }), 400
            
        # Filter data for the specific governorate and need type
        filtered_data = CRISIS_DF[
            (CRISIS_DF['Governorate'].str.lower() == governorate.lower()) & 
            (CRISIS_DF['Need Type'].str.lower() == need_type.lower())
        ]
        
        print(f"Filtered data rows: {len(filtered_data)}")  # Debug print
        print(f"Filtered data:\n{filtered_data}")  # Debug print
        
        if len(filtered_data) < 2:
            return jsonify({
                'error': f'Insufficient data points for {governorate} - {need_type}',
                'details': f'Found {len(filtered_data)} data points, need at least 2',
                'available_governorates': CRISIS_DF['Governorate'].unique().tolist(),
                'available_need_types': CRISIS_DF['Need Type'].unique().tolist()
            }), 400
            
        # Calculate basic statistics
        total_quantity = filtered_data['Quantity'].sum()
        avg_quantity = filtered_data['Quantity'].mean()
        max_quantity = filtered_data['Quantity'].max()
        
        print(f"Calculated statistics - total: {total_quantity}, avg: {avg_quantity}, max: {max_quantity}")  # Debug print
        
        # Generate forecast for next 14 days
        last_date = filtered_data['Date'].max()
        forecast_dates = [last_date + timedelta(days=i) for i in range(1, 15)]
        
        # Generate forecast data
        forecast = []
        for date in forecast_dates:
            predicted = round(avg_quantity * (1 + np.random.normal(0, 0.1)), 2)
            forecast.append({
                'ds': date.strftime('%Y-%m-%d'),
                'yhat': float(predicted),  # Convert numpy float to Python float
                'yhat_upper': float(round(predicted * 1.2, 2)),
                'yhat_lower': float(round(predicted * 0.8, 2))
            })
        
        print(f"Generated forecast: {forecast}")  # Debug print
        
        # Calculate risk score (0-100)
        risk_score = min(100, max(0, int(
            (max_quantity / total_quantity) * 100 * 
            (1 + filtered_data['Urgency'].mean() / 10)
        )))
        
        print(f"Calculated risk score: {risk_score}")  # Debug print
        
        # Determine crisis status
        if risk_score >= 70:
            status = "HIGH"
        elif risk_score >= 40:
            status = "MEDIUM"
        else:
            status = "LOW"
            
        # Generate resource distribution plan
        resource_allocation = [
            {
                'location': governorate,
                'resources': int(round(total_quantity * 0.4)),  # Convert to int
                'priority': 'HIGH'
            },
            {
                'location': 'Neighboring Areas',
                'resources': int(round(total_quantity * 0.35)),  # Convert to int
                'priority': 'MEDIUM'
            },
            {
                'location': 'Regional Centers',
                'resources': int(round(total_quantity * 0.25)),  # Convert to int
                'priority': 'LOW'
            }
        ]
        
        response = {
            'crisis_status': status,
            'risk_score': int(risk_score),  # Ensure it's an integer
            'forecast': forecast,
            'resource_allocation': resource_allocation
        }
        
        print(f"Sending response: {response}")  # Debug print
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in predict_resource_allocation: {str(e)}")  # Debug print
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 