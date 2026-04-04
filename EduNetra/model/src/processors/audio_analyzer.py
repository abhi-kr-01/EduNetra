import os
import numpy as np
import librosa
import soundfile as sf
from config.settings import SAMPLE_RATE, SPEECH_THRESHOLD_DB,N_FFT,HOP_LENGTH


class AudioAnalyzer:
    """
    AudioAnalyzer
    - Minute-level clarity + confidence
    - Fast loading (soundfile)
    - No blocking pitch models
    - Debug-friendly logs
    """

    def __init__(self, audio_path: str, max_duration_sec: int = 300):
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        print("[AUDIO] Loading audio with soundfile...")

        with sf.SoundFile(audio_path) as f:
            y = f.read(dtype="float32")
            sr = f.samplerate

        if y.ndim > 1:
            y = y.mean(axis=1)

        duration = len(y) / sr
        print(f"[AUDIO] Raw duration: {duration:.2f}s @ {sr} Hz")

        # Hard cap (HF-safe)
        if max_duration_sec:
            max_samples = int(sr * max_duration_sec)
            y = y[:max_samples]
            duration = len(y) / sr

        self.y = y
        self.sr = sr
        self.duration = duration

        print(f"[AUDIO] Using native SR: {sr} Hz (NO resampling)")
        print("[AUDIO] Audio ready")

    # --------------------------------------------------
    # CLARITY (FAST, NO PYIN)
    # --------------------------------------------------
    def analyze_clarity(self, y_chunk):
        if len(y_chunk) == 0:
            return 0.0

        duration = len(y_chunk) / self.sr

        non_silent = librosa.effects.split(
            y_chunk,
            top_db=SPEECH_THRESHOLD_DB
        )

        non_silent_duration = sum(
            (e - s) for s, e in non_silent
        ) / self.sr

        pause_ratio = 1 - (non_silent_duration / duration)
        pause_score = 1 - pause_ratio

        flatness = librosa.feature.spectral_flatness(y=y_chunk,
                                                     n_fft=N_FFT,
                                                     hop_length=HOP_LENGTH)[0]
        noise_score = 1 - np.mean(flatness)

        rms = librosa.feature.rms(y=y_chunk)[0]
        energy_score = max(0.0, 1 - np.std(rms) / 0.05)

        score = (
            pause_score * 0.4 +
            noise_score * 0.4 +
            energy_score * 0.2
        ) * 100

        return round(float(np.clip(score, 0, 100)), 2)

    # --------------------------------------------------
    # CONFIDENCE (FAST, NO PYIN)
    # --------------------------------------------------
    def analyze_confidence(self, y_chunk):
        if len(y_chunk) == 0:
            return 0.0

        rms = librosa.feature.rms(y=y_chunk,
                                  frame_length=N_FFT,
                                  hop_length=HOP_LENGTH)[0]

        if len(rms) < 10:
            return 0.0

        loudness_score = min(1.0, np.mean(rms) / 0.08)
        stability_score = max(0.0, 1 - np.std(rms) / 0.05)

        score = (
            loudness_score * 0.6 +
            stability_score * 0.4
        ) * 100

        return round(float(np.clip(score, 0, 100)), 2)

    # --------------------------------------------------
    # FINAL ANALYSIS
    # --------------------------------------------------
    def analyze(self):
        samples_per_min = int(self.sr * 60)
        total_minutes = int(np.ceil(len(self.y) / samples_per_min))

        per_minute = []
        clarity_vals = []
        confidence_vals = []

        print(f"[AUDIO] Total minutes: {total_minutes}")

        for minute in range(total_minutes):
            print(f"[AUDIO] Processing minute {minute + 1}/{total_minutes}")

            start = minute * samples_per_min
            end = (minute + 1) * samples_per_min
            y_chunk = self.y[start:end]

            if len(y_chunk) < self.sr * 5:
                print("[AUDIO] Skipped (too short)")
                continue

            clarity = self.analyze_clarity(y_chunk)
            confidence = self.analyze_confidence(y_chunk)

            per_minute.append({
                "minute": minute,
                "start_sec": minute * 60,
                "end_sec": min((minute + 1) * 60, self.duration),
                "clarity_score": clarity,
                "confidence_score": confidence
            })

            clarity_vals.append(clarity)
            confidence_vals.append(confidence)

        return {
            "per_minute": per_minute,
            "overall": {
                "clarity_score": round(float(np.mean(clarity_vals)), 2) if clarity_vals else 0.0,
                "confidence_score": round(float(np.mean(confidence_vals)), 2) if confidence_vals else 0.0
            }
        }
