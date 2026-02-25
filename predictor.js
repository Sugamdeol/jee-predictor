// JEE Mains 2026 Rank Predictor
// Based on 2024 data and trends

// Marks to Percentile mapping (approximate from 2024 data)
const marksToPercentileData = {
    general: [
        { marks: 280, percentile: 99.99 },
        { marks: 270, percentile: 99.97 },
        { marks: 260, percentile: 99.94 },
        { marks: 250, percentile: 99.90 },
        { marks: 240, percentile: 99.85 },
        { marks: 230, percentile: 99.78 },
        { marks: 220, percentile: 99.68 },
        { marks: 210, percentile: 99.55 },
        { marks: 200, percentile: 99.35 },
        { marks: 190, percentile: 99.05 },
        { marks: 180, percentile: 98.65 },
        { marks: 170, percentile: 98.10 },
        { marks: 160, percentile: 97.40 },
        { marks: 150, percentile: 96.50 },
        { marks: 140, percentile: 95.30 },
        { marks: 130, percentile: 93.80 },
        { marks: 120, percentile: 91.90 },
        { marks: 110, percentile: 89.50 },
        { marks: 100, percentile: 86.50 },
        { marks: 90, percentile: 82.50 },
        { marks: 80, percentile: 77.50 },
        { marks: 70, percentile: 71.50 },
        { marks: 60, percentile: 64.00 },
        { marks: 50, percentile: 55.00 },
        { marks: 40, percentile: 44.00 },
        { marks: 30, percentile: 32.00 },
        { marks: 20, percentile: 20.00 },
        { marks: 10, percentile: 10.00 },
        { marks: 0, percentile: 0 }
    ]
};

// JEE Advanced cutoffs (2024, expected similar for 2026)
const advancedCutoffs = {
    general: 93.75,
    obc: 79.00,
    sc: 60.00,
    st: 47.00,
    ews: 91.00,
    pwd_general: 45.00,
    pwd_obc: 45.00,
    pwd_sc: 45.00,
    pwd_st: 45.00
};

// NIT/IIIT cutoff data (approximate closing ranks for CSE/ECE/Mechanical)
const nitCutoffs = {
    general: {
        'NIT Trichy': { cse: 1500, ece: 3500, mech: 8000 },
        'NIT Surathkal': { cse: 2000, ece: 4500, mech: 9000 },
        'NIT Warangal': { cse: 2500, ece: 5000, mech: 10000 },
        'NIT Rourkela': { cse: 4000, ece: 8000, mech: 15000 },
        'NIT Calicut': { cse: 5000, ece: 10000, mech: 18000 },
        'NIT Durgapur': { cse: 8000, ece: 15000, mech: 25000 },
        'NIT Kurukshetra': { cse: 7000, ece: 14000, mech: 22000 },
        'NIT Jaipur': { cse: 6000, ece: 12000, mech: 20000 },
        'NIT Allahabad': { cse: 5500, ece: 11000, mech: 19000 },
        'IIIT Hyderabad': { cse: 1200, ece: 2500 },
        'IIIT Bangalore': { cse: 3000, ece: 6000 },
        'IIIT Delhi': { cse: 4000, ece: 8000 }
    },
    obc: {
        'NIT Trichy': { cse: 4500, ece: 9000, mech: 18000 },
        'NIT Surathkal': { cse: 5500, ece: 11000, mech: 20000 },
        'NIT Warangal': { cse: 6500, ece: 13000, mech: 22000 },
        'IIIT Hyderabad': { cse: 3500, ece: 7000 }
    },
    sc: {
        'NIT Trichy': { cse: 15000, ece: 25000, mech: 40000 },
        'NIT Surathkal': { cse: 18000, ece: 30000, mech: 45000 },
        'IIIT Hyderabad': { cse: 10000, ece: 18000 }
    },
    st: {
        'NIT Trichy': { cse: 25000, ece: 40000, mech: 60000 },
        'NIT Surathkal': { cse: 30000, ece: 45000, mech: 70000 }
    }
};

