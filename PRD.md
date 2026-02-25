# 🎯 JEE Mains 2026 Percentile & Rank Predictor - PRD

## 1. Project Overview

### Product Name
JEE Mains 2026 Rank Predictor

### Tagline
"Know where you stand before NTA announces"

### Purpose
A web-based tool that predicts JEE Mains 2026 percentile and All India Rank (AIR) based on:
- Raw marks scored
- Session/shift difficulty (normalized)
- Category
- Historical data correlation

## 2. Research Summary

### 2.1 Exam Pattern (JEE Mains 2026)
- **Subjects**: Physics, Chemistry, Mathematics
- **Total Questions**: 90 (30 per subject)
- **Question Distribution per Subject**:
  - Section A: 20 MCQs (4 marks each) = 80 marks
  - Section B: 10 Numerical (attempt any 5, 4 marks each) = 20 marks
  - Per subject total: 100 marks
- **Total Marks**: 300
- **Marking Scheme**:
  - Correct: +4 marks
  - Wrong MCQ: -1 mark (negative marking)
  - Wrong Numerical/Unattempted: 0 marks
  - Maximum marks per subject: 100

### 2.2 Percentile Calculation Methodology
**Formula Used by NTA**:
```
Percentile = (Number of candidates scored ≤ Your Score / Total candidates in session) × 100
```

**Key Points**:
- Session-wise percentile calculation (not overall)
- Normalization across multiple shifts
- Percentile is relative to your session only
- Toppers in each session get 100 percentile

### 2.3 Normalization Process
- Multiple shifts have different difficulty levels
- NTA uses percentile equivalence to normalize
- Raw marks vary, but percentile remains comparable across shifts
- Final merit list based on normalized percentiles

### 2.4 Historical Rank vs Percentile Data

| Percentile | Approximate Rank (2024) | Approximate Marks |
|------------|------------------------|-------------------|
| 100.00 | 1 | 285-300 |
| 99.99 | 10-50 | 275-285 |
| 99.95 | 100-500 | 260-275 |
| 99.90 | 500-1000 | 250-260 |
| 99.50 | 5,000-6,000 | 220-230 |
| 99.00 | 10,000-12,000 | 200-210 |
| 95.00 | 50,000-55,000 | 160-170 |
| 90.00 | 1,00,000-1,10,000 | 140-150 |
| 80.00 | 2,00,000+ | 110-120 |
| 70.00 | 3,50,000+ | 90-100 |
| 60.00 | 5,00,000+ | 75-85 |

**Total Candidates (Approximate)**:
- 2024: ~12 lakh candidates
- 2025: ~13 lakh candidates (expected)
- 2026: ~13-14 lakh candidates (projected)

### 2.5 Category-wise Cutoff Trends (2024)

| Category | Qualifying Percentile |
|----------|----------------------|
| General | 90.77 |
| EWS | 87.08 |
| OBC-NCL | 72.02 |
| SC | 52.50 |
| ST | 44.33 |
| PwD | 0.0018 |

### 2.6 Session-wise Considerations
- January session: Usually more competitive
- April session: Slightly easier to score (repeat candidates)
- Multiple shifts per session (typically 2-3 per day)
- Shift difficulty varies (some shifts have tougher papers)

## 3. Feature Requirements

### Core Features

#### 3.1 Marks Input Module
- **Subject-wise marks entry**:
  - Physics: MCQ marks + Numerical marks
  - Chemistry: MCQ marks + Numerical marks
  - Mathematics: MCQ marks + Numerical marks
- **Quick total marks input** (for users who already calculated)
- **Auto-calculate** button for subject-wise breakdown
- **Validation**: Check if marks exceed 300 or are negative

#### 3.2 Session & Category Selection
- **Session selection**:
  - January 2026
  - April 2026
- **Shift difficulty rating** (user perception):
  - Very Easy
  - Easy
  - Moderate (default)
  - Difficult
  - Very Difficult
- **Category selection**:
  - General
  - EWS
  - OBC-NCL
  - SC
  - ST
  - PwD

#### 3.3 Prediction Engine

