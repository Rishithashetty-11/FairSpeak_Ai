# 🔥 MUST BE FIRST
import matplotlib
matplotlib.use('Agg')

from langdetect import detect
import matplotlib.pyplot as plt
import json
import threading
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app)

sia = SentimentIntensityAnalyzer()

plot_lock = threading.Lock()
file_lock = threading.Lock()

FILE_PATH = "data.json"
GRAPH_PATH = "static/graph.png"

last_data_count = 0  # 🔥 track changes


def is_india_tweet(text):
    try:
        return detect(text) in ['en', 'hi', 'te', 'ta', 'kn', 'ml']
    except:
        return False


def read_data():
    if not os.path.exists(FILE_PATH):
        return []
    try:
        with open(FILE_PATH, "r") as f:
            return json.load(f)
    except:
        return []


def generate_graph():
    with plot_lock:
        data = read_data()

        positive = sum(1 for i in data if i["sentiment"] == "positive")
        negative = sum(1 for i in data if i["sentiment"] == "negative")
        neutral = sum(1 for i in data if i["sentiment"] == "neutral")

        labels = ['Positive', 'Negative', 'Neutral']
        values = [positive, negative, neutral]

        plt.figure(figsize=(6,4))
        plt.bar(labels, values)
        plt.title("India Sentiment Analysis")

        plt.savefig(GRAPH_PATH)
        plt.close('all')


def save_to_file(text, label, score):
    global last_data_count

    with file_lock:
        data = read_data()

        for item in data:
            if item["text"] == text:
                return

        new_entry = {
            "text": text,
            "sentiment": label,
            "score": score,
            "timestamp": datetime.now().isoformat()
        }

        data.append(new_entry)

        with open(FILE_PATH, "w") as f:
            json.dump(data, f, indent=4)

        # 🔥 ONLY NOW generate graph
        generate_graph()

        last_data_count = len(data)


# 🔹 GRAPH API (NO REGENERATION)
@app.route('/graph', methods=['GET'])
def graph():
    return jsonify({
        "image_url": f"http://127.0.0.1:5000/static/graph.png"
    })


@app.route('/data', methods=['GET'])
def get_data():
    return jsonify(read_data())


@app.route('/predict', methods=['POST'])
def predict():
    try:
        text = request.get_json().get('text', '')

        if not text.strip():
            return jsonify({"label": "neutral", "score": 0.0})

        if not is_india_tweet(text):
            return jsonify({"label": "skip", "score": 0.0})

        score = sia.polarity_scores(text)['compound']

        if score >= 0.05:
            label = "positive"
        elif score <= -0.05:
            label = "negative"
        else:
            label = "neutral"

        save_to_file(text, label, score)

        return jsonify({"label": label, "score": score})

    except Exception as e:
        return jsonify({"label": "neutral", "score": 0.0})


if __name__ == "__main__":
    generate_graph()  # 🔥 initial graph
    app.run(debug=True, port=5000)