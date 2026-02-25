/**
 * JEE Mains 2026 Percentile & Rank Predictor
 * Prediction Engine
 */

class JEEPredictor {
    constructor() {
        this.categoryMultipliers = {
            'GEN': 1.0,
            'OBC': 0.55,
            'SC': 0.35,
            'ST': 0.28,
            'EWS': 0.95,
            'PWD': 0.25
        };
        
        this.rankData = null;
        this.nitData = null;
        this.iiitData = null;
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.bindEvents();
    }
    
    async loadData() {
        try {
            const [rankRes, nitRes, iiitRes] = await Promise.all([
                fetch('data/percentile-rank.json'),
                fetch('data/nit-cutoffs.json'),
                fetch('data/iiit-cutoffs.json')
            ]);
            
            this.rankData = await rankRes.json();
            this.nitData = await nitRes.json();
            this.iiitData = await iiitRes.json();
        } catch (error) {
            console.error('Failed to load data:', error);
            this.useFallbackData();
        }
    }
    
    useFallbackData() {
        // Fallback if JSON files fail to load
        this.rankData = {
            '2024': [
                {percentile: 99.99, rank: 1},
                {percentile: 99.9, rank: 50},
                {percentile: 99.5, rank: 500},
                {percentile: 99.0, rank: 2000},
                {percentile: 98.0, rank: 5000},
                {percentile: 95.0, rank: 15000},
                {percentile: 90.0, rank: 35000},
                {percentile: 80.0, rank: 70000},
                {percentile: 70.0, rank: 100000},
                {percentile: 60.0, rank: 130000},
                {percentile: 50.0, rank: 160000},
                {percentile: 40.0, rank: 200000},
                {percentile: 30.0, rank: 250000},
                {percentile: 20.0, rank: 350000},
                {percentile: 10.0, rank: 500000}
            ]
        };
    }
    
