# 🎓 JEE Mains Predictor
**Live demo:** https://sugamdeol.github.io/jee-predictor/


**JEE Mains 2026 percentile & rank predictor** — enter your expected marks, get your predicted percentile and rank, and check NIT/IIIT admission chances against real cutoff data.

## ✨ Features

- 📈 Marks → percentile prediction (based on 2024/2025 trends)
- 🏅 Percentile → rank estimation
- 🏫 NIT cutoff analysis across branches and categories
- 🎯 IIIT cutoff analysis
- 📊 Interactive percentile charts
- 📱 Fully client-side — no server needed

## 🛠️ Tech Stack

- **Vanilla JavaScript** · HTML · CSS
- **JSON datasets:** `data/percentile-rank.json`, `data/nit-cutoffs.json`, `data/iiit-cutoffs.json`, `data/cutoffs.json`

## 🚀 Getting Started

```bash
git clone https://github.com/Sugamdeol/jee-predictor.git
cd jee-predictor
python -m http.server 8080
```

Open `http://localhost:8080`, enter your marks, and predict your rank.

## 📁 Project Structure

```
├── index.html          # Main app
├── js/predictor.js     # Prediction engine
└── data/               # Cutoff & percentile datasets
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Built with ❤️ by [Sugam Deol](https://github.com/Sugamdeol)
