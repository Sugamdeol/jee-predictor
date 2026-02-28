// JEE Mains 2026 Rank Predictor - Full Implementation
// Author: nanobot

let rankData = null;
let nitData = null;
let iiitData = null;
let cutoffData = null;
let percentileChart = null;

// Marks to Percentile Mapping (approximate based on 2024/2025 trends)
const marksToPercentile = [
    { marks: 280, percentile: 99.99 },
    { marks: 260, percentile: 99.95 },
    { marks: 240, percentile: 99.90 },
    { marks: 220, percentile: 99.80 },
    { marks: 200, percentile: 99.60 },
    { marks: 180, percentile: 99.20 },
    { marks: 160, percentile: 98.50 },
    { marks: 140, percentile: 97.50 },
    { marks: 120, percentile: 96.00 },
    { marks: 100, percentile: 93.00 },
    { marks: 80, percentile: 88.00 },
    { marks: 60, percentile: 80.00 },
    { marks: 40, percentile: 65.00 },
    { marks: 20, percentile: 40.00 },
    { marks: 0, percentile: 0.00 }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setupEventListeners();
});

async function loadAllData() {
    try {
        const [rankRes, nitRes, iiitRes, cutoffRes] = await Promise.all([
            fetch('data/percentile-rank.json').then(r => r.json()),
            fetch('data/nit-cutoffs.json').then(r => r.json()),
            fetch('data/iiit-cutoffs.json').then(r => r.json()),
            fetch('data/cutoffs.json').then(r => r.json())
        ]);
        
        rankData = rankRes;
        nitData = nitRes;
        iiitData = iiitRes;
        cutoffData = cutoffRes;
        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function setupEventListeners() {
    // Handle total marks input syncing
    const totalInput = document.getElementById('totalMarks');
    const subjectInputs = ['physics', 'chemistry', 'math'];
    
    subjectInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const total = subjectInputs.reduce((sum, sId) => sum + (parseFloat(document.getElementById(sId).value) || 0), 0);
            totalInput.value = total;
        });
    });

    totalInput.addEventListener('input', () => {
        const val = parseFloat(totalInput.value) || 0;
        subjectInputs.forEach(id => { document.getElementById(id).value = ''; });
    });
}

function getPercentileFromMarks(marks) {
    if (marks >= 280) return 99.99;
    for (let i = 0; i < marksToPercentile.length - 1; i++) {
        const high = marksToPercentile[i];
        const low = marksToPercentile[i + 1];
        if (marks >= low.marks) {
            // Linear interpolation
            const ratio = (marks - low.marks) / (high.marks - low.marks);
            return low.percentile + ratio * (high.percentile - low.percentile);
        }
    }
    return 0;
}

function getRankFromPercentile(percentile) {
    const data = rankData.percentile_data;
    for (let i = 0; i < data.length; i++) {
        if (percentile >= data[i].percentile) {
            return data[i];
        }
    }
    return data[data.length - 1];
}