**Algorithm**:
```python
def predict_rank(marks, session, shift_difficulty, category):
    # Step 1: Adjust marks based on shift difficulty
    difficulty_multiplier = {
        'Very Easy': 0.95,
        'Easy': 0.97,
        'Moderate': 1.0,
        'Difficult': 1.03,
        'Very Difficult': 1.05
    }
    
    adjusted_marks = marks * difficulty_multiplier[shift_difficulty]
    
    # Step 2: Calculate percentile based on historical correlation
    # Using polynomial regression on historical data
    percentile = calculate_percentile_from_marks(adjusted_marks)
    
    # Step 3: Convert percentile to rank
    total_candidates = 1300000  # 13 lakh (2026 projected)
    rank = (100 - percentile) / 100 * total_candidates
    
    # Step 4: Category-wise adjustment
    category_multipliers = {
        'General': 1.0,
        'EWS': 0.95,
        'OBC-NCL': 0.70,
        'SC': 0.50,
        'ST': 0.40,
        'PwD': 0.01
    }
    
    category_rank = rank * category_multipliers[category]
    
    return {
        'percentile': round(percentile, 2),
        'overall_rank': int(rank),
        'category_rank': int(category_rank),
        'qualifying_status': percentile >= cutoff[category]
    }
```

**Percentile Calculation Formula** (Marks to Percentile):
Based on historical data curve fitting:
```
For marks ≥ 280: percentile = 100
For marks 200-280: percentile = 99 + (marks - 200) / 80 * 1
For marks 150-200: percentile = 95 + (marks - 150) / 50 * 4
For marks 100-150: percentile = 85 + (marks - 100) / 50 * 10
For marks 50-100: percentile = 60 + (marks - 50) / 50 * 25
For marks < 50: percentile = marks / 50 * 60
```

#### 3.4 Results Display
- **Predicted Percentile** (with confidence range)
- **Expected All India Rank** (AIR)
- **Category Rank** (CR)
- **Qualifying Status** for JEE Advanced
- **College Predictor** (NIT/IIIT/CFTI chances)
- **Comparison with Previous Years**

#### 3.5 College Predictor Module
Based on rank, predict chances in:
- **NITs**: Top 10, Next 15, Other NITs
- **IIITs**: IIIT Hyderabad, IIIT Bangalore, Other IIITs
- **GFTIs**: Based on closing ranks 2024
- **Category-wise cutoffs** for each institute

### Additional Features

#### 3.6 What-If Analysis
- Slider to adjust marks and see real-time rank changes
- "How many marks for target rank" calculator
- Subject-wise improvement impact analysis

#### 3.7 Historical Data Viewer
- Graph: Marks vs Percentile (2023, 2024, 2025 trends)
- Graph: Rank distribution by category
- Session-wise difficulty comparison

#### 3.8 Save & Share
- Save prediction results as PDF
- Share on social media (WhatsApp, Telegram, Instagram)
- Copy results to clipboard

## 4. Technical Architecture

### Tech Stack
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript
- **Charts**: Chart.js for data visualization
- **Math Engine**: Custom JavaScript calculation engine
- **Export**: html2canvas + jsPDF for PDF generation
- **Hosting**: GitHub Pages (static site)

### File Structure
```
jee-predictor/
├── index.html              # Main application
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── predictor.js        # Core prediction algorithm
│   ├── charts.js           # Chart rendering
│   ├── college-data.js     # College cutoff database
│   └── ui.js               # UI interactions
├── data/
│   ├── historical-data.json # 2023, 2024, 2025 data
│   └── college-cutoffs.json # NIT/IIIT cutoffs
├── assets/
│   ├── logo.png
│   └── icons/
└── README.md
```

### Algorithm Implementation

