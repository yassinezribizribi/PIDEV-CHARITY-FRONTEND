# Flask Server for Crisis Management

This Flask server provides an API for predicting resource allocation and crisis management based on historical data.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Place your data file:
- Copy your `data1.csv` file to the FlaskServer directory
- Ensure the CSV file has the following columns:
  - Date
  - Governorate
  - Need Type
  - Quantity
  - Urgency
  - (and other relevant columns)

## Running the Server

1. Start the Flask server:
```bash
python app.py
```

2. The server will run on `http://localhost:5000`

## API Endpoints

### Predict Resource Allocation
- **URL**: `/api/flask/predict/resource-allocation`
- **Method**: POST
- **Request Body**:
```json
{
    "governorate": "Governorate Name",
    "needType": "Need Type"
}
```
- **Response**: JSON object containing:
  - crisis_status
  - risk_score
  - total_resources_needed
  - resource_distribution_plan
  - forecast

## Error Handling

The API will return appropriate error messages for:
- Missing parameters
- Insufficient data points
- Server errors

## CORS Configuration

The server is configured to accept requests from any origin for development purposes. For production, you should restrict the allowed origins. 