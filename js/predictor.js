// JEE Mains 2026 Predictor - Fixed to match HTML

// 2024 Data: Marks to Percentile mapping
const MARKS_TO_PERCENTILE = {
    280: 99.95, 270: 99.90, 260: 99.85, 250: 99.80, 240: 99.70,
    230: 99.60, 220: 99.50, 210: 99.30, 200: 99.00, 190: 98.50,
    180: 97.50, 170: 96.00, 160: 94.00, 150: 91.00, 140: 87.00,
    130: 82.00, 120: 76.00, 110: 69.00, 100: 61.00, 90: 52.00,
    80: 43.00, 70: 34.00, 60: 26.00, 50: 19.00, 40: 13.00,
    30: 8.00, 20: 4.00, 10: 1.50, 0: 0.00
};

// JEE Advanced cutoffs by category
const ADVANCED_CUTOFFS = {
    'General': 93.75, 'EWS': 91.75, 'OBC-NCL': 89.75, 'SC': 66.25, 'ST': 61.25, 'PwD': 61.25
};

// College cutoffs (marks based, 2024 approximate)
const COLLEGE_CUTOFFS = [
    { name: 'NIT Trichy', branch: 'CSE', general: 280, obc: 275, ews: 278, sc: 260, st: 255 },
    { name: 'NIT Surathkal', branch: 'CSE', general: 275, obc: 270, ews: 273, sc: 255, st: 250 },
    { name: 'NIT Warangal', branch: 'CSE', general: 270, obc: 265, ews: 268, sc: 250, st: 245 },
    { name: 'NIT Rourkela', branch: 'CSE', general: 265, obc: 260, ews: 263, sc: 245, st: 240 },
    { name: 'NIT Calicut', branch: 'CSE', general: 260, obc: 255, ews: 258, sc: 240, st: 235 },
    { name: 'NIT Durgapur', branch: 'CSE', general: 255, obc: 250, ews: 253, sc: 235, st: 230 },
    { name: 'NIT Kurukshetra', branch: 'CSE', general: 250, obc: 245, ews: 248, sc: 230, st: 225 },
    { name: 'NIT Allahabad', branch: 'CSE', general: 245, obc: 240, ews: 243, sc: 225, st: 220 },
    { name: 'NIT Jamshedpur', branch: 'CSE', general: 240, obc: 235, ews: 238, sc: 220, st: 215 },
    { name: 'NIT Raipur', branch: 'CSE', general: 235, obc: 230, ews: 233, sc: 215, st: 210 },
    { name: 'IIIT Hyderabad', branch: 'CSE', general: 290, obc: 285, ews: 288, sc: 270, st: 265 },
    { name: 'IIIT Bangalore', branch: 'CSE', general: 285, obc: 280, ews: 283, sc: 265, st: 260 },
    { name: 'IIIT Allahabad', branch: 'CSE', general: 270, obc: 265, ews: 268, sc: 250, st: 245 },
    { name: 'IIIT Gwalior', branch: 'CSE', general: 265, obc: 260, ews: 263, sc: 245, st: 240 },
    { name: 'IIIT Jabalpur', branch: 'CSE', general: 260, obc: 255, ews: 258, sc: 240, st: 235 }
];

// Get percentile from marks using interpolation
function getPercentileFromMarks(marks) {
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
    
    return marks >= 280 ? 99.95 : 0;
}

// Calculate rank from percentile
function calculateRankFromPercentile(percentile) {
    const totalStudents = 1400000; // Approximate JEE Mains takers
    if (percentile >= 99.99) return 1;
    const rank = Math.round(totalStudents * (100 - percentile) / 100);
    return rank < 1 ? 1 : rank;
}

// Get matching colleges
function getMatchingColleges(marks, category) {
    const categoryKey = category.toLowerCase().replace('-ncl', '').replace('pwd', '');
    const colleges = [];
    
    for (const college of COLLEGE_CUTOFFS) {
        const cutoff = college[categoryKey] || college['general'];
        if (marks >= cutoff - 30) {
            colleges.push({
                name: college.name,
                branch: college.branch,
                cutoff: cutoff,
                chance: marks >= cutoff ? 'High' : (marks >= cutoff - 15 ? 'Medium' : 'Low')
            });
        }
    }
    
    return colleges.sort((a, b) => b.cutoff - a.cutoff);
}

// MAIN FUNCTION - Called by HTML button
function calculatePrediction() {
    // Get input values
    const physics = parseFloat(document.getElementById('physics').value) || 0;
    const chemistry = parseFloat(document.getElementById('chemistry').value) || 0;
    const math = parseFloat(document.getElementById('math').value) || 0;
    const totalMarksInput = parseFloat(document.getElementById('totalMarks').value) || 0;
    const category = document.getElementById('category').value;
    
    // Use total marks input if provided, otherwise sum subjects
    let totalMarks = totalMarksInput > 0 ? totalMarksInput : (physics + chemistry + math);
    
    // Validate
    if (totalMarks < 0 || totalMarks > 300) {
        alert('Please enter valid marks between 0 and 300');
        return;
    }
    
    // Calculate percentile
    const percentile = getPercentileFromMarks(totalMarks);
    
    // Calculate rank
    const rank = calculateRankFromPercentile(percentile);
    
    // Calculate category rank (approximate)
    const categoryMultipliers = {
        'General': 1.0, 'EWS': 0.1, 'OBC-NCL': 0.27, 'SC': 0.15, 'ST': 0.075, 'PwD': 0.005
    };
    const categoryRank = Math.round(rank * (categoryMultipliers[category] || 1.0));
    
    // Check Advanced eligibility
    const advancedCutoff = ADVANCED_CUTOFFS[category] || 93.75;
    const isEligible = percentile >= advancedCutoff;
    
    // Get matching colleges
    const colleges = getMatchingColleges(totalMarks, category);
    
    // Update results - using exact HTML IDs
    document.getElementById('predictedPercentile').textContent = percentile.toFixed(2) + '%ile';
    document.getElementById('predictedRank').textContent = rank.toLocaleString();
    document.getElementById('categoryRank').textContent = categoryRank.toLocaleString();
    document.getElementById('categoryLabel').textContent = category;
    document.getElementById('displayMarks').textContent = totalMarks.toFixed(0);
    
    // Update qualifying status
    const statusEl = document.getElementById('qualifyingStatus');
    if (isEligible) {
        statusEl.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Qualified for JEE Advanced</span>';
        statusEl.className = 'qualifying-status qualified';
    } else {
        statusEl.innerHTML = '<span class="status-icon">❌</span><span class="status-text">Not Qualified (Need ' + advancedCutoff + '%ile)</span>';
        statusEl.className = 'qualifying-status not-qualified';
    }
    
    // Update colleges
    const collegeContainer = document.getElementById('collegeGrid');
    if (colleges.length === 0) {
        collegeContainer.innerHTML = '<p style="text-align: center; color: #94a3b8; grid-column: 1/-1;">No colleges match your score range. Try improving your score!</p>';
    } else {
        collegeContainer.innerHTML = colleges.map(c => `
            <div class="college-card">
                <div class="college-info">
                    <div class="college-name">${c.name}</div>
                    <div class="college-branch">${c.branch}</div>
                </div>
                <div class="college-stats">
                    <div class="college-cutoff">Cutoff: ~${c.cutoff}</div>
                    <div class="college-chance ${c.chance.toLowerCase()}">${c.chance} Chance</div>
                </div>
            </div>
        `).join('');
    }
    
    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}