function calculatePrediction() {
    const totalMarks = parseFloat(document.getElementById('totalMarks').value) || 0;
    const session = document.getElementById('session').value;
    const difficulty = document.getElementById('difficulty').value;
    const category = document.getElementById('category').value;
    const homeState = document.getElementById('homeState').value;
    
    if (totalMarks < 0 || totalMarks > 300) {
        alert('Please enter marks between 0 and 300');
        return;
    }

    // Adjust marks based on difficulty and session
    // Easy shift: same marks = lower percentile
    // Difficult shift: same marks = higher percentile
    let effectiveMarks = totalMarks;
    if (difficulty === 'easy') effectiveMarks *= 0.92;
    if (difficulty === 'difficult') effectiveMarks *= 1.08;
    
    // Session 2 (April) usually sees a marks-vs-percentile shift (higher marks for same percentile)
    if (session === 'april') effectiveMarks *= 0.96;

    const percentile = Math.min(getPercentileFromMarks(effectiveMarks), 99.9999);
    const rankInfo = getRankFromPercentile(percentile);
    
    // Calculate Category Rank (Simplified)
    const catKey = category.toLowerCase().replace('-ncl', '');
    const categoryMultiplier = rankData.category_multipliers[catKey] || 1.0;
    const air = rankInfo.expected_rank;
    
    // Category rank is usually a fraction of AIR based on reservation/population
    // This is a rough heuristic: Category Rank ≈ AIR * (Category Reservation %)
    const reservationMap = { 'general': 1, 'ews': 0.1, 'obc': 0.27, 'sc': 0.15, 'st': 0.075 };
    const categoryRank = Math.round(air * (reservationMap[catKey] || 1));

    // Update UI
    document.getElementById('predictedPercentile').textContent = percentile.toFixed(4);
    document.getElementById('predictedRank').textContent = air.toLocaleString();
    document.getElementById('categoryRank').textContent = (catKey === 'general') ? 'N/A' : categoryRank.toLocaleString();
    document.getElementById('categoryLabel').textContent = (catKey === 'general') ? 'General Category' : `${category} Rank (Est.)`;
    document.getElementById('displayMarks').textContent = totalMarks;

    // Qualifying Status
    const cutoffObj = cutoffData.jee_advanced_2026[catKey] || cutoffData.jee_advanced_2026['general'];
    const cutoff = cutoffObj.percentile;
    const statusDiv = document.getElementById('qualifyingStatus');
    if (percentile >= cutoff) {
        statusDiv.innerHTML = '✅ <span class="status-text">Qualified for JEE Advanced</span>';
        statusDiv.style.background = '#d1fae5';
        statusDiv.style.color = '#065f46';
    } else {
        statusDiv.innerHTML = '❌ <span class="status-text">Below Expected Cutoff for JEE Advanced</span>';
        statusDiv.style.background = '#fee2e2';
        statusDiv.style.color = '#991b1b';
    }

    // Show Results
    document.getElementById('results').style.display = 'block';
    
    // Update Components
    updateCollegePredictor(air, catKey, homeState);
    updateChart(percentile, totalMarks);
    
    // Scroll
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function updateCollegePredictor(rank, category, homeState) {
    const grid = document.getElementById('collegeGrid');
    grid.innerHTML = '';
    
    const colleges = [...nitData.nits, ...iiitData.iiits];
    const stateMap = {
        'up': 'uttar pradesh',
        'telangana': 'telangana',
        'maharashtra': 'maharashtra',
        'karnataka': 'karnataka',
        'tamilnadu': 'tamil nadu',
        'bihar': 'bihar',
        'wb': 'west bengal',
        'delhi': 'delhi',
        'andhra': 'andhra pradesh'
    };

    const userState = stateMap[homeState] || '';

    const matches = colleges.filter(c => {
        return Object.values(c.branches).some(b => {
            const isHomeState = c.state.toLowerCase() === userState;
            const closing = (isHomeState && b.home_state) ? b.home_state.closing : (b.other_state ? b.other_state.closing : b.closing);
            return (closing * 1.2) >= rank; // 20% buffer for prediction
        });
    }).sort((a, b) => a.ranking - b.ranking).slice(0, 6);

    if (matches.length === 0) {
        grid.innerHTML = '<p class="no-colleges">No matches found in top institutes. Try higher marks!</p>';
        return;
    }

    matches.forEach(c => {
        const card = document.createElement('div');
        card.className = 'college-card';
        const isHomeState = c.state.toLowerCase() === userState;
        card.style.borderLeft = isHomeState ? '4px solid #10b981' : '4px solid #1e40af';
        
        card.innerHTML = `
            <div style="font-weight:700; color:#1e2937;">${c.short_name}</div>
            <div style="font-size:0.85rem; color:#6b7280;">${c.location}, ${c.state}</div>
            <div style="margin-top:8px; font-size:0.8rem; display:flex; justify-content:space-between;">
                <span style="background:#f3f4f6; padding:2px 8px; border-radius:4px;">Rank #${c.ranking}</span>
                ${isHomeState ? '<span style="color:#059669; font-weight:600;">Home State Quota</span>' : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateChart(userPercentile, userMarks) {
    const ctx = document.getElementById('marksPercentileChart').getContext('2d');
    
    if (percentileChart) percentileChart.destroy();
    
    percentileChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: marksToPercentile.map(m => m.marks).reverse(),
            datasets: [{
                label: 'Percentile Trend',
                data: marksToPercentile.map(m => m.percentile).reverse(),
                borderColor: '#2563eb',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(37, 99, 235, 0.1)'
            }, {
                label: 'Your Position',
                data: [{x: userMarks, y: userPercentile}],
                pointBackgroundColor: '#ef4444',
                pointRadius: 8,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Percentile' } },
                x: { title: { display: true, text: 'Marks' } }
            }
        }
    });
}

function updateWhatIf(marks) {
    document.getElementById('sliderValue').textContent = marks;
    const percentile = getPercentileFromMarks(parseFloat(marks));
    const rankInfo = getRankFromPercentile(percentile);
    
    document.getElementById('whatifResult').innerHTML = 
        `Percentile: <strong>${percentile.toFixed(2)}</strong> | Rank: <strong>~${rankInfo.expected_rank.toLocaleString()}</strong>`;
}

// Share Functions
function shareWhatsApp() {
    const p = document.getElementById('predictedPercentile').textContent;
    const r = document.getElementById('predictedRank').textContent;
    const text = `🎯 My Predicted JEE 2026 Result:\nPercentile: ${p}\nRank: ${r}\n\nCheck yours here: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}

function shareTelegram() {
    const p = document.getElementById('predictedPercentile').textContent;
    const r = document.getElementById('predictedRank').textContent;
    const text = `🎯 My Predicted JEE 2026 Result:\nPercentile: ${p}\nRank: ${r}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`);
}

function copyResults() {
    const p = document.getElementById('predictedPercentile').textContent;
    const r = document.getElementById('predictedRank').textContent;
    const text = `JEE 2026 Prediction\nPercentile: ${p}\nRank: ${r}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
}

// Global Exports
window.calculatePrediction = calculatePrediction;
window.updateWhatIf = updateWhatIf;
window.shareWhatsApp = shareWhatsApp;
window.shareTelegram = shareTelegram;
window.copyResults = copyResults;
