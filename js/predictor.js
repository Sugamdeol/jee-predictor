// JEE Mains 2026 Rank Predictor - Fixed Version
// Matches HTML IDs and exposes global functions

let rankData = null;
let currentResult = null;

// Category mapping from HTML values to data keys
const categoryMap = {
    'General': 'general',
    'General (PwD)': 'general',
    'OBC-NCL': 'obc',
    'OBC-NCL (PwD)': 'obc',
    'SC': 'sc',
    'SC (PwD)': 'sc',
    'ST': 'st',
    'ST (PwD)': 'st',
    'EWS': 'ews',
    'EWS (PwD)': 'ews'
};

// Session multipliers
const sessionMultipliers = {
    '1': 1.0,
    '2': 1.1
};

// Initialize - load data
document.addEventListener('DOMContentLoaded', function() {
    loadRankData();
});

function loadRankData() {
    fetch('data/percentile-rank.json')
        .then(response => response.json())
        .then(data => {
            rankData = data;
            console.log('Rank data loaded successfully');
        })
        .catch(error => {
            console.error('Error loading rank data:', error);
            // Fallback data
            rankData = {
                "year": 2024,
                "source": "JEE Mains Official",
                "percentile_data": [
                    {"percentile": 99.9, "rank_range": "1-50", "expected_rank": 25},
                    {"percentile": 99.5, "rank_range": "50-200", "expected_rank": 125},
                    {"percentile": 99.0, "rank_range": "200-500", "expected_rank": 350},
                    {"percentile": 98.0, "rank_range": "500-1000", "expected_rank": 750},
                    {"percentile": 97.0, "rank_range": "1000-2000", "expected_rank": 1500},
                    {"percentile": 95.0, "rank_range": "2000-5000", "expected_rank": 3500},
                    {"percentile": 90.0, "rank_range": "5000-10000", "expected_rank": 7500},
                    {"percentile": 85.0, "rank_range": "10000-20000", "expected_rank": 15000},
                    {"percentile": 80.0, "rank_range": "20000-30000", "expected_rank": 25000},
                    {"percentile": 75.0, "rank_range": "30000-40000", "expected_rank": 35000},
                    {"percentile": 70.0, "rank_range": "40000-50000", "expected_rank": 45000},
                    {"percentile": 60.0, "rank_range": "50000-75000", "expected_rank": 62500},
                    {"percentile": 50.0, "rank_range": "75000-100000", "expected_rank": 87500},
                    {"percentile": 40.0, "rank_range": "100000-150000", "expected_rank": 125000},
                    {"percentile": 30.0, "rank_range": "150000-200000", "expected_rank": 175000},
                    {"percentile": 20.0, "rank_range": "200000-300000", "expected_rank": 250000},
                    {"percentile": 10.0, "rank_range": "300000-500000", "expected_rank": 400000},
                    {"percentile": 5.0, "rank_range": "500000-700000", "expected_rank": 600000},
                    {"percentile": 1.0, "rank_range": "700000+", "expected_rank": 800000}
                ],
                "category_multipliers": {
                    "general": 1.0,
                    "ews": 1.0,
                    "obc": 0.95,
                    "sc": 0.90,
                    "st": 0.85,
                    "pwd": 0.85
                }
            };
        });
}

