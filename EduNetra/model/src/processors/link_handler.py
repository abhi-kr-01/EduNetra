import yt_dlp
import os

# temp/ folder sits at the model/ root
TEMP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "temp"))
os.makedirs(TEMP_DIR, exist_ok=True)


def get_video_from_url(url: str) -> str:
    """
    Downloads a video from a URL using yt-dlp.
    Saves it to the temp/ directory as an mp4.
    Returns the absolute path of the downloaded file.
    """

    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "merge_output_format": "mp4",
        "noplaylist": True,
        "outtmpl": os.path.join(TEMP_DIR, "%(title)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"[DOWNLOADER] Downloading: {url}")
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)

            # Ensure extension is .mp4
            base = os.path.splitext(filename)[0]
            mp4_path = base + ".mp4"

            if not os.path.exists(mp4_path):
                raise FileNotFoundError(f"Expected file not found: {mp4_path}")

            print(f"[DOWNLOADER] Downloaded to: {mp4_path}")
            return mp4_path

    except yt_dlp.utils.DownloadError as e:
        print(f"[DOWNLOADER ERROR] {e}")
        return None