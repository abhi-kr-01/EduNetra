import cv2
import numpy as np
import os
import logging
from collections import deque, Counter
from transformers import pipeline
from PIL import Image
from config.settings import FRAME_EXTRACTION_RATE

logger = logging.getLogger(__name__)


class VideoAnalyzer:
    """
    OpenCV-based VideoAnalyzer

    Metrics:
    - engagement_score (face presence & size)
    - gesture_index (motion energy)
    - dominant_emotion (mode)
    - confidence_score (signal availability)

    Output:
    - per_minute metrics
    - overall aggregated metrics
    """

    def __init__(self, video_path: str):
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        self.video_path = video_path
        logger.info("[VIDEO] Initializing VideoAnalyzer")

        # ---------------- Face Detection ----------------
        try:
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            if self.face_cascade.empty():
                logger.warning("[VIDEO] Haar cascade failed to load")
                self.face_cascade = None
        except Exception as e:
            logger.warning(f"[VIDEO] Face cascade error: {e}")
            self.face_cascade = None

        # ---------------- Emotion Model (Optional) ----------------
        self.enable_emotion = os.getenv("ENABLE_EMOTION", "false").lower() in ("1", "true")

        if self.enable_emotion:
            try:
                self.emotion_classifier = pipeline(
                    "image-classification",
                    model="dima806/facial_emotions_image_detection",
                    top_k=1
                )
            except Exception as e:
                logger.warning(f"[VIDEO] Emotion model unavailable: {e}")
                self.emotion_classifier = None
        else:
            self.emotion_classifier = None

        self.emotion_window = deque(maxlen=5)

    # --------------------------------------------------
    # Engagement (face presence proxy)
    # --------------------------------------------------
    def analyze_engagement(self, frame):
        if self.face_cascade is None:
            return 0.0, False

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 5, minSize=(30, 30))

        if len(faces) == 0:
            return 0.0, False

        h, w = frame.shape[:2]
        largest = max(faces, key=lambda r: r[2] * r[3])
        area_ratio = (largest[2] * largest[3]) / (w * h)

        # Adjusted logic:
        # Base score 0.3 just for having a face
        # Multiplier increased to 10.0 (so ~7% screen coverage gives 100%)
        engagement = min(1.0, 0.3 + (area_ratio * 10.0))
        return float(engagement), True

    # --------------------------------------------------
    # Emotion (optional)
    # --------------------------------------------------
    def analyze_emotion(self, frame):
        if self.emotion_classifier is None:
            return "neutral"

        try:
            pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            pred = self.emotion_classifier(pil)
            return pred[0]["label"] if pred else "neutral"
        except Exception:
            return "neutral"

    # --------------------------------------------------
    # Main Processing
    # --------------------------------------------------
    def process_video(self):
        cap = cv2.VideoCapture(self.video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frames_per_minute = int(fps * 60)

        frame_count = 0
        prev_gray = None

        # Minute-level accumulators
        per_minute = []
        current = self._new_minute_bucket()

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            frame_count += 1
            if frame_count % FRAME_EXTRACTION_RATE != 0:
                continue

            minute_idx = int(frame_count / frames_per_minute)

            # New minute → flush
            if minute_idx > current["minute"]:
                per_minute.append(self._finalize_minute(current))
                current = self._new_minute_bucket(minute_idx)

            current["frames"] += 1

            # ---------------- Engagement ----------------
            engagement, face_found = self.analyze_engagement(frame)
            current["engagement_sum"] += engagement
            if face_found:
                current["face_detected"] += 1

            # ---------------- Motion / Gesture ----------------
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if prev_gray is not None:
                diff = cv2.absdiff(prev_gray, gray)
                _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
                motion_ratio = cv2.countNonZero(thresh) / thresh.size
                current["gesture_energy"] += motion_ratio
                if motion_ratio > 0.001:
                    current["motion_detected"] += 1

            prev_gray = gray

            # ---------------- Emotion (Sparse) ----------------
            if self.enable_emotion and current["frames"] % 5 == 0:
                emotion = self.analyze_emotion(frame)
                self.emotion_window.append(emotion)
                smooth = Counter(self.emotion_window).most_common(1)[0][0]
                current["emotion_counts"][smooth] += 1

        cap.release()

        if current["frames"] > 0:
            per_minute.append(self._finalize_minute(current))

        return {
            "per_minute": per_minute,
            "overall": self._aggregate_overall(per_minute)
        }

    # --------------------------------------------------
    # Helpers
    # --------------------------------------------------
    def _new_minute_bucket(self, minute=0):
        return {
            "minute": minute,
            "frames": 0,
            "engagement_sum": 0.0,
            "gesture_energy": 0.0,
            "face_detected": 0,
            "motion_detected": 0,
            "emotion_counts": Counter()
        }

    def _finalize_minute(self, m):
        if m["frames"] == 0:
            return None

        dominant_emotion = (
            m["emotion_counts"].most_common(1)[0][0]
            if m["emotion_counts"]
            else "neutral"
        )

        return {
            "minute": m["minute"],
            "engagement_score": round((m["engagement_sum"] / m["frames"]) * 100, 2),
            "gesture_index": round((m["gesture_energy"] / m["frames"]) * 100, 2),
            "dominant_emotion": dominant_emotion,
            "confidence_score": round(
                (
                    0.6 * (m["face_detected"] / m["frames"]) +
                    0.4 * (m["motion_detected"] / m["frames"])
                ) * 100,
                2
            )
        }

    def _aggregate_overall(self, per_minute):
        if not per_minute:
            return {
                "engagement_score": 0.0,
                "gesture_index": 0.0,
                "dominant_emotion": "neutral",
                "confidence_score": 0.0
            }

        engagement = [m["engagement_score"] for m in per_minute]
        gesture = [m["gesture_index"] for m in per_minute]
        confidence = [m["confidence_score"] for m in per_minute]
        emotions = [m["dominant_emotion"] for m in per_minute]

        return {
            "engagement_score": round(float(np.mean(engagement)), 2),
            "gesture_index": round(float(np.mean(gesture)), 2),
            "confidence_score": round(float(np.mean(confidence)), 2),
            "dominant_emotion": Counter(emotions).most_common(1)[0][0]
        }
