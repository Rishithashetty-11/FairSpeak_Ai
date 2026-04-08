console.log("FairSpeakAI loaded");

// 🔥 INDIA FILTER (NEW)
const indiaKeywords = [
    "india", "indian", "modi", "delhi", "mumbai",
    "bangalore", "hyderabad", "chennai", "kolkata"
];

const indiaHashtags = [
    "#india", "#modi", "#indiapolitics",
    "#indiafirst", "#bharat", "#indianarmy", "#indiavspak"
];

function isIndiaRelated(text) {
    text = text.toLowerCase();

    const keywordMatch = indiaKeywords.some(k => text.includes(k));
    const hashtagMatch = indiaHashtags.some(h => text.includes(h));

    return keywordMatch || hashtagMatch;
}


// Track processed tweets
const processedTweets = new WeakSet();

// Dashboard variables
let total = 0;
let positive = 0;
let neutral = 0;
let negative = 0;

// 🚀 Dashboard UI
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
dashboard.innerHTML = "🌍 FairSpeak AI (India Mode)...";
document.body.appendChild(dashboard);

// 🔄 Update dashboard
function updateDashboard() {
    const p = total ? ((positive / total) * 100).toFixed(1) : 0;
    const n = total ? ((negative / total) * 100).toFixed(1) : 0;
    const neu = total ? ((neutral / total) * 100).toFixed(1) : 0;

    dashboard.innerHTML = `
    <b>🌍 India Sentiment</b><br>
    Total: ${total} <br>
    🔴 Negative: ${n}% <br>
    🟡 Neutral: ${neu}% <br>
    🟢 Positive: ${p}%
    `;
}

// 🧠 Queue system
let queue = [];
let isProcessing = false;

function processQueue() {
    if (isProcessing || queue.length === 0) return;

    isProcessing = true;
    const { element, text } = queue.shift();

    analyzeTweet(element, text).finally(() => {
        isProcessing = false;
        setTimeout(processQueue, 300);
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

        const text = tweet.innerText;

        // 🔥 INDIA FILTER (MAIN LOGIC)
        if (!isIndiaRelated(text)) return;

        processedTweets.add(tweetElement);

        // Add to queue
        queue.push({ element: tweet, text });
    });

    processQueue();
}

// 🚀 Initial run
processTweets();

// ⏱️ Interval
setInterval(processTweets, 3000);

// 👀 MutationObserver
const observer = new MutationObserver((mutations) => {
    let added = false;

    mutations.forEach(m => {
        if (m.addedNodes.length > 0) added = true;
    });

    if (added) processTweets();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});