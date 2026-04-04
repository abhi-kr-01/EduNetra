#  EduNetra ML Pipeline

**EduNetra** is an AI-powered pedagogical coaching system designed to analyze teaching sessions and provide actionable feedback to educators. It leverages multi-modal analysis (Audio, Video, Text) and Generative AI to evaluate teaching performance.

## 🚀 Features

### 1. Audio Analysis (`src/processors/audio_analyzer.py`)
-   **Clarity Score**: Analyzes speech pauses and silence to determine clarity.
-   **Confidence Score**: Evaluates voice modulation and loudness.
-   **Feature Extraction**: Extracts MFCCs (Mel-frequency cepstral coefficients) for advanced modeling.

### 2. Video Analysis (`src/processors/video_analyzer.py`)
-   **Engagement Score**: Tracks head pose and eye contact to measure audience engagement.
-   **Gesture Index**: Analyzes hand and wrist movements to quantify expressiveness.
-   **Emotion Detection**: Identifies dominant emotions during the session.

### 3. Text Analysis (`src/processors/text_analyzer.py`)
-   **Technical Depth**: Measures semantic similarity between the transcript and the topic.
-   **Interaction Index**: Quantifies audience interaction based on questions and inclusive pronouns.
-   **Topic Relevance**: Checks for the presence and density of key technical terms.

### 4. Generative AI Coach (`src/genai/coach.py`)
Powered by Google's Gemini Pro, the coach provides:
-   **Performance Summary**: Executive summary of the session.
-   **Teaching Style**: Classification (e.g., Authoritative, Facilitator) with explanation.
-   **Strengths & Weaknesses**: Data-driven insights.
-   **Factual Accuracy Audit**: Checks for technical errors in the transcript.
-   **Content Metadata**: Generates catchy titles and hashtags.
-   **Multilingual Support**: Translates summaries for non-English sessions.
-   **Conversational Interface**: RAG-based chat for follow-up coaching.

## 📂 Project Structure

```
edunetra-ml/
├── config/                 # Configuration settings
│   └── settings.py
├── src/
│   ├── genai/              # Generative AI Logic
│   │   └── coach.py        # EduCoach Class
│   ├── processors/         # Signal Processing Modules
│   │   ├── audio_analyzer.py
│   │   ├── text_analyzer.py
│   │   └── video_analyzer.py
│   └── pipeline.py         # Main Orchestration Pipeline
├── tests/                  # Unit Tests
│   └── test_genai_layer.py
├── main.py                 # Entry Point
├── requirements.txt        # Dependencies
└── README.md               # Documentation
```

## 🛠️ Setup & Installation

### Prerequisites
-   Python 3.8+
-   FFmpeg (required for `moviepy` and audio extraction)

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Configuration
1.  **API Keys**: Set your Google Gemini API key in your environment variables.
    ```bash
    # Windows (PowerShell)
    $env:GEMINI_API_KEY="your_api_key_here"
    ```
2.  **Settings**: Adjust parameters in `config/settings.py` (e.g., `SAMPLE_RATE`, `LLM_MODEL_NAME`).

## ▶️ Usage

### Running the Frontend (Streamlit)
To launch the interactive web interface:
```bash
streamlit run app.py
```

### Running the Pipeline (CLI)
To analyze a video session via command line, run the main pipeline. You can modify `main.py` to point to your video file.

```bash
python main.py
```
*Note: The current default setup runs a test on a synthesized dummy video.*

### Running Tests
To verify the Generative AI layer:
```bash
python -m tests.test_genai_layer
```

To run the full pipeline integration test:
```bash
python -m src.pipeline
```

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Push to the branch.
5.  Create a Pull Request.
# EduNetra-model
# EduNetra-model
