// JEE Mains 2026 Rank Predictor
// Based on 2024 data and trends

// Marks to Percentile mapping (approximate from 2024 data)
const marksToPercentileData = [
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
];

// JEE Advanced cutoffs (2024)
const advancedCutoffs = {
    'General': 93.75,
    'EWS': 91.00,
    'OBC-NCL': 79.00,
    'SC': 60.00,
    'ST': 47.00,
    'PwD': 45.00
};

// Home state quotas (simplified)
const homeStateQuotas = {
    'andhra': ['NIT Warangal', 'IIIT Hyderabad'],
    'telangana': ['NIT Warangal', 'IIIT Hyderabad'],
    'maharashtra': ['NIT Surathkal'],
    'karnataka': ['NIT Surathkal'],
    'tamilnadu': ['NIT Trichy'],
    'up': ['NIT Allahabad'],
    'bihar': ['NIT Patna'],
    'wb': ['NIT Durgapur'],
    'delhi': ['IIIT Delhi', 'NIT Delhi']
};

function getPercentileFromMarks(marks) {
    if (marks >= 280) return 99.995;
    if (marks <= 0) return 0;
    
    for (let i = 0; i < marksToPercentileData.length - 1; i++) {
        const upper = marksToPercentileData[i];
        const lower = marksToPercentileData[i + 1];
        
        if (marks <= upper.marks && marks >= lower.marks) {
            const range = upper.marks - lower.marks;
            const position = marks - lower.marks;
            const ratio = position / range;
            return lower.percentile + (ratio * (upper.percentile - lower.percentile));
        }
    }
    return 0;
}

function calculateRankFromPercentile(percentile, totalStudents) {
    const rank = Math.round((100 - percentile) * totalStudents / 100);
    return rank < 1 ? 1 : rank;
}

function getCategoryMultiplier(category) {
    const multipliers = {
        'General': 1.0,
        'EWS': 0.95,
        'OBC-NCL': 0.85,
        'SC': 0.60,
        'ST': 0.45,
        'PwD': 0.40
    };
    return multipliers[category] || 1.0;
}

function getPossibleColleges(rank, category, homeState) {
    // Simplified college data
    const colleges = [
        { name: 'NIT Trichy', genRank: 1500, obcRank: 4500, scRank: 15000, stRank: 25000 },
        { name: 'NIT Surathkal', genRank: 2000, obcRank: 5500, scRank: 18000, stRank: 30000 },
        { name: 'NIT Warangal', genRank: 2500, obcRank: 6500, scRank: 20000, stRank: 35000 },
        { name: 'NIT Rourkela', genRank: 4000, obcRank: 10000, scRank: 25000, stRank: 40000 },
        { name: 'NIT Calicut', genRank: 5000, obcRank: 12000, scRank: 28000, stRank: 45000 },
        { name: 'NIT Allahabad', genRank: 5500, obcRank: 13000, scRank: 30000, stRank: 50000 },
        { name: 'IIIT Hyderabad', genRank: 1200, obcRank: 3500, scRank: 10000, stRank: 20000 },
        { name: 'IIIT Delhi', genRank: 4000, obcRank: 9000, scRank: 22000, stRank: 35000 },
        { name: 'IIIT Bangalore', genRank: 3000, obcRank: 8000, scRank: 18000, stRank: 30000 }
    ];
    
    const matches = [];
    const homeStateColleges = homeStateQuotas[homeState] || [];
    
    colleges.forEach(college => {
        let cutoff;
        switch(category) {
            case 'OBC-NCL': cutoff = college.obcRank; break;
            case 'SC': cutoff = college.scRank; break;
            case 'ST': cutoff = college.stRank; break;
            case 'EWS': cutoff = college.genRank * 1.2; break;
            case 'PwD': cutoff = college.genRank * 1.5; break;
            default: cutoff = college.genRank;
        }
        
        if (rank <= cutoff) {
            const isHomeState = homeStateColleges.includes(college.name);
            matches.push({
                name: college.name,
                chances: rank < cutoff * 0.5 ? 'High' : rank < cutoff * 0.8 ? 'Good' : 'Low',
                isHomeState: isHomeState
            });
        }
    });
    
    return matches.slice(0, 6); // Return top 6
}

function calculatePrediction() {
    const physics = parseFloat(document.getElementById('physics').value) || 0;
    const chemistry = parseFloat(document.getElementById('chemistry').value) || 0;
    const math = parseFloat(document.getElementById('math').value) || 0;
    const totalInput = parseFloat(document.getElementById('totalMarks').value) || 0;
    
    const category = document.getElementById('category').value;
    const homeState = document.getElementById('homeState').value;
    const difficulty = document.getElementById('difficulty').value;
    
    // Calculate total marks
    let totalMarks = totalInput;
    if (totalMarks === 0) {
        totalMarks = physics + chemistry + math;
    }
    
    if (totalMarks === 0) {
        alert('Please enter your marks');
        return;
    }
    
    // Apply difficulty adjustment
    let adjustedMarks = totalMarks;
    if (difficulty === 'easy') adjustedMarks *= 0.95;
    if (difficulty === 'difficult') adjustedMarks *= 1.05;
    
    // Calculate percentile
    const percentile = getPercentileFromMarks(adjustedMarks);
    
    // Calculate ranks
    const totalStudents = 1400000; // 14 lakh expected
    const generalRank = calculateRankFromPercentile(percentile, totalStudents);
    const categoryMultiplier = getCategoryMultiplier(category);
    const categoryRank = Math.round(generalRank * categoryMultiplier);
    
    // Check JEE Advanced eligibility
    const advancedCutoff = advancedCutoffs[category] || advancedCutoffs['General'];
    const isAdvancedEligible = percentile >= advancedCutoff;
    
    // Get college matches
    const colleges = getPossibleColleges(generalRank, category, homeState);
    
    // Display results
    document.getElementById('displayMarks').textContent = totalMarks.toFixed(0);
    document.getElementById('predictedPercentile').textContent = percentile.toFixed(2) + '%ile';
    document.getElementById('predictedRank').textContent = generalRank.toLocaleString();
    document.getElementById('categoryRank').textContent = categoryRank.toLocaleString();
    document.getElementById('categoryLabel').textContent = category;
    
    // Qualifying status
    const statusEl = document.getElementById('qualifyingStatus');
    if (isAdvancedEligible) {
        statusEl.innerHTML = '<span style="color: #22c55e;">✅ Eligible for JEE Advanced</span>';
    } else {
        statusEl.innerHTML = `<span style="color: #ef4444;">❌ Not Eligible (Need ${advancedCutoff}%ile)</span>`;
    }
    
    // Display colleges
    const collegeGrid = document.getElementById('collegeGrid');
    if (colleges.length > 0) {
        collegeGrid.innerHTML = colleges.map(c => `
            <div class="college-card ${c.chances.toLowerCase()}">
                <strong>${c.name}</strong>
                <span>${c.chances} Chances${c.isHomeState ? ' (Home State)' : ''}</span>
            </div>
        `).join('');
    } else {
        collegeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Improve your score for NIT/IIIT options</p>';
    }
    
    // Show results
    document.getElementById('results').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function updateWhatIf(value) {
    document.getElementById('sliderValue').textContent = value;
    
    const percentile = getPercentileFromMarks(parseFloat(value));
    const rank = calculateRankFromPercentile(percentile, 1400000);
    
    document.getElementById('whatifResult').innerHTML = `
        At ${value} marks: ${percentile.toFixed(2)}%ile | Rank ~${rank.toLocaleString()}
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Allow Enter key to calculate
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculatePrediction();
            }
        });
    });
});
