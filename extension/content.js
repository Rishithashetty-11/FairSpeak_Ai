console.log("FairSpeakAI loaded");

// Track processed tweets
const processedTweets = new WeakSet();

// Dashboard variables
let total = 0;
let positive = 0;
let neutral = 0;
let negative = 0;

// 🚀 Create dashboard UI (IMPROVED)
const dashboard = document.createElement("div");
dashboard.style.position = "fixed";
dashboard.style.top = "10px";
dashboard.style.right = "10px";
dashboard.style.background = "#111";
dashboard.style.color = "white";
dashboard.style.padding = "14px";
dashboard.style.borderRadius = "12px";
dashboard.style.zIndex = "9999";
dashboard.style.fontSize = "14px";
dashboard.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
dashboard.innerHTML = "🔥 FairSpeakAI Loading...";
document.body.appendChild(dashboard);

// 🔄 Update dashboard
function updateDashboard() {
    const p = total ? ((positive / total) * 100).toFixed(1) : 0;
    const n = total ? ((negative / total) * 100).toFixed(1) : 0;
    const neu = total ? ((neutral / total) * 100).toFixed(1) : 0;

    dashboard.innerHTML = `
    <b>🔥 FairSpeak AI</b><br>
    Total: ${total} <br>
    🔴 Toxic: ${n}% <br>
    🟡 Neutral: ${neu}% <br>
    🟢 Positive: ${p}%
    `;
}

// 🧠 API CALL (WITH DELAY CONTROL)
let queue = [];
let isProcessing = false;

function processQueue() {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;
    const { element, text } = queue.shift();

    analyzeTweet(element, text).finally(() => {
        isProcessing = false;
        setTimeout(processQueue, 300); // 🔥 control API speed
    });
}

// 🔍 Analyze tweet
async function analyzeTweet(element, text) {
    try {
        const res = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await res.json();

        if (data.label === "skip") return;

        applyColorAndScore(element, data.label, data.score);

        total++;
        if (data.label === "positive") positive++;
        else if (data.label === "neutral") neutral++;
        else negative++;

        updateDashboard();

    } catch (error) {
        console.log("Error:", error);
    }
}

// 🎨 Apply color + score
function applyColorAndScore(element, label, score) {

    const existing = element.querySelector(".fairspeak-score");
    if (existing) existing.remove();

    const scoreTag = document.createElement("span");
    scoreTag.className = "fairspeak-score";
    scoreTag.innerText = ` (${score.toFixed(2)})`;
    scoreTag.style.fontSize = "12px";
    scoreTag.style.marginLeft = "6px";
    scoreTag.style.fontWeight = "bold";

    element.appendChild(scoreTag);

    if (score <= -0.5) {
        element.style.backgroundColor = "#ff4d4d";
    } else if (score < 0) {
        element.style.backgroundColor = "#ffcc00";
    } else if (score < 0.5) {
        element.style.backgroundColor = "#ffffcc";
    } else {
        element.style.backgroundColor = "#66ff66";
    }
}

// 🔍 Process tweets
function processTweets() {
    const tweets = document.querySelectorAll('[data-testid="tweetText"]');

    tweets.forEach(tweet => {

        const tweetElement = tweet.closest("article");
        if (!tweetElement) return;

        if (processedTweets.has(tweetElement)) return;
        processedTweets.add(tweetElement);

        const text = tweet.innerText;

        // 🔥 Add to queue instead of direct call
        queue.push({ element: tweet, text });
    });

    processQueue();
}

// 🚀 Initial run
processTweets();

// ⏱️ Interval reduced (less lag)
setInterval(processTweets, 3000);

// 👀 Smart MutationObserver (optimized)
const observer = new MutationObserver((mutations) => {
    let added = false;

    mutations.forEach(m => {
        if (m.addedNodes.length > 0) {
            added = true;
        }
    });

    if (added) processTweets();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});