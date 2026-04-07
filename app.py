from flask import Flask, request, jsonify
from flask_cors import CORS
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app)

sia = SentimentIntensityAnalyzer()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text.strip():
            return jsonify({"label": "neutral", "score": 0.0})

        score = sia.polarity_scores(text)
        compound = score['compound']

        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"

        return jsonify({
            "label": label,
            "score": compound
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({
            "label": "neutral",
            "score": 0.0,
            "error": str(e)
        })

if __name__ == "__main__":
    app.run(debug=True, port=5000)