#### Percentile Calculator
```javascript
function calculatePercentile(marks) {
    if (marks >= 280) return 100.00;
    if (marks >= 250) return 99.90 + (marks - 250) / 30 * 0.10;
    if (marks >= 220) return 99.50 + (marks - 220) / 30 * 0.40;
    if (marks >= 200) return 99.00 + (marks - 200) / 20 * 0.50;
    if (marks >= 180) return 97.00 + (marks - 180) / 20 * 2.00;
    if (marks >= 160) return 95.00 + (marks - 160) / 20 * 2.00;
    if (marks >= 140) return 90.00 + (marks - 140) / 20 * 5.00;
    if (marks >= 120) return 85.00 + (marks - 120) / 20 * 5.00;
    if (marks >= 100) return 80.00 + (marks - 100) / 20 * 5.00;
    if (marks >= 80) return 70.00 + (marks - 80) / 20 * 10.00;
    if (marks >= 60) return 60.00 + (marks - 60) / 20 * 10.00;
    if (marks >= 40) return 45.00 + (marks - 40) / 20 * 15.00;
    return (marks / 40) * 45.00;
}
```

#### Rank Calculator
```javascript
function calculateRank(percentile, category) {
    const totalCandidates = 1300000; // 13 lakh
    const categoryDistribution = {
        'General': 0.50,
        'EWS': 0.10,
        'OBC-NCL': 0.27,
        'SC': 0.15,
        'ST': 0.075,
        'PwD': 0.005
    };
    
    // Overall rank
    const overallRank = Math.round((100 - percentile) / 100 * totalCandidates);
    
    // Category rank (approximate)
    const categoryRank = Math.round(overallRank * categoryDistribution[category]);
    
    return { overallRank, categoryRank };
}
```

## 5. UI/UX Design

### Layout Structure
1. **Hero Section**: Title, tagline, JEE 2026 branding
2. **Input Section**: Subject-wise marks, session, category
3. **Calculate Button**: Prominent CTA
4. **Results Section**: Cards showing percentile, ranks, qualifying status
5. **College Predictor**: Visual grid of college chances
6. **Charts Section**: Historical comparison graphs
7. **Analysis Section**: What-if scenarios, subject-wise breakdown
8. **Share Section**: Save PDF, share options

### Color Scheme
- Primary: #1e40af (Blue - trust, education)
- Secondary: #f59e0b (Amber - energy, JEE branding)
- Success: #10b981 (Green - qualifying)
- Danger: #ef4444 (Red - not qualifying)
- Background: #f8fafc (Light slate)
- Cards: #ffffff (White)

### Responsive Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

## 6. Data Requirements

### Historical Data to Embed
```json
{
  "jee2024": {
    "total_candidates": 1200000,
    "max_marks": 300,
    "toppers_marks": 299,
    "100_percentile_marks": 285,
    "99.9_percentile_marks": 260,
    "99_percentile_marks": 220,
    "95_percentile_marks": 175,
    "90_percentile_marks": 150,
    "cutoffs": {
      "General": 90.77,
      "EWS": 87.08,
      "OBC-NCL": 72.02,
      "SC": 52.50,
      "ST": 44.33,
      "PwD": 0.0018
    }
  }
}
```

### College Cutoff Data
```json
{
  "nits": [
    {
      "name": "NIT Trichy",
      "closing_rank_general": 1000,
      "closing_rank_obc": 2500,
      "closing_rank_sc": 8000,
      "closing_rank_st": 12000
    }
  ]
}
```

## 7. Success Metrics

### Accuracy Targets
- Percentile prediction: ±0.5% accuracy
- Rank prediction: ±1000 ranks for top 10000, ±5% for others
- Qualifying status: 95%+ accuracy

### User Experience
- Page load time: < 3 seconds
- Calculation time: < 1 second
- Mobile-friendly score: > 90

## 8. Future Enhancements

- Integration with actual JEE results for calibration
- User account system to track progress
- Mock test analysis integration
- Personalized study recommendations based on predicted rank
- WhatsApp/Telegram bot version

## 9. Development Phases

### Phase 1: Core Predictor (MVP)
- Basic marks input
- Percentile calculation
- Rank prediction
- Category-wise results

### Phase 2: Enhanced Features
- College predictor
- Historical charts
- What-if analysis
- PDF export

### Phase 3: Advanced Features
- Subject-wise analysis
- Session difficulty adjustment
- Social sharing
- Mobile app version

## 10. Deployment Plan

- Host on GitHub Pages
- Custom domain: jeerank2026.vercel.app (or similar)
- SEO optimization for "JEE Mains 2026 rank predictor"
- Social media promotion
- Telegram/WhatsApp share integration