    bindEvents() {
        const form = document.getElementById('predictor-form');
        const calculateBtn = document.getElementById('calculate-btn');
        
        calculateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.calculate();
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
        });
    }
    
    validateInput(input) {
        const value = parseFloat(input.value);
        const max = parseFloat(input.max);
        
        if (value > max) {
            input.value = max;
        } else if (value < 0) {
            input.value = 0;
        }
    }
    
    calculate() {
        const physics = parseFloat(document.getElementById('physics-marks').value) || 0;
        const chemistry = parseFloat(document.getElementById('chem-marks').value) || 0;
        const math = parseFloat(document.getElementById('math-marks').value) || 0;
        const category = document.getElementById('category').value;
        const homeState = document.getElementById('home-state').value;
        
        const totalMarks = physics + chemistry + math;
        const maxMarks = 300;
        
        // Calculate percentile using NTA formula approximation
        const percentile = this.calculatePercentile(totalMarks, maxMarks);
        
        // Calculate rank
        const rank = this.calculateRank(percentile);
        const categoryRank = Math.floor(rank * this.categoryMultipliers[category]);
        
        // Display results
        this.displayResults({
            totalMarks,
            maxMarks,
            percentile,
            rank,
            category,
            categoryRank,
            homeState
        });
        
        // Predict colleges
        this.predictColleges(categoryRank, category, homeState);
    }
    
    calculatePercentile(marks, maxMarks) {
        // NTA percentile calculation approximation
        // Based on historical data analysis
        const percentage = (marks / maxMarks) * 100;
        
        // Non-linear mapping based on JEE difficulty
        let percentile;
        
        if (percentage >= 95) {
            // Top 5% - exponential curve
            percentile = 99 + (percentage - 95) * 0.2;
        } else if (percentage >= 80) {
            // 80-95% range
            percentile = 90 + (percentage - 80) * 0.6;
        } else if (percentage >= 60) {
            // 60-80% range
            percentile = 70 + (percentage - 60) * 1.0;
        } else if (percentage >= 40) {
            // 40-60% range
            percentile = 40 + (percentage - 40) * 1.5;
        } else {
            // Below 40%
            percentile = percentage;
        }
        
        return Math.min(99.99, Math.max(0, percentile));
    }
    
    calculateRank(percentile) {
        // Total candidates ~ 12-13 lakhs
        const totalCandidates = 1250000;
        
        // Find closest rank from historical data
        const data = this.rankData['2024'] || this.rankData;
        
        // Interpolate between data points
        for (let i = 0; i < data.length - 1; i++) {
            const current = data[i];
            const next = data[i + 1];
            
            if (percentile <= current.percentile && percentile >= next.percentile) {
                const ratio = (current.percentile - percentile) / (current.percentile - next.percentile);
                return Math.floor(current.rank + ratio * (next.rank - current.rank));
            }
        }
        
        // If above highest data point
        if (percentile > data[0].percentile) {
            const topPercent = 100 - percentile;
            return Math.floor((topPercent / 100) * totalCandidates * 0.5);
        }
        
        // If below lowest data point
        const lastPoint = data[data.length - 1];
        return Math.floor(lastPoint.rank * (100 - percentile) / (100 - lastPoint.percentile));
    }
    
    displayResults(results) {
        const resultsSection = document.getElementById('result-section');
        resultsSection.classList.remove('hidden');
        
        // Animate results
        setTimeout(() => {
            resultsSection.classList.add('visible');
        }, 100);
        
        // Update values
        document.getElementById('total-marks-display').textContent = results.totalMarks.toFixed(0);
        document.getElementById('percentile-display').textContent = results.percentile.toFixed(2);
        document.getElementById('rank-display').textContent = this.formatRank(results.rank);
        document.getElementById('category-rank-display').textContent = this.formatRank(results.categoryRank);
        
        // Update progress bars
        const marksPercent = (results.totalMarks / results.maxMarks) * 100;
        document.getElementById('marks-progress').style.width = `${marksPercent}%`;
        document.getElementById('percentile-progress').style.width = `${results.percentile}%`;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    formatRank(rank) {
        if (rank >= 100000) {
            return (rank / 100000).toFixed(2) + 'L';
        } else if (rank >= 1000) {
            return (rank / 1000).toFixed(1) + 'K';
        }
        return rank.toString();
    }
    
    predictColleges(categoryRank, category, homeState) {
        const collegesList = document.getElementById('college-results');
        if (!collegesList) return;
        collegesList.innerHTML = '';
        
        const predictions = [];
        
        // Check NITs
        if (this.nitData && this.nitData.nits) {
            this.nitData.nits.forEach(nit => {
                const cutoff = this.getCutoffForCategory(nit, category, homeState === nit.state);
                const chance = this.calculateChance(categoryRank, cutoff);
                
                if (chance !== 'none') {
                    predictions.push({
                        name: nit.name,
                        type: 'NIT',
                        location: nit.location,
                        branch: 'Computer Science',
                        closingRank: cutoff,
                        chance: chance
                    });
                }
            });
        }
        
        // Check IIITs
        if (this.iiitData && this.iiitData.iiits) {
            this.iiitData.iiits.forEach(iiit => {
                const cutoff = this.getCutoffForCategory(iiit, category, false);
                const chance = this.calculateChance(categoryRank, cutoff);
                
                if (chance !== 'none') {
                    predictions.push({
                        name: iiit.name,
                        type: 'IIIT',
                        location: iiit.location,
                        branch: 'Computer Science',
                        closingRank: cutoff,
                        chance: chance
                    });
                }
            });
        }
        
        // Sort by chance (safe first)
        const chanceOrder = { 'safe': 0, 'moderate': 1, 'risky': 2 };
        predictions.sort((a, b) => chanceOrder[a.chance] - chanceOrder[b.chance]);
        
        // Display top predictions
        const topPredictions = predictions.slice(0, 8);
        
        if (topPredictions.length === 0) {
            collegesList.innerHTML = `
                <div class="no-colleges">
                    <p>No colleges predicted at this rank. Try improving your score!</p>
                </div>
            `;
            return;
        }
        
        topPredictions.forEach((college, index) => {
            const card = document.createElement('div');
            card.className = `college-card ${college.chance}`;
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="college-header">
                    <div class="college-info">
                        <h4>${college.name}</h4>
                        <span class="college-type">${college.type}</span>
                        <span class="college-location">${college.location}</span>
                    </div>
                    <span class="chance-badge ${college.chance}">
                        ${college.chance.toUpperCase()}
                    </span>
                </div>
                <div class="college-details">
                    <div class="detail">
                        <span class="label">Branch</span>
                        <span class="value">${college.branch}</span>
                    </div>
                    <div class="detail">
                        <span class="label">Closing Rank (${category})</span>
                        <span class="value">${this.formatRank(college.closingRank)}</span>
                    </div>
                </div>
            `;
            
            collegesList.appendChild(card);
        });
    }
    
    getCutoffForCategory(college, category, isHomeState) {
        const categoryKey = category.toLowerCase();
        const cutoff = college.branches[0]?.cutoffs[categoryKey];
        
        if (isHomeState && college.homeStateCutoffs) {
            return college.homeStateCutoffs[categoryKey] || cutoff;
        }
        
        return cutoff || college.branches[0]?.cutoffs['gen'] || 50000;
    }
    
    calculateChance(rank, cutoff) {
        const ratio = rank / cutoff;
        
        if (ratio <= 0.8) return 'safe';
        if (ratio <= 1.2) return 'moderate';
        if (ratio <= 1.5) return 'risky';
        return 'none';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.predictor = new JEEPredictor();
});
