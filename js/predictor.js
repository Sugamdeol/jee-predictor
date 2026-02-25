// JEE Mains 2026 Predictor - Fixed Version

// 2024 Data: Marks to Percentile mapping (approximate)
const MARKS_TO_PERCENTILE = {
    280: 99.95, 270: 99.90, 260: 99.85, 250: 99.80, 240: 99.70,
    230: 99.60, 220: 99.50, 210: 99.30, 200: 99.00, 190: 98.50,
    180: 97.50, 170: 96.00, 160: 94.00, 150: 91.00, 140: 87.00,
    130: 82.00, 120: 76.00, 110: 69.00, 100: 61.00, 90: 52.00,
    80: 43.00, 70: 34.00, 60: 26.00, 50: 19.00, 40: 13.00,
    30: 8.00, 20: 4.00, 10: 1.50, 0: 0.00
};

// Category multipliers for percentile adjustment
const CATEGORY_MULTIPLIERS = {
    'general': 1.0, 'ews': 1.0, 'obc': 1.0, 'sc': 1.0, 'st': 1.0,
    'pwd_general': 1.0, 'pwd_obc': 1.0, 'pwd_sc': 1.0, 'pwd_st': 1.0
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
function calculateRankFromPercentile(percentile, totalStudents) {
    if (percentile >= 99.99) return 1;
    const rank = Math.round(totalStudents * (100 - percentile) / 100);
    return rank < 1 ? 1 : rank;
}

// Check JEE Advanced eligibility
function checkAdvancedEligibility(percentile, category) {
    const cutoffs = {
        'general': 93.75, 'ews': 91.75, 'obc': 89.75, 'sc': 66.25, 'st': 61.25,
        'pwd_general': 93.75, 'pwd_obc': 89.75, 'pwd_sc': 66.25, 'pwd_st': 61.25
    };
    
    const required = cutoffs[category] || cutoffs['general'];
    return {
        eligible: percentile >= required,
        cutoff: required
    };
}

// Get matching colleges
function getMatchingColleges(marks, category) {
    const categoryKey = category.startsWith('pwd_') ? category.replace('pwd_', '') : category;
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

// Calculate subject percentile (simplified estimation)
function getSubjectPercentile(marks) {
    if (marks >= 90) return 99 + (marks - 90) * 0.1;
    if (marks >= 80) return 95 + (marks - 80) * 0.4;
    if (marks >= 70) return 88 + (marks - 70) * 0.7;
    if (marks >= 60) return 78 + (marks - 60) * 1.0;
    if (marks >= 50) return 65 + (marks - 50) * 1.3;
    if (marks >= 40) return 50 + (marks - 40) * 1.5;
    if (marks >= 30) return 35 + (marks - 30) * 1.5;
    if (marks >= 20) return 20 + (marks - 20) * 1.5;
    return marks * 1.0;
}

// MAIN FUNCTION - Called by HTML button
function calculateRank() {
    // Get input values
    const physics = parseFloat(document.getElementById('physics').value) || 0;
    const chemistry = parseFloat(document.getElementById('chemistry').value) || 0;
    const math = parseFloat(document.getElementById('math').value) || 0;
    const category = document.getElementById('category').value;
    const totalStudents = parseInt(document.getElementById('totalStudents').value) || 1400000;
    
    // Validate inputs
    if (physics < 0 || physics > 100 || chemistry < 0 || chemistry > 100 || math < 0 || math > 100) {
        alert('Please enter valid marks between 0 and 100 for each subject');
        return;
    }
    
    // Calculate total marks
    const totalMarks = physics + chemistry + math;
    
    // Calculate overall percentile
    const percentile = getPercentileFromMarks(totalMarks);
    
    // Calculate rank
    const rank = calculateRankFromPercentile(percentile, totalStudents);
    
    // Check Advanced eligibility
    const advanced = checkAdvancedEligibility(percentile, category);
    
    // Get matching colleges
    const colleges = getMatchingColleges(totalMarks, category);
    
    // Update results in HTML
    document.getElementById('totalMarks').textContent = totalMarks.toFixed(0);
    document.getElementById('percentile').textContent = percentile.toFixed(2) + '%ile';
    document.getElementById('rank').textContent = rank.toLocaleString();
    document.getElementById('advancedEligible').textContent = advanced.eligible ? 
        'Yes (Cutoff: ' + advanced.cutoff + '%ile)' : 
        'No (Need ' + advanced.cutoff + '%ile)';
    document.getElementById('advancedEligible').className = 'value ' + (advanced.eligible ? 'highlight' : '');
    
    // Subject percentiles
    document.getElementById('physicsPercentile').textContent = getSubjectPercentile(physics).toFixed(2) + '%ile';
    document.getElementById('chemistryPercentile').textContent = getSubjectPercentile(chemistry).toFixed(2) + '%ile';
    document.getElementById('mathPercentile').textContent = getSubjectPercentile(math).toFixed(2) + '%ile';
    
    // College matches
    const collegeContainer = document.getElementById('collegeMatches');
    if (colleges.length === 0) {
        collegeContainer.innerHTML = '<p style="text-align: center; color: #94a3b8;">No colleges match your score range. Try improving your score!</p>';
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
    
    // Show results
    document.getElementById('results').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}
