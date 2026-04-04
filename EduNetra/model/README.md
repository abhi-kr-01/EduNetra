# 🎓 ShikshaNetra Model

AI pipeline for teaching session videos: extract, analyze, and get coach feedback.

Live Space: https://huggingface.co/spaces/genathon00/sikshanetra-model

Badges:
- ![HF Space](https://img.shields.io/badge/Hugging%20Face-Space-blue?logo=huggingface)
- ![Python](https://img.shields.io/badge/Python-3.8–3.10-informational)
- ![ffmpeg](https://img.shields.io/badge/ffmpeg-required-orange)

---

## ⚡ Quick Start

Windows (cmd.exe):
```bat
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set GEMINI_API_KEY=YOUR_KEY
python app.py
```

macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY=YOUR_KEY
python app.py
```

Requirements:
- Python >=3.8 and <3.11
- System packages: ffmpeg, libgl1, libglib2.0-0 (see `packages.txt`)

---

## 🔧 What It Does
- Extracts audio, samples video frames, transcribes with Whisper.
- Computes scores: audio clarity/confidence, video engagement/gestures, text technical depth/interaction.
- Generates coach feedback using Gemini (summary, strengths, weaknesses, titles, hashtags, multilingual).

---

## 🗂️ Structure
- `app.py` — Gradio UI interface.
- `config/settings.py` — Model and processing constants.
- `src/pipeline.py` — Orchestrates full analysis.
- `src/processors/` — Audio / Video / Text analyzers.
- `src/genai/coach.py` — Gemini coach report.
- `requirements.txt` — Python deps.
- `packages.txt` — OS packages.

---

## 🧬 Pipeline (Short)
1. Input: video file
2. Audio: extract → clarity+confidence
3. Video: frames → engagement+gesture index
4. Text: Whisper → technical depth+interaction
5. GenAI: scores+transcript → coach feedback
6. Output: consolidated JSON report

---

## 🌐 Use as API (Hugging Face Space)

Python:
```bash
pip install gradio-client
```
```python
from gradio_client import Client
client = Client("https://huggingface.co/spaces/genathon00/sikshanetra-model")
result = client.predict("/analyze",
{
    video="/path/to/session.mp4"
})
print(result[3])  # JSON report
```

curl:
```bash
curl -X POST \
  -F "data=@/path/to/session.mp4" \
  https://huggingface.co/spaces/genathon00/sikshanetra-model/api/predict/
```

Notes:
- JSON is the 4th output of the Gradio interface.
- For private Spaces, include auth token per HF docs.