console.log("FairSpeakAI loaded");

const processedTweets = new Set();

async function analyzeTweet(element, text) {
    try {
        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        console.log("API Result:", data);

        applyColor(element, data.label);

    } catch (error) {
        console.log("Error:", error);
    }
}

function applyColor(element, label) {
    if (label === "positive") {
        element.style.backgroundColor = "lightgreen";
    } else if (label === "negative") {
        element.style.backgroundColor = "#ffcccc";
    } else {
        element.style.backgroundColor = "#ffffcc";
    }
}

function processTweets() {
    const tweets = document.querySelectorAll('article [data-testid="tweetText"]');

    console.log("Tweets found:", tweets.length);

    tweets.forEach(tweet => {
        const text = tweet.innerText;

        // ✅ Skip already processed tweets
        if (processedTweets.has(text)) return;

        processedTweets.add(text);

        console.log("Processing Tweet:", text);

        analyzeTweet(tweet, text);
    });
}

// Run every 5 seconds
setInterval(processTweets, 5000);