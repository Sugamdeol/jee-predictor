// JEE Mains 2026 Predictor - Main Logic

// 2024 Normalization Data (approximate)
const SHIFT_DATA = {
    'shift1': { avg: 120, sd: 35 },
    'shift2': { avg: 115, sd: 38 },
    'shift3': { avg: 118, sd: 36 },
    'shift4': { avg: 122, sd: 34 },
    'shift5': { avg: 116, sd: 37 }
};

// Category multipliers
const CATEGORY_MULTIPLIERS = {
    'general': 1.0,
    'ews': 0.95,
    'obc': 0.90,
    'sc': 0.75,
    'st': 0.70,
    'pwd': 0.65
};

// College cutoffs data (2024 approximate)
const COLLEGE_CUTOFFS = {
    'nit_trichy': { name: 'NIT Trichy', general: 280, obc: 270, ews: 275, sc: 250, st: 240, branch: 'CSE' },
    'nit_surathkal': { name: 'NIT Surathkal', general: 275, obc: 265, ews: 270, sc: 245, st: 235, branch: 'CSE' },
    'nit_warangal': { name: 'NIT Warangal', general: 270, obc: 260, ews: 265, sc: 240, st: 230, branch: 'CSE' },
    'nit_rourkela': { name: 'NIT Rourkela', general: 265, obc: 255, ews: 260, sc: 235, st: 225, branch: 'CSE' },
    'nit_calicut': { name: 'NIT Calicut', general: 260, obc: 250, ews: 255, sc: 230, st: 220, branch: 'CSE' },
    'nit_durgapur': { name: 'NIT Durgapur', general: 255, obc: 245, ews: 250, sc: 225, st: 215, branch: 'CSE' },
    'nit_kurukshetra': { name: 'NIT Kurukshetra', general: 250, obc: 240, ews: 245, sc: 220, st: 210, branch: 'CSE' },
    'nit_allahabad': { name: 'NIT Allahabad', general: 245, obc: 235, ews: 240, sc: 215, st: 205, branch: 'CSE' },
    'nit_jamshedpur': { name: 'NIT Jamshedpur', general: 240, obc: 230, ews: 235, sc: 210, st: 200, branch: 'CSE' },
    'nit_raipur': { name: 'NIT Raipur', general: 235, obc: 225, ews: 230, sc: 205, st: 195, branch: 'CSE' },
    'iiit_hyderabad': { name: 'IIIT Hyderabad', general: 290, obc: 280, ews: 285, sc: 260, st: 250, branch: 'CSE' },
    'iiit_bangalore': { name: 'IIIT Bangalore', general: 285, obc: 275, ews: 280, sc: 255, st: 245, branch: 'CSE' },
    'iiit_allahabad': { name: 'IIIT Allahabad', general: 270, obc: 260, ews: 265, sc: 240, st: 230, branch: 'CSE' },
    'iiit_gwalior': { name: 'IIIT Gwalior', general: 265, obc: 255, ews: 260, sc: 235, st: 225, branch: 'CSE' },
    'iiit_jabalpur': { name: 'IIIT Jabalpur', general: 260, obc: 250, ews: 255, sc: 230, st: 220, branch: 'CSE' }
};

// Calculate percentile from marks
function calculatePercentile(marks, shift, session) {
    const shiftInfo = SHIFT_DATA[shift] || SHIFT_DATA['shift1'];
    const zScore = (marks - shiftInfo.avg) / shiftInfo.sd;
    
    // Approximate percentile using normal distribution
    let percentile = 50 + (zScore * 34);
    percentile = Math.max(0, Math.min(99.99, percentile));
    
    // Session adjustment
    if (session === 'jan') {
        percentile *= 0.98; // Jan session slightly tougher
    }
    
    return percentile.toFixed(2);
}

// Calculate expected rank
function calculateRank(percentile) {
    // 2024: ~14 lakh candidates
    const totalCandidates = 1400000;
    const rank = Math.round(totalCandidates * (100 - percentile) / 100);
    return rank < 1 ? 1 : rank;
}

// Get colleges based on marks and category
function getMatchingColleges(marks, category) {
    const colleges = [];
    
    for (const [key, college] of Object.entries(COLLEGE_CUTOFFS)) {
        const cutoff = college[category] || college['general'];
        if (marks >= cutoff - 20) { // Within 20 marks range
            colleges.push({
                name: college.name,
                branch: college.branch,
                cutoff: cutoff,
                chance: marks >= cutoff ? 'High' : (marks >= cutoff - 10 ? 'Medium' : 'Low')
            });
        }
    }
    
    return colleges.sort((a, b) => b.cutoff - a.cutoff);
}

// Check JEE Advanced eligibility
function checkAdvancedEligibility(percentile, category) {
    const cutoffs = {
        'general': 90.0,
        'ews': 87.0,
        'obc': 85.0,
        'sc': 65.0,
        'st': 60.0,
        'pwd': 55.0
    };
    
    const required = cutoffs[category] || cutoffs['general'];
    return {
        eligible: parseFloat(percentile) >= required,
        cutoff: required
    };
}

// Main prediction function
function calculatePrediction() {
    const marks = parseFloat(document.getElementById('marks').value);
    const category = document.getElementById('category').value;
    const shift = document.getElementById('shift').value;
    const session = document.getElementById('session').value;
    
    if (!marks || marks < 0 || marks > 300) {
        alert('Please enter valid marks between 0 and 300');
        return;
    }
    
    // Calculate percentile
    const percentile = calculatePercentile(marks, shift, session);
    
    // Calculate rank
    const rank = calculateRank(parseFloat(percentile));
    
    // Get colleges
    const colleges = getMatchingColleges(marks, category);
    
    // Check Advanced eligibility
    const advanced = checkAdvancedEligibility(percentile, category);
    
    // Update results
    document.getElementById('percentile').textContent = percentile + '%ile';
    document.getElementById('rank').textContent = rank.toLocaleString();
    document.getElementById('advanced').textContent = advanced.eligible ? 
        'Yes (Cutoff: ' + advanced.cutoff + '%ile)' : 
        'No (Need ' + advanced.cutoff + '%ile)';
    
    // Update colleges list
    const collegeList = document.getElementById('collegeList');
    if (colleges.length === 0) {
        collegeList.innerHTML = '<p style="text-align: center; color: #94a3b8;">No colleges match your score range</p>';
    } else {
        collegeList.innerHTML = colleges.map(c => `
            <div class="college-card">
                <div class="college-name">${c.name}</div>
                <div class="college-branch">${c.branch}</div>
                <div class="college-cutoff">Cutoff: ~${c.cutoff} marks</div>
                <div class="college-chance ${c.chance.toLowerCase()}">${c.chance} Chance</div>
            </div>
        `).join('');
    }
    
    // Show results section
    document.getElementById('results').style.display = 'block';
}

// Reset form
function resetForm() {
    document.getElementById('marks').value = '';
    document.getElementById('category').value = 'general';
    document.getElementById('shift').value = 'shift1';
    document.getElementById('session').value = 'jan';
    document.getElementById('results').style.display = 'none';
}
