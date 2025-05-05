from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import pandas as pd
from prophet import Prophet
import numpy as np
from datetime import datetime, timedelta
import json
import traceback
import re
import csv

app = Flask(__name__)
CORS(app, supports_credentials=True, allow_headers="*")

# Resource type definitions with their characteristics
RESOURCE_TYPES = {
    'food': {
        'base': 1000,
        'trend': 0.02,
        'seasonality': 0.15,
        'noise': 0.05,
        'unit': 'kg',
        'storage_requirements': 'dry, cool place',
        'transport_requirements': 'refrigerated truck',
        'priority': 1,
        'daily_consumption_per_person': 2.5,  # kg per person per day
        'shelf_life': 30,  # days
        'minimum_safety_stock': 500  # kg
    },
    'shelter': {
        'base': 500,
        'trend': 0.01,
        'seasonality': 0.1,
        'noise': 0.03,
        'unit': 'units',
        'storage_requirements': 'covered area',
        'transport_requirements': 'flatbed truck',
        'priority': 2,
        'capacity_per_unit': 4,  # people per shelter unit
        'setup_time': 2,  # hours
        'minimum_safety_stock': 50  # units
    },
    'medical': {
        'base': 200,
        'trend': 0.015,
        'seasonality': 0.12,
        'noise': 0.04,
        'unit': 'kits',
        'storage_requirements': 'temperature controlled',
        'transport_requirements': 'refrigerated van',
        'priority': 0,
        'treatments_per_kit': 10,  # treatments per kit
        'expiry_period': 180,  # days
        'minimum_safety_stock': 20  # kits
    }
}

# Read the original file with the correct encoding
with open('data1.csv', 'r', encoding='cp1252') as infile, open('data1_clean.csv', 'w', newline='', encoding='utf-8-sig') as outfile:
    for line in infile:
        # Remove leading/trailing quotes and semicolons
        line = line.strip()
        if line.startswith('"') and line.endswith('";'):
            line = line[1:-2]
        elif line.startswith('"') and line.endswith('"'):
            line = line[1:-1]
        elif line.endswith(';'):
            line = line[:-1]
        # Remove embedded commas in numbers (e.g., 1,000,000 -> 1000000)
        line = re.sub(r'(\d+),(\d{3})(?=[^\d]|$)', r'\1\2', line)
        # Write as a row
        row = [field.strip() for field in line.split(',')]
        outfile.write(','.join(row) + '\n')

# Now read the cleaned file
CRISIS_DF = pd.read_csv('data1_clean.csv', parse_dates=['Date'], encoding='utf-8-sig')
print(CRISIS_DF.head())
print(CRISIS_DF.columns)

# Clean up Quantity column
CRISIS_DF['Quantity'] = (
    CRISIS_DF['Quantity']
    .astype(str)
    .str.replace(r'[^\d.]', '', regex=True)
    .replace('', '0')
    .astype(float)
)

# Drop rows with missing Governorate, Need Type, or Date
CRISIS_DF = CRISIS_DF.dropna(subset=['Governorate', 'Need Type', 'Date'])

# Mock historical data generator
def generate_historical_data(resource_type, region, days=30):
    dates = pd.date_range(end=datetime.now(), periods=days)
    params = RESOURCE_TYPES.get(resource_type, {
        'base': 100,
        'trend': 0.01,
        'seasonality': 0.1,
        'noise': 0.05
    })
    
    values = []
    for i in range(days):
        value = params['base'] * (1 + params['trend'] * i)
        value *= (1 + params['seasonality'] * np.sin(2 * np.pi * i / 7))
        value *= (1 + params['noise'] * np.random.randn())
        values.append(max(0, value))
    
    return pd.DataFrame({
        'ds': dates,
        'y': values
    })