// Main calculation function - EXPOSED GLOBALLY
function calculatePrediction() {
    const physics = parseFloat(document.getElementById('physics').value) || 0;
    const chemistry = parseFloat(document.getElementById('chemistry').value) || 0;
    const math = parseFloat(document.getElementById('math').value) || 0;
    const session = document.getElementById('session').value;
    const category = document.getElementById('category').value;

    // Validation
    if (physics === 0 && chemistry === 0 && math === 0) {
        alert('Please enter at least one subject score');
        return;
    }

    // Calculate total and percentile
    const totalMarks = physics + chemistry + math;
    const maxMarks = 300;
    const rawPercentile = (totalMarks / maxMarks) * 100;
    
    // Apply session multiplier
    const sessionMultiplier = sessionMultipliers[session] || 1.0;
    const adjustedPercentile = Math.min(rawPercentile * sessionMultiplier, 99.99);

    // Get rank from percentile
    const rankInfo = getRankFromPercentile(adjustedPercentile);
    
    // Apply category multiplier
    const categoryKey = categoryMap[category] || 'general';
    const categoryMultiplier = rankData?.category_multipliers?.[categoryKey] || 1.0;
    
    const adjustedRank = Math.round(rankInfo.expected_rank * categoryMultiplier);
    const rankRange = rankInfo.rank_range;

    // Store result
    currentResult = {
        percentile: adjustedPercentile.toFixed(2),
        rank: adjustedRank,
        rankRange: rankRange,
        category: category,
        totalMarks: totalMarks,
        session: session
    };

    // Display results - MATCHING HTML IDs
    document.getElementById('predictedPercentile').textContent = adjustedPercentile.toFixed(2);
    document.getElementById('predictedRank').textContent = adjustedRank.toLocaleString();
    document.getElementById('rankRange').textContent = rankRange;
    document.getElementById('categoryDisplay').textContent = category;

    // Show results section
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').classList.add('show');

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    // Update what-if analysis
    updateWhatIf();
}

function getRankFromPercentile(percentile) {
    if (!rankData || !rankData.percentile_data) {
        return { rank_range: "N/A", expected_rank: 0 };
    }

    const data = rankData.percentile_data;
    
    // Find the appropriate percentile bracket
    for (let i = 0; i < data.length; i++) {
        if (percentile >= data[i].percentile) {
            return data[i];
        }
    }
    
    // If below lowest percentile, return last entry
    return data[data.length - 1];
}

// What-if analysis - EXPOSED GLOBALLY
function updateWhatIf() {
    if (!currentResult) return;

    const whatIfPercentile = parseFloat(document.getElementById('whatIfPercentile').value) || currentResult.percentile;
    
    const rankInfo = getRankFromPercentile(whatIfPercentile);
    const categoryKey = categoryMap[currentResult.category] || 'general';
    const categoryMultiplier = rankData?.category_multipliers?.[categoryKey] || 1.0;
    const adjustedRank = Math.round(rankInfo.expected_rank * categoryMultiplier);

    document.getElementById('whatIfRank').textContent = adjustedRank.toLocaleString();
    document.getElementById('whatIfRange').textContent = rankInfo.rank_range;
}

// Share functions - EXPOSED GLOBALLY
function shareWhatsApp() {
    if (!currentResult) {
        alert('Please calculate your rank first');
        return;
    }
    
    const text = `📊 JEE Mains 2026 Rank Prediction\n\n` +
        `Percentile: ${currentResult.percentile}\n` +
        `Expected Rank: ${currentResult.rank.toLocaleString()}\n` +
        `Category: ${currentResult.category}\n\n` +
        `Predict yours at: ${window.location.href}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareTelegram() {
    if (!currentResult) {
        alert('Please calculate your rank first');
        return;
    }
    
    const text = `📊 JEE Mains 2026 Rank Prediction\n\n` +
        `Percentile: ${currentResult.percentile}\n` +
        `Expected Rank: ${currentResult.rank.toLocaleString()}\n` +
        `Category: ${currentResult.category}\n\n` +
        `Predict yours at: ${window.location.href}`;
    
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function copyResults() {
    if (!currentResult) {
        alert('Please calculate your rank first');
        return;
    }
    
    const text = `📊 JEE Mains 2026 Rank Prediction\n\n` +
        `Percentile: ${currentResult.percentile}\n` +
        `Expected Rank: ${currentResult.rank.toLocaleString()}\n` +
        `Rank Range: ${currentResult.rankRange}\n` +
        `Category: ${currentResult.category}\n\n` +
        `Predict yours at: ${window.location.href}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy. Please copy manually.');
    });
}

// Expose all functions globally for HTML onclick handlers
window.calculatePrediction = calculatePrediction;
window.updateWhatIf = updateWhatIf;
window.shareWhatsApp = shareWhatsApp;
window.shareTelegram = shareTelegram;
window.copyResults = copyResults;

console.log('JEE Predictor loaded - functions exposed globally');
