import gradio as gr
import os
from src.pipeline import process_session

def analyze_session(video, topic, api_key):
    if not video:
        return "Please upload a video.", "", "", None
    
    # Handle API Key
    if api_key:
        os.environ["GEMINI_API_KEY"] = api_key
    
    if "GEMINI_API_KEY" not in os.environ:
         return "Gemini API Key is required. Please enter it in the input field.", "", "", None

    try:
        # In Gradio, video input with default type returns a filepath
        video_path = video

        # Run pipeline
        # Note: Depending on Gradio version/config, this might block. 
        # For a generator behavior, we can't easily yield partial updates unless pipeline supports it.
        # We'll just wait for the result.
        
        report = process_session(video_path, topic_name=topic or "General")
        
        if not report:
            return "Analysis failed. Please check logs.", "", "", None

        # Prepare outputs
        # 1. Summary
        summary_md = "## Performance Summary\n"
        if "coach_feedback" in report and "performance_summary" in report["coach_feedback"]:
            summary_md += report["coach_feedback"]["performance_summary"] + "\n\n"
            
            style = report["coach_feedback"].get("teaching_style", {})
            if isinstance(style, dict):
                summary_md += f"### Teaching Style: {style.get('style', 'Unknown')}\n{style.get('explanation', '')}"
            else:
                summary_md += f"### Teaching Style\n{str(style)}"
        else:
             summary_md += "Coach feedback not available (Check API Key)."
             
        # 2. Detailed Scores
        scores = report.get("scores", {})
        scores_md = "## Detailed Scores\n"
        scores_md += f"- **Audio Clarity**: {scores.get('audio', {}).get('clarity_score', 0)}\n"
        scores_md += f"- **Audio Confidence**: {scores.get('audio', {}).get('confidence_score', 0)}\n"
        scores_md += f"- **Video Engagement**: {scores.get('video', {}).get('engagement_score', 0)}\n"
        scores_md += f"- **Gesture Index**: {scores.get('video', {}).get('gesture_index', 0)}\n"
        scores_md += f"- **Technical Depth**: {scores.get('text', {}).get('technical_depth', 0)}\n"
        scores_md += f"- **Interaction Index**: {scores.get('text', {}).get('interaction_index', 0)}\n"

        # 3. Coach Feedback
        feedback_md = "## Coach Feedback\n"
        if "coach_feedback" in report:
            fb = report["coach_feedback"]
            
            feedback_md += "### ✅ Strengths\n"
            for s in fb.get("strengths", []):
                feedback_md += f"- {s}\n"
            
            feedback_md += "\n### ⚠️ Areas for Improvement\n"
            for w in fb.get("weaknesses", []):
                feedback_md += f"- {w}\n"
                
            feedback_md += "\n### Titles & Hashtags\n"
            meta = fb.get("content_metadata", {})
            feedback_md += "**Titles:**\n"
            for t in meta.get("titles", []):
                feedback_md += f"- {t}\n"
            feedback_md += "\n**Hashtags:** " + " ".join(meta.get("hashtags", []))

        # 4. Raw JSON
        return summary_md, scores_md, feedback_md, report

    except Exception as e:
        return f"An error occurred: {str(e)}", "", "", None

# Define Interface
with gr.Blocks(title="Shiksha Netra - AI Pedagogical Coach") as demo:
    gr.Markdown("# 🎓 Shiksha Netra - AI Pedagogical Coach")
    gr.Markdown("Upload a teaching session video to get comprehensive AI feedback.")
    
    with gr.Row():
        with gr.Column():
            video_input = gr.Video(label="Upload Teaching Session", sources=["upload"])
            topic_input = gr.Textbox(label="Session Topic", value="General")
            api_key_input = gr.Textbox(label="Gemini API Key", type="password", placeholder="Enter your Gemini API Key if not set in environment")
            analyze_btn = gr.Button("Analyze Session", variant="primary")
        
    with gr.Tabs():
        with gr.TabItem("Summary"):
            summary_output = gr.Markdown()
        with gr.TabItem("Detailed Scores"):
            scores_output = gr.Markdown()
        with gr.TabItem("Coach Feedback"):
            feedback_output = gr.Markdown()
        with gr.TabItem("Raw Data"):
            json_output = gr.JSON()

    analyze_btn.click(
        analyze_session,
        inputs=[video_input, topic_input, api_key_input],
        outputs=[summary_output, scores_output, feedback_output, json_output]
    )

if __name__ == "__main__":
    demo.launch()
