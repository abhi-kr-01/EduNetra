import os
import uuid
import json
import time
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from src.processors.audio_analyzer import AudioAnalyzer
from src.processors.video_analyzer import VideoAnalyzer
from src.processors.text_analyzer import TextAnalyzer
import whisper

WHISPER_MODEL = None
AUDIO_CACHE_DIR = os.path.abspath("audio_cache")
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)

def extract_audio(video_path):
    audio_filename = f"{uuid.uuid4().hex}.wav"
    audio_path = os.path.join(AUDIO_CACHE_DIR, audio_filename)

    print(f"[AUDIO] Extracting to {audio_path}")

    video = VideoFileClip(video_path)
    video.audio.write_audiofile(
        audio_path,
        verbose=False,
        logger=None
    )
    video.close()

    # 🔒 HARD GUARANTEE
    if not os.path.exists(audio_path):
        raise RuntimeError("Audio extraction failed: file not created")

    return audio_path

def transcribe_audio(audio_path):
    global WHISPER_MODEL

    if WHISPER_MODEL is None:
        print("[WHISPER] Loading model (one-time)...")
        WHISPER_MODEL = whisper.load_model("base")

    result = WHISPER_MODEL.transcribe(audio_path, fp16=False)
    return result["text"].strip()


# -----------------------------
# MAIN PIPELINE
# -----------------------------
def process_session(video_path, topic_name="Machine Learning"):
    print("🚨 process_session CALLED")
    if not os.path.exists(video_path):
        print(f"Video not found: {video_path}")
        return None

    start_time = time.time()
    audio_path = extract_audio(video_path)
    if not audio_path:
        return None

    try:
        print("[PIPELINE] Step 1: Audio analysis")
        audio_results = AudioAnalyzer(audio_path).analyze()
        print("[PIPELINE] Step 1 DONE")

        print("[PIPELINE] Step 2: Video analysis")
        video_analyzer = VideoAnalyzer(video_path)
        video_results = video_analyzer.process_video()
        print("[PIPELINE] Step 2 DONE")

        print("[PIPELINE] Step 3: Whisper load")
        transcript = transcribe_audio(audio_path)
        print("[PIPELINE] Step 3 DONE")

        print("[PIPELINE] Step 4: Text analysis")
        text_results = TextAnalyzer(transcript).analyze(topic=topic_name)
        print("[PIPELINE] Step 4 DONE")


        return {
            "session_id": os.path.basename(video_path),
            "topic": topic_name,
            "transcript": transcript,
            "scores": {
                "audio": audio_results,
                "video": video_results,
                "text": text_results
            },
            "metadata": {
                "processing_time_sec": round(time.time() - start_time, 2)
            }
        }

    except Exception as e:
        print(f"Pipeline error: {e}")
        return None
    
    finally:
        # 🔥 GUARANTEED cleanup
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                print(f"[CLEANUP] Deleted audio file: {audio_path}")
            except Exception as e:
                print(f"[CLEANUP] Failed to delete audio file: {e}")

if __name__ == "__main__":
    # Create a dummy video for testing if it doesn't exist
    import cv2
    import numpy as np
    
    test_video = "pipeline_test_video.mp4"
    if not os.path.exists(test_video):
        print("Creating dummy video for testing...")
        width, height = 640, 480
        fps = 30
        duration = 5 # seconds
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(test_video, fourcc, fps, (width, height))
        
        # Create frames with some movement to simulate gestures/video
        for i in range(int(duration * fps)):
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            # Moving circle
            x = int(320 + 100 * np.sin(i * 0.1))
            y = int(240 + 50 * np.cos(i * 0.1))
            cv2.circle(frame, (x, y), 50, (255, 255, 255), -1)
            out.write(frame)
        out.release()
        
        # Add dummy audio to the video using moviepy (since cv2 doesn't write audio easily)
        # We'll just let the pipeline fail gracefully on audio extraction or 
        # we can create a separate audio file and merge it, but for simplicity
        # let's just create a dummy wav file and use that if extraction fails?
        # Actually, extract_audio will fail if video has no audio track.
        # Let's create a dummy audio file separately and tell extract_audio to use it?
        # No, let's just create a dummy wav file and use moviepy to combine them.
        
        from moviepy.editor import AudioFileClip
        import soundfile as sf
        
        # Create dummy audio
        dummy_audio_path = "dummy_source_audio.wav"
        sr = 22050
        t = np.linspace(0, duration, int(sr * duration))
        audio = 0.5 * np.sin(2 * np.pi * 440 * t)
        sf.write(dummy_audio_path, audio, sr)
        
        # Merge
        video_clip = VideoFileClip(test_video)
        audio_clip = AudioFileClip(dummy_audio_path)
        final_clip = video_clip.set_audio(audio_clip)
        final_clip.write_videofile("pipeline_test_video_with_audio.mp4", verbose=False, logger=None, audio_codec='aac')
        
        # Cleanup
        video_clip.close()
        audio_clip.close()
        final_clip.close()
        os.remove(test_video)
        os.remove(dummy_audio_path)
        test_video = "pipeline_test_video_with_audio.mp4"

    # Run Pipeline
    report = process_session(test_video)
    
    if report:
        print("\nFinal Report JSON:")
        print(json.dumps(report, indent=2))
        
    # Cleanup test video
    if os.path.exists(test_video):
        os.remove(test_video)