function getPercentileFromMarks(marks) {
    const data = marksToPercentileData.general;
    
    // Find the range
    for (let i = 0; i < data.length - 1; i++) {
        if (marks <= data[i].marks && marks >= data[i + 1].marks) {
            // Linear interpolation
            const range = data[i].marks - data[i + 1].marks;
            const position = data[i].marks - marks;
            const ratio = position / range;
            const percentileDiff = data[i].percentile - data[i + 1].percentile;
            return data[i].percentile - (ratio * percentileDiff);
        }
    }
    
    // If above 280
    if (marks > 280) {
        return 99.995;
    }
    
    return 0;
}

function calculateRankFromPercentile(percentile, totalStudents) {
    // Formula: Rank = (100 - Percentile) × Total / 100
    const rank = Math.round((100 - percentile) * totalStudents / 100);
    return rank < 1 ? 1 : rank;
}

function getSubjectPercentile(marks) {
    // Subject percentile is roughly similar to overall but scaled
    // 100 marks in subject ~ similar percentile curve
    return getPercentileFromMarks(marks * 3); // Scale to 300 equivalent
}

function getPossibleColleges(rank, category) {
    const colleges = nitCutoffs[category] || nitCutoffs.general;
    const matches = [];
    
    for (const [college, branches] of Object.entries(colleges)) {
        const possibleBranches = [];
        
        for (const [branch, cutoffRank] of Object.entries(branches)) {
            if (rank <= cutoffRank) {
                possibleBranches.push(branch.toUpperCase());
            }
        }
        
        if (possibleBranches.length > 0) {
            matches.push({
                college,
                branches: possibleBranches
            });
        }
    }
    
    return matches;
}

function calculateRank() {
    const physics = parseFloat(document.getElementById('physics').value) || 0;
    const chemistry = parseFloat(document.getElementById('chemistry').value) || 0;
    const math = parseFloat(document.getElementById('math').value) || 0;
    const category = document.getElementById('category').value;
    const totalStudents = parseInt(document.getElementById('totalStudents').value) || 1400000;
    
    const totalMarks = physics + chemistry + math;
    
    if (totalMarks === 0) {
        alert('Please enter at least some marks');
        return;
    }
    
    // Calculate percentiles
    const overallPercentile = getPercentileFromMarks(totalMarks);
    const physicsPercentile = getSubjectPercentile(physics);
    const chemistryPercentile = getSubjectPercentile(chemistry);
    const mathPercentile = getSubjectPercentile(math);
    
    // Calculate rank
    const rank = calculateRankFromPercentile(overallPercentile, totalStudents);
    
    // Check JEE Advanced eligibility
    const advancedCutoff = advancedCutoffs[category] || advancedCutoffs.general;
    const isAdvancedEligible = overallPercentile >= advancedCutoff;
    
    // Get college matches
    const collegeMatches = getPossibleColleges(rank, category);
    
    // Display results
    document.getElementById('totalMarks').textContent = totalMarks.toFixed(0);
    document.getElementById('percentile').textContent = overallPercentile.toFixed(2) + '%ile';
    document.getElementById('rank').textContent = rank.toLocaleString();
    document.getElementById('advancedEligible').textContent = isAdvancedEligible ? '✅ Eligible' : '❌ Not Eligible';
    document.getElementById('advancedEligible').className = 'value ' + (isAdvancedEligible ? 'eligible' : 'not-eligible');
    
    document.getElementById('physicsPercentile').textContent = physicsPercentile.toFixed(2) + '%ile';
    document.getElementById('chemistryPercentile').textContent = chemistryPercentile.toFixed(2) + '%ile';
    document.getElementById('mathPercentile').textContent = mathPercentile.toFixed(2) + '%ile';
    
    // Display colleges
    const collegeDiv = document.getElementById('collegeMatches');
    if (collegeMatches.length > 0) {
        let html = '';
        collegeMatches.forEach(match => {
            html += `<div class="college-item">
                <strong>${match.college}</strong>
                <span class="branches">${match.branches.join(', ')}</span>
            </div>`;
        });
        collegeDiv.innerHTML = html;
    } else {
        collegeDiv.innerHTML = '<p class="no-match">Try improving your score for NIT/IIIT options. Consider state colleges or other institutes.</p>';
    }
    
    // Show results
    document.getElementById('results').classList.remove('hidden');
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Allow Enter key to calculate
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateRank();
            }
        });
    });
});
// Alias for HTML compatibility
function calculatePrediction() {
    calculateRank();
}

// Deployed Wed Feb 25 04:29:18 UTC 2026
