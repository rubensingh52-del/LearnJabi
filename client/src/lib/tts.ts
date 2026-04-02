// ─── Google Cloud Text-to-Speech ────────────────────────────────────────────
// Replace REPLACE_WITH_YOUR_GOOGLE_TTS_API_KEY below with your real key.
// In production set it as an environment variable: VITE_GOOGLE_TTS_API_KEY
// and access it via import.meta.env.VITE_GOOGLE_TTS_API_KEY

const GOOGLE_TTS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_TTS_API_KEY ||
  "REPLACE_WITH_YOUR_GOOGLE_TTS_API_KEY";

const TTS_ENDPOINT =
  `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;

// Cache synthesized audio so we don't hit the API twice for the same word
const audioCache = new Map<string, string>();

/**
 * Cleans input text before sending to TTS.
 * Strips ___ blank placeholders (replaces with a 2-second silence gap via SSML,
 * or removes them when using plain text mode).
 */
function cleanForTTS(text: string): string {
  // Remove ___ sequences (and surrounding whitespace) — they'd be read as "underscore"
  return text.replace(/\s*_{2,}\s*/g, " ").trim();
}

/**
 * Speaks Punjabi text using Google Cloud TTS (pa-IN, Wavenet-A).
 * Falls back to the browser Web Speech API if the key is not set or the
 * request fails.
 */
export async function speakPunjabi(
  gurmukhi: string,
  romanized: string
): Promise<void> {
  // Clean underscores from both strings before use
  const cleanGurmukhi = cleanForTTS(gurmukhi);
  const cleanRomanized = cleanForTTS(romanized);

  // ── Skip Google TTS if key is placeholder ─────────────────────────────────
  if (
    !GOOGLE_TTS_API_KEY ||
    GOOGLE_TTS_API_KEY === "REPLACE_WITH_YOUR_GOOGLE_TTS_API_KEY"
  ) {
    return browserFallback(cleanGurmukhi, cleanRomanized);
  }

  const cacheKey = cleanGurmukhi;

  try {
    // ── Serve from cache ────────────────────────────────────────────────────
    let audioSrc = audioCache.get(cacheKey);

    if (!audioSrc) {
      // Use SSML so we can insert a 2-second break where ___ blanks were
      const ssmlText = gurmukhi.replace(/\s*_{2,}\s*/g, '<break time="2s"/>');
      const isSSML = ssmlText !== gurmukhi;

      const body = {
        input: isSSML ? { ssml: `<speak>${ssmlText}</speak>` } : { text: cleanGurmukhi },
        voice: {
          languageCode: "pa-IN",
          name: "pa-IN-Wavenet-A",
          ssmlGender: "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.85,
          pitch: 0,
        },
      };

      const res = await fetch(TTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.warn("Google TTS request failed:", res.status, await res.text());
        return browserFallback(cleanGurmukhi, cleanRomanized);
      }

      const data = await res.json();
      audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      audioCache.set(cacheKey, audioSrc);
    }

    // ── Play ────────────────────────────────────────────────────────────────
    const audio = new Audio(audioSrc);
    audio.play();
  } catch (err) {
    console.warn("Google TTS error, falling back to browser TTS:", err);
    browserFallback(cleanGurmukhi, cleanRomanized);
  }
}

// ─── Browser Web Speech fallback ────────────────────────────────────────────
function browserFallback(gurmukhi: string, romanized: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices();
  const paVoice = voices.find((v) => v.lang.startsWith("pa"));
  const hiVoice = voices.find((v) => v.lang.startsWith("hi"));

  const u = new SpeechSynthesisUtterance();
  u.rate = 0.8;
  u.pitch = 1;
  u.volume = 1;

  if (paVoice) {
    u.voice = paVoice;
    u.lang = paVoice.lang;
    u.text = gurmukhi;
  } else if (hiVoice) {
    u.voice = hiVoice;
    u.lang = hiVoice.lang;
    u.text = romanized;
  } else {
    u.lang = "pa-IN";
    u.text = romanized;
  }

  window.speechSynthesis.speak(u);
}
