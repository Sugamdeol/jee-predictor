// JEE Mains 2026 Predictor - Based on 2024 Data
// Data source: NTA JEE Mains 2024 statistics

// 2024 Marks to Percentile mapping (based on actual NTA data)
const MARKS_TO_PERCENTILE = {
    300: 100.00,
    290: 99.99,
    280: 99.98,
    270: 99.95,
    260: 99.90,
    250: 99.85,
    240: 99.75,
    230: 99.65,
    220: 99.50,
    210: 99.30,
    200: 99.00,
    195: 98.75,
    190: 98.50,
    185: 98.20,
    180: 97.80,
    175: 97.40,
    170: 96.80,
    165: 96.00,
    160: 95.00,
    155: 93.80,
    150: 92.50,
    145: 90.80,
    140: 88.50,
    135: 85.80,
    130: 82.50,
    125: 78.80,
    120: 74.50,
    115: 69.80,
    110: 64.50,
    105: 58.80,
    100: 52.50,
    95: 45.80,
    90: 38.50,
    85: 31.00,
    80: 24.50,
    75: 19.00,
    70: 14.50,
    65: 10.80,
    60: 7.50,
    55: 5.00,
    50: 3.20,
    45: 2.00,
    40: 1.20,
    35: 0.70,
    30: 0.40,
    25: 0.20,
    20: 0.10,
    15: 0.05,
    10: 0.02,
    5: 0.01,
    0: 0.00
};

// JEE Advanced 2024 Qualifying Percentiles
const ADVANCED_CUTOFFS = {
    'General': 93.75,
    'EWS': 91.75,
    'OBC-NCL': 89.75,
    'SC': 66.25,
    'ST': 61.25,
    'PwD': 61.25
};

// College cutoffs (marks based on JEE Mains 2024 closing ranks)
const COLLEGE_CUTOFFS = [
    { name: 'NIT Trichy', branch: 'CSE', general: 280, ews: 275, obc: 270, sc: 245, st: 240 },
    { name: 'NIT Surathkal', branch: 'CSE', general: 275, ews: 270, obc: 265, sc: 240, st: 235 },
    { name: 'NIT Warangal', branch: 'CSE', general: 270, ews: 265, obc: 260, sc: 235, st: 230 },
    { name: 'NIT Rourkela', branch: 'CSE', general: 260, ews: 255, obc: 250, sc: 225, st: 220 },
    { name: 'NIT Calicut', branch: 'CSE', general: 255, ews: 250, obc: 245, sc: 220, st: 215 },
    { name: 'NIT Durgapur', branch: 'CSE', general: 245, ews: 240, obc: 235, sc: 210, st: 205 },
    { name: 'NIT Kurukshetra', branch: 'CSE', general: 240, ews: 235, obc: 230, sc: 205, st: 200 },
    { name: 'NIT Allahabad', branch: 'CSE', general: 235, ews: 230, obc: 225, sc: 200, st: 195 },
    { name: 'NIT Jamshedpur', branch: 'CSE', general: 230, ews: 225, obc: 220, sc: 195, st: 190 },
    { name: 'NIT Raipur', branch: 'CSE', general: 225, ews: 220, obc: 215, sc: 190, st: 185 },
    { name: 'IIIT Hyderabad', branch: 'CSE', general: 285, ews: 280, obc: 275, sc: 255, st: 250 },
    { name: 'IIIT Bangalore', branch: 'CSE', general: 275, ews: 270, obc: 265, sc: 245, st: 240 },
    { name: 'IIIT Allahabad', branch: 'CSE', general: 265, ews: 260, obc: 255, sc: 235, st: 230 },
    { name: 'IIIT Gwalior', branch: 'CSE', general: 255, ews: 250, obc: 245, sc: 225, st: 220 },
    { name: 'IIIT Jabalpur', branch: 'CSE', general: 245, ews: 240, obc: 235, sc: 215, st: 210 }
];

// Get percentile from marks using linear interpolation
function getPercentileFromMarks(marks) {
    if (marks >= 300) return 100.00;
    if (marks <= 0) return 0.00;
    
    const sortedMarks = Object.keys(MARKS_TO_PERCENTILE).map(Number).sort((a, b) => b - a);
    
    for (let i = 0; i < sortedMarks.length - 1; i++) {
        const high = sortedMarks[i];
        const low = sortedMarks[i + 1];
        
        if (marks <= high && marks >= low) {
            const highP = MARKS_TO_PERCENTILE[high];
            const lowP = MARKS_TO_PERCENTILE[low];
            const ratio = (marks - low) / (high - low);
            return lowP + (highP - lowP) * ratio;
        }
    }
    
    return 0;
}

// Calculate AIR from percentile
function calculateRankFromPercentile(percentile) {
    const totalStudents = 1200000; // Approximate JEE Mains 2024 takers
    
    if (percentile >= 99.999) return 1;
    if (percentile <= 0) return totalStudents;
    
    const rank = Math.round(totalStudents * (100 - percentile) / 100);
    return Math.max(1, rank);
}

// Calculate category rank (approximate based on reservation percentages)
function calculateCategoryRank(air, category) {
    const categoryPercentages = {
        'General': 40.5,
        'EWS': 10.0,
        'OBC-NCL': 27.0,
        'SC': 15.0,
        'ST': 7.5,
        'PwD': 5.0  // Horizontal reservation
    };
    
    // PwD is horizontal, so calculate differently
    if (category === 'PwD') {
        return Math.round(air * 0.05);  // Approximate 5% of total
    }
    
    const percentage = categoryPercentages[category] || 40.5;
    return Math.round(air * (percentage / 100));
}