def analyze_urgency(crisis_data, predictions):
    urgency_factors = {
        'predicted_growth': 0.0,
        'resource_criticality': 0.0,
        'time_sensitivity': 0.0,
        'supply_risk': 0.0
    }
    
    # Analyze predicted growth
    if len(predictions) > 1:
        growth_rate = (predictions[-1]['yhat'] - predictions[0]['yhat']) / predictions[0]['yhat']
        urgency_factors['predicted_growth'] = min(1.0, max(0.0, growth_rate))
    
    # Resource criticality
    resource_type = crisis_data.get('resourceType', 'food')
    urgency_factors['resource_criticality'] = 1 - (RESOURCE_TYPES[resource_type]['priority'] / 2)
    
    # Time sensitivity
    if len(predictions) > 1:
        time_sensitivity = sum(1 for i in range(1, len(predictions)) 
                             if predictions[i]['yhat'] > predictions[i-1]['yhat'])
        urgency_factors['time_sensitivity'] = time_sensitivity / len(predictions)
    
    # Supply risk (based on predicted demand vs safety stock)
    safety_stock = RESOURCE_TYPES[resource_type]['minimum_safety_stock']
    max_predicted_need = max(pred['yhat'] for pred in predictions)
    urgency_factors['supply_risk'] = min(1.0, max(0.0, (max_predicted_need - safety_stock) / safety_stock))
    
    # Calculate overall urgency score
    urgency_score = sum(urgency_factors.values()) / len(urgency_factors)
    
    # Determine urgency level
    if urgency_score >= 0.8:
        urgency_level = "CRITICAL"
    elif urgency_score >= 0.6:
        urgency_level = "HIGH"
    elif urgency_score >= 0.4:
        urgency_level = "MEDIUM"
    else:
        urgency_level = "LOW"
    
    return {
        'urgency_level': urgency_level,
        'urgency_score': round(urgency_score * 100),
        'factors': urgency_factors,
        'recommendations': generate_urgency_recommendations(urgency_level, resource_type)
    }

def generate_urgency_recommendations(urgency_level, resource_type):
    recommendations = {
        'CRITICAL': [
            'Immediate resource mobilization required',
            'Activate emergency response protocols',
            'Coordinate with all available supply points',
            'Prioritize air transport if available',
            'Set up emergency command center'
        ],
        'HIGH': [
            'Rapid resource deployment needed',
            'Alert all regional supply points',
            'Prepare for potential escalation',
            'Coordinate with local authorities',
            'Monitor situation hourly'
        ],
        'MEDIUM': [
            'Standard resource allocation',
            'Regular monitoring required',
            'Maintain safety stock levels',
            'Coordinate with regional centers',
            'Daily situation assessment'
        ],
        'LOW': [
            'Normal resource distribution',
            'Weekly monitoring sufficient',
            'Maintain regular supply chain',
            'Standard coordination procedures',
            'Regular situation updates'
        ]
    }
    
    return recommendations[urgency_level]

