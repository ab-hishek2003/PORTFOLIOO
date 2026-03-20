import os
import requests
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy 
from dotenv import load_dotenv

# 1. SETUP & CONFIGURATION
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

app = Flask(__name__)

# Replace with your actual key - Activation takes ~2 hours
API_KEY = "e295c095c0b91c984b2c771c18b518fa" 

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'portfolio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
app.app_context().push()

# 2. DATABASE MODEL
class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

# 3. PROJECT DATA
my_projects = [
    {
        "name": "Github projects",
        "tech": "Python & Flask",
        "link": "https://github.com"
    },
    {
        "name": "Live Weather App",
        "tech": "JavaScript & API",
        "link": "/static/weather-app/index.html" 
    }
]

# 4. PORTFOLIO ROUTES
@app.route('/')
def home():
    # This renders your main portfolio page
    return render_template('index.html', projects=my_projects, my_name="Abhishek")

@app.route('/view_messages')
def view_messages():
    try:
        messages = ContactMessage.query.all()
        if not messages:
            return "No messages found in the database yet."
        
        output = "<h1>Messages in Database:</h1>"
        for m in messages:
            output += f"<p><strong>{m.name}:</strong> {m.message} <em>({m.timestamp})</em></p>"
        return output
    except Exception as e:
        return f"Error reading database: {str(e)}"


@app.route('/submit_contact', methods=['POST'])
def contact():
    data = request.json
    try:
        new_message = ContactMessage(name=data['name'], message=data['message'])
        db.session.add(new_message)
        db.session.commit()
        return jsonify({"status": "success", "msg": f"Hi {data['name']}, your message was saved!"})
    except Exception as e:
        return jsonify({"status": "error", "msg": "Database error"}), 500

# 5. WEATHER API ROUTE (CORRECTED URLS)
# In your app.py file, replace your existing get_weather function with this:
# In your app.py file, replace the existing get_weather function with this:

@app.route('/api/weather')
def get_weather():
    city = request.args.get('city')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    # Ensure this matches your API_KEY variable at the top of app.py
    key_to_use = API_KEY 

    if city:
        # FIXED: Added https:// and /data/2.5/weather?q=
        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    elif lat and lon:
        # FIXED: Added https:// and /data/2.5/weather?lat=
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"


    else:
        # Return a 400 error if no location is provided
        return jsonify({"error": "No location provided"}), 400
        
    try:
        # This requires the 'requests' library (pip install requests)
        response = requests.get(url)
        data = response.json()
        
        # If the API key is inactive, it will return a 401 status code
        if response.status_code != 200:
            return jsonify({"error": data.get("message", "API Error")}), response.status_code
            
        return jsonify(data) 
    except Exception as e:
        # This prints the exact crash reason in your terminal for debugging
        print(f"Weather API Crash: {e}")
        return jsonify({"error": "Server connection failed"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # This line will print the EXACT path of your database in the terminal
        print("--- DATABASE INFO ---")
        print("DB Location:", app.config['SQLALCHEMY_DATABASE_URI'])
        print("---------------------")
        
    app.run(debug=True, port=5000)