// Get matching colleges based on marks and category
function getMatchingColleges(marks, category) {
    const categoryKey = category.toLowerCase().replace('-ncl', '').replace('pwd', 'general');
    const colleges = [];
    
    for (const college of COLLEGE_CUTOFFS) {
        const cutoff = college[categoryKey] || college.general;
        
        // Show colleges within 40 marks range
        if (marks >= cutoff - 40) {
            let chance;
            if (marks >= cutoff + 10) chance = 'High';
            else if (marks >= cutoff - 10) chance = 'Good';
            else if (marks >= cutoff - 25) chance = 'Medium';
            else chance = 'Low';
            
            colleges.push({
                name: college.name,
                branch: college.branch,
                cutoff: cutoff,
                chance: chance,
                diff: marks - cutoff
            });
        }
    }
    
    // Sort by chance priority and cutoff
    const chancePriority = { 'High': 4, 'Good': 3, 'Medium': 2, 'Low': 1 };
    return colleges.sort((a, b) => {
        if (chancePriority[b.chance] !== chancePriority[a.chance]) {
            return chancePriority[b.chance] - chancePriority[a.chance];
        }
        return b.cutoff - a.cutoff;
    }).slice(0, 8); // Show top 8 colleges
}

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString('en-IN');
}

// MAIN PREDICTION FUNCTION
function calculatePrediction() {
    // Get input values
    const physics = parseFloat(document.getElementById('physics').value) || 0;
    const chemistry = parseFloat(document.getElementById('chemistry').value) || 0;
    const math = parseFloat(document.getElementById('math').value) || 0;
    const totalMarksInput = parseFloat(document.getElementById('totalMarks').value) || 0;
    const category = document.getElementById('category').value;
    
    // Calculate total marks
    let totalMarks = totalMarksInput > 0 ? totalMarksInput : (physics + chemistry + math);
    
    // Validation
    if (totalMarks < 0 || totalMarks > 300) {
        alert('Please enter valid marks between 0 and 300');
        return;
    }
    
    if (totalMarks === 0) {
        alert('Please enter your marks');
        return;
    }
    
    // Show loading state
    const btn = document.querySelector('.calculate-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Calculating...';
    btn.disabled = true;
    
    // Small delay for better UX
    setTimeout(() => {
        // Calculate percentile
        const percentile = getPercentileFromMarks(totalMarks);
        
        // Calculate AIR
        const air = calculateRankFromPercentile(percentile);
        
        // Calculate category rank
        const categoryRank = calculateCategoryRank(air, category);
        
        // Check JEE Advanced eligibility
        const advancedCutoff = ADVANCED_CUTOFFS[category] || 93.75;
        const isEligible = percentile >= advancedCutoff;
        
        // Get college predictions
        const colleges = getMatchingColleges(totalMarks, category);
        
        // Update UI
        document.getElementById('predictedPercentile').textContent = percentile.toFixed(2) + '%ile';
        document.getElementById('predictedRank').textContent = formatNumber(air);
        document.getElementById('categoryRank').textContent = formatNumber(categoryRank);
        document.getElementById('categoryLabel').textContent = category;
        document.getElementById('displayMarks').textContent = Math.round(totalMarks);
        
        // Update qualifying status
        const statusEl = document.getElementById('qualifyingStatus');
        if (isEligible) {
            statusEl.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Qualified for JEE Advanced 2025</span>';
            statusEl.className = 'qualifying-status qualified';
        } else {
            const needed = (advancedCutoff - percentile).toFixed(2);
            statusEl.innerHTML = `<span class="status-icon">❌</span><span class="status-text">Need ${needed}%ile more for JEE Advanced (Cutoff: ${advancedCutoff}%ile)</span>`;
            statusEl.className = 'qualifying-status not-qualified';
        }
        
        // Update colleges
        const collegeContainer = document.getElementById('collegeGrid');
        if (colleges.length === 0) {
            collegeContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #94a3b8;">
                    <p style="font-size: 1.1rem; margin-bottom: 10px;">📚 No NITs/IIITs match this score range</p>
                    <p style="font-size: 0.9rem;">Focus on improving your score. Target at least 120+ marks for good colleges.</p>
                </div>
            `;
        } else {
            collegeContainer.innerHTML = colleges.map(c => {
                const chanceClass = c.chance.toLowerCase();
                const diffText = c.diff >= 0 ? `+${c.diff}` : c.diff;
                return `
                    <div class="college-card">
                        <div class="college-info">
                            <div class="college-name">${c.name}</div>
                            <div class="college-branch">${c.branch}</div>
                        </div>
                        <div class="college-stats">
                            <div class="college-cutoff">Cutoff: ~${c.cutoff} (${diffText})</div>
                            <div class="college-chance ${chanceClass}">${c.chance} Chance</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        // Show results
        document.getElementById('results').style.display = 'block';
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
    }, 500); // 500ms delay for UX
}

// Auto-calculate total when subjects change
function setupAutoCalculate() {
    const inputs = ['physics', 'chemistry', 'math'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const p = parseFloat(document.getElementById('physics').value) || 0;
            const c = parseFloat(document.getElementById('chemistry').value) || 0;
            const m = parseFloat(document.getElementById('math').value) || 0;
            const total = p + c + m;
            if (total > 0) {
                document.getElementById('totalMarks').placeholder = `Auto: ${total}`;
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', setupAutoCalculate);