def generate_resource_allocation_plan(crisis_data, predictions, urgency_analysis):
    resource_type = crisis_data.get('resourceType', 'food')
    region = crisis_data.get('region', 'default')
    
    # Calculate total needed resources
    total_needed = sum(pred['yhat'] for pred in predictions)
    
    # Calculate daily requirements
    daily_requirements = []
    for pred in predictions:
        daily_requirements.append({
            'date': pred['ds'],
            'required': round(pred['yhat']),
            'minimum': round(pred['yhat_lower']),
            'maximum': round(pred['yhat_upper'])
        })
    
    # Generate allocation phases based on urgency
    phases = []
    if urgency_analysis['urgency_level'] in ['CRITICAL', 'HIGH']:
        phases = [
            {
                'phase': 'Immediate',
                'timeline': '0-24 hours',
                'allocation': round(total_needed * 0.4),
                'priority': 'Highest',
                'transport_mode': RESOURCE_TYPES[resource_type]['transport_requirements'],
                'actions': [
                    'Mobilize emergency response team',
                    'Activate all available transport',
                    'Coordinate with local authorities',
                    'Set up distribution centers'
                ]
            },
            {
                'phase': 'Short-term',
                'timeline': '24-72 hours',
                'allocation': round(total_needed * 0.3),
                'priority': 'High',
                'transport_mode': RESOURCE_TYPES[resource_type]['transport_requirements'],
                'actions': [
                    'Establish supply chain routes',
                    'Coordinate with regional centers',
                    'Monitor distribution',
                    'Update resource needs'
                ]
            },
            {
                'phase': 'Medium-term',
                'timeline': '3-7 days',
                'allocation': round(total_needed * 0.3),
                'priority': 'Medium',
                'transport_mode': RESOURCE_TYPES[resource_type]['transport_requirements'],
                'actions': [
                    'Maintain supply chain',
                    'Regular needs assessment',
                    'Coordinate with NGOs',
                    'Plan for sustained support'
                ]
            }
        ]
    else:
        phases = [
            {
                'phase': 'Initial',
                'timeline': '0-48 hours',
                'allocation': round(total_needed * 0.3),
                'priority': 'High',
                'transport_mode': RESOURCE_TYPES[resource_type]['transport_requirements'],
                'actions': [
                    'Assess immediate needs',
                    'Coordinate with local partners',
                    'Begin resource distribution',
                    'Monitor situation'
                ]
            },
            {
                'phase': 'Follow-up',
                'timeline': '2-5 days',
                'allocation': round(total_needed * 0.4),
                'priority': 'Medium',
                'transport_mode': RESOURCE_TYPES[resource_type]['transport_requirements'],
                'actions': [
                    'Regular needs assessment',
                    'Coordinate with regional centers',
                    'Monitor distribution',
                    'Update resource plans'
                ]
            },
            {
                'phase': 'Sustained',
                'timeline': '5-14 days',
                'allocation': round(total_needed * 0.3),
                'priority': 'Normal',
                'transport_mode': RESOURCE_TYPES[resource_type]['transport_requirements'],
                'actions': [
                    'Maintain regular supply chain',
                    'Weekly needs assessment',
                    'Coordinate with partners',
                    'Plan for long-term support'
                ]
            }
        ]
    
    return {
        'total_needed': round(total_needed),
        'unit': RESOURCE_TYPES[resource_type]['unit'],
        'storage_requirements': RESOURCE_TYPES[resource_type]['storage_requirements'],
        'daily_requirements': daily_requirements,
        'allocation_phases': phases,
        'resource_specifics': {
            'daily_consumption': RESOURCE_TYPES[resource_type].get('daily_consumption_per_person', 0),
            'capacity_per_unit': RESOURCE_TYPES[resource_type].get('capacity_per_unit', 0),
            'treatments_per_kit': RESOURCE_TYPES[resource_type].get('treatments_per_kit', 0),
            'shelf_life': RESOURCE_TYPES[resource_type].get('shelf_life', 0),
            'expiry_period': RESOURCE_TYPES[resource_type].get('expiry_period', 0),
            'minimum_safety_stock': RESOURCE_TYPES[resource_type]['minimum_safety_stock']
        }
    }

def generate_route_optimization(crisis_data, allocation_plan):
    resource_type = crisis_data.get('resourceType', 'food')
    region = crisis_data.get('region', 'default')
    
    # Generate mock supply points
    supply_points = [
        {
            'id': 1,
            'name': 'Central Warehouse',
            'distance': 50,
            'capacity': 1000,
            'contact': 'John Doe',
            'phone': '+1234567890',
            'email': 'john@warehouse.com',
            'operating_hours': '24/7',
            'special_requirements': 'Requires 24h notice'
        },
        {
            'id': 2,
            'name': 'Regional Distribution Center',
            'distance': 30,
            'capacity': 500,
            'contact': 'Jane Smith',
            'phone': '+1234567891',
            'email': 'jane@distribution.com',
            'operating_hours': '8:00-20:00',
            'special_requirements': 'Requires 12h notice'
        },
        {
            'id': 3,
            'name': 'Local Storage',
            'distance': 10,
            'capacity': 200,
            'contact': 'Mike Johnson',
            'phone': '+1234567892',
            'email': 'mike@local.com',
            'operating_hours': '9:00-17:00',
            'special_requirements': 'Requires 4h notice'
        }
    ]
    
    # Generate optimized routes for each phase
    routes = []
    for phase in allocation_plan['allocation_phases']:
        route = {
            'phase': phase['phase'],
            'timeline': phase['timeline'],
            'supply_points': [],
            'estimated_time': f"{phase['timeline'].split('-')[0]} hours",
            'transport_mode': phase['transport_mode'],
            'coordination_requirements': [
                'Notify local authorities',
                'Coordinate with transport providers',
                'Arrange for security if needed',
                'Prepare distribution teams'
            ]
        }
        
        # Allocate resources from nearest supply points first
        remaining_allocation = phase['allocation']
        for point in sorted(supply_points, key=lambda x: x['distance']):
            if remaining_allocation <= 0:
                break
                
            allocation = min(point['capacity'], remaining_allocation)
            route['supply_points'].append({
                'point': point['name'],
                'allocation': allocation,
                'distance': point['distance'],
                'contact': point['contact'],
                'phone': point['phone'],
                'email': point['email'],
                'operating_hours': point['operating_hours'],
                'special_requirements': point['special_requirements']
            })
            remaining_allocation -= allocation
        
        routes.append(route)
    
    return {
        'crisis_location': region,
        'resource_type': resource_type,
        'routes': routes,
        'logistics_considerations': [
            'Weather conditions',
            'Road conditions',
            'Security situation',
            'Local customs and regulations',
            'Storage facilities availability',
            'Distribution center capacity'
        ]
    }

