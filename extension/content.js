console.log("FairSpeakAI loaded");

// Use WeakSet to store processed elements (better than text)
const processedTweets = new WeakSet();

// Dashboard variables
let total = 0;
let positive = 0;
let neutral = 0;
let negative = 0;

// Create dashboard UI
const dashboard = document.createElement("div");
dashboard.style.position = "fixed";
dashboard.style.top = "10px";
dashboard.style.right = "10px";
dashboard.style.background = "black";
dashboard.style.color = "white";
dashboard.style.padding = "12px";
dashboard.style.borderRadius = "10px";
dashboard.style.zIndex = "9999";
dashboard.style.fontSize = "14px";
dashboard.innerHTML = "FairSpeakAI Loading...";
document.body.appendChild(dashboard);

// Update dashboard
function updateDashboard() {
    dashboard.innerHTML = `
    <b>FairSpeak AI</b><br>
    Total: ${total} <br>
    🔴 Toxic: ${((negative / total) * 100 || 0).toFixed(1)}% <br>
    🟡 Neutral: ${((neutral / total) * 100 || 0).toFixed(1)}% <br>
    🟢 Positive: ${((positive / total) * 100 || 0).toFixed(1)}%
    `;
}

async function analyzeTweet(element, text) {
    try {
        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        console.log("API Result:", data);

        applyColorAndScore(element, data.label, data.score);

        // Update counts
        total++;
        if (data.label === "positive") positive++;
        else if (data.label === "neutral") neutral++;
        else negative++;

        updateDashboard();

    } catch (error) {
        console.log("Error:", error);
    }
}

function applyColorAndScore(element, label, score) {

    // Remove old score if exists
    const existing = element.querySelector(".fairspeak-score");
    if (existing) existing.remove();

    // Create score tag
    const scoreTag = document.createElement("span");
    scoreTag.className = "fairspeak-score";
    scoreTag.innerText = ` (${score.toFixed(2)})`;
    scoreTag.style.fontSize = "12px";
    scoreTag.style.marginLeft = "6px";
    scoreTag.style.fontWeight = "bold";

    element.appendChild(scoreTag);

    // Smart coloring
    if (score <= -0.5) {
        element.style.backgroundColor = "#ff4d4d"; // strong toxic
    } else if (score < 0) {
        element.style.backgroundColor = "#ffcc00"; // mild toxic
    } else if (score < 0.5) {
        element.style.backgroundColor = "#ffffcc"; // neutral
    } else {
        element.style.backgroundColor = "#66ff66"; // positive
    }
}

function processTweets() {
    const tweets = document.querySelectorAll('[data-testid="tweetText"]');

    console.log("Tweets found:", tweets.length);

    tweets.forEach(tweet => {

        const tweetElement = tweet.closest("article");
        if (!tweetElement) return;

        // Skip if already processed
        if (processedTweets.has(tweetElement)) return;
        processedTweets.add(tweetElement);

        const text = tweet.innerText;

        console.log("Processing Tweet:", text);

        analyzeTweet(tweet, text);
    });
}

// Run initially
processTweets();

// Run every 2 seconds (faster)
setInterval(processTweets, 2000);

// 🔥 MutationObserver (REAL-TIME PROCESSING)
const observer = new MutationObserver(() => {
    processTweets();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});