@app.route('/api/flask/predict/resource-allocation', methods=['POST', 'OPTIONS'])
def predict_resource_allocation():
    if request.method == 'OPTIONS':
        response = make_response('', 200)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    try:
        print("Received POST data:", request.get_json())
        data = request.get_json()
        need_type = data.get('needType') or data.get('resourceType') or 'Tents'
        region = data.get('region', 'default')
        periods = int(data.get('periods', 14))
        include_upper_lower = data.get('includeUpperLower', True)
        confidence_interval = float(data.get('confidenceInterval', 0.95))

        print("Governorate values:", CRISIS_DF['Governorate'].unique())
        print("Need Type values:", CRISIS_DF['Need Type'].unique())
        print("region from request:", region)
        print("need_type from request:", need_type)

        df = CRISIS_DF[
            (CRISIS_DF['Governorate'].str.strip().str.lower() == region.strip().lower()) &
            (CRISIS_DF['Need Type'].str.strip().str.lower() == need_type.strip().lower())
        ].copy()

        if df.empty:
            return jsonify({'error': 'No historical data for this region/need type'}), 404

        print("Filtered DataFrame:", df.head())
        print("DataFrame dtypes:", df.dtypes)

        df = df.groupby(pd.Grouper(key='Date', freq='W')).agg({'Quantity': 'sum'}).reset_index()
        df = df.rename(columns={'Date': 'ds', 'Quantity': 'y'})
        all_weeks = pd.date_range(df['ds'].min(), df['ds'].max(), freq='W')
        df = df.set_index('ds').reindex(all_weeks).fillna(0).rename_axis('ds').reset_index()

        # Only keep rows with non-NaN y
        df = df[df['y'].notna()]

        if len(df) < 2:
            return jsonify({'error': 'Not enough historical data for this region/need type. At least 2 data points are required.'}), 400

        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            interval_width=confidence_interval,
            changepoint_prior_scale=0.3
        )
        model.fit(df)

        future = model.make_future_dataframe(periods=periods, freq='W')
        forecast = model.predict(future)

        predictions = []
        future_dates = forecast['ds'].tail(periods)
        for i in range(periods):
            yhat = max(0, forecast['yhat'].iloc[-periods+i])
            yhat_lower = max(0, forecast['yhat_lower'].iloc[-periods+i])
            yhat_upper = max(yhat, forecast['yhat_upper'].iloc[-periods+i])
            predictions.append({
                'ds': future_dates.iloc[i].strftime('%Y-%m-%d'),
                'yhat': round(yhat),
                'yhat_lower': round(yhat_lower),
                'yhat_upper': round(yhat_upper)
            })

        # Analyze urgency
        urgency_analysis = analyze_urgency(data, predictions)
        
        # Generate resource allocation plan
        allocation_plan = generate_resource_allocation_plan(data, predictions, urgency_analysis)
        
        # Generate route optimization
        route_optimization = generate_route_optimization(data, allocation_plan)

        # Combine all results
        unit = need_type  # e.g., "Tents", "Blankets", etc.
        response = {
            'forecast': predictions,
            'urgency_analysis': urgency_analysis,
            'resource_allocation': allocation_plan,
            'route_optimization': route_optimization,
            'unit': unit
        }

        return jsonify(response)

    except Exception as e:
        print("Exception occurred:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 