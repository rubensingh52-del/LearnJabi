import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Volume2 } from "lucide-react";
import { speakPunjabi } from "@/lib/tts";

const VOWELS = [
  { g: "ਅ", r: "aira", e: "short 'a' — as in 'about'" },
  { g: "ਆ", r: "aa", e: "long 'aa' — as in 'father'" },
  { g: "ਇ", r: "i", e: "short 'i' — as in 'hit'" },
  { g: "ਈ", r: "ee", e: "long 'ee' — as in 'see'" },
  { g: "ਉ", r: "u", e: "short 'u' — as in 'put'" },
  { g: "ਊ", r: "oo", e: "long 'oo' — as in 'moon'" },
  { g: "ਏ", r: "e", e: "'e' — as in 'play'" },
  { g: "ਐ", r: "ai", e: "'ai' — as in 'cat'" },
  { g: "ਓ", r: "o", e: "'o' — as in 'go'" },
  { g: "ਔ", r: "au", e: "'au' — as in 'caught'" },
];

const CONSONANTS = [
  { g: "ੳ", r: "ooraa", e: "vowel carrier for ਉ ਊ ਓ ਔ" },
  { g: "ਅ", r: "airaa", e: "vowel carrier for ਅ ਆ ਐ ਔ" },
  { g: "ੲ", r: "eeree", e: "vowel carrier for ਇ ਈ ਏ" },
  { g: "ਸ", r: "sassaa", e: "s — sun" },
  { g: "ਹ", r: "haahaa", e: "h — hat" },
  { g: "ਕ", r: "kakkaa", e: "k — kit" },
  { g: "ਖ", r: "khakkhaa", e: "kh — aspirated k" },
  { g: "ਗ", r: "gaggaa", e: "g — go" },
  { g: "ਘ", r: "ghagghaa", e: "gh — aspirated g" },
  { g: "ਙ", r: "ngangaa", e: "ng — sing" },
  { g: "ਚ", r: "chachchaa", e: "ch — chat" },
  { g: "ਛ", r: "chhachchhaa", e: "chh — aspirated ch" },
  { g: "ਜ", r: "jajjaa", e: "j — jam" },
  { g: "ਝ", r: "jhajjhaa", e: "jh — aspirated j" },
  { g: "ਞ", r: "nyanyaa", e: "ny — canyon" },
  { g: "ਟ", r: "tainkaa", e: "ṭ — retroflex t" },
  { g: "ਠ", r: "thaththaa", e: "ṭh — aspirated retroflex t" },
  { g: "ਡ", r: "daddaa", e: "ḍ — retroflex d" },
  { g: "ਢ", r: "dhaddhaa", e: "ḍh — aspirated retroflex d" },
  { g: "ਣ", r: "naanaa", e: "ṇ — retroflex n" },
  { g: "ਤ", r: "tattaa", e: "t — soft dental t" },
  { g: "ਥ", r: "thaththaa", e: "th — aspirated dental t" },
  { g: "ਦ", r: "daddaa", e: "d — dental d" },
  { g: "ਧ", r: "dhaddhaa", e: "dh — aspirated dental d" },
  { g: "ਨ", r: "nannaa", e: "n — no" },
  { g: "ਪ", r: "pappaa", e: "p — pen" },
  { g: "ਫ", r: "phaphphaa", e: "ph — aspirated p" },
  { g: "ਬ", r: "babbaa", e: "b — bed" },
  { g: "ਭ", r: "bhabbhaa", e: "bh — aspirated b" },
  { g: "ਮ", r: "mammaa", e: "m — mat" },
  { g: "ਯ", r: "yayyaa", e: "y — yes" },
  { g: "ਰ", r: "raaraa", e: "r — rolled r" },
  { g: "ਲ", r: "lallaa", e: "l — love" },
  { g: "ਵ", r: "vavvaa", e: "v/w — between v and w" },
  { g: "ੜ", r: "rhaarhaa", e: "ṛ — retroflex flap r" },
];

const MATRAS = [
  { g: "ਾ", r: "kannaa", e: "long 'aa' matra" },
  { g: "ਿ", r: "sihaari", e: "short 'i' matra (written before the letter)" },
  { g: "ੀ", r: "bihaari", e: "long 'ee' matra" },
  { g: "ੁ", r: "aunkarh", e: "short 'u' matra" },
  { g: "ੂ", r: "dulainkarh", e: "long 'oo' matra" },
  { g: "ੇ", r: "laavaan", e: "'e' matra" },
  { g: "ੈ", r: "dulaavaan", e: "'ai' matra" },
  { g: "ੋ", r: "horhaa", e: "'o' matra" },
  { g: "ੌ", r: "kanaurhaa", e: "'au' matra" },
];

const EXAMPLES = [
  { g: "ਪੰਜਾਬ", r: "Panjaab", e: "Punjab" },
  { g: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", r: "Sat Sri Akal", e: "Hello / God is truth" },
  { g: "ਪਾਣੀ", r: "Paani", e: "Water" },
  { g: "ਖਾਣਾ", r: "Khaana", e: "Food" },
  { g: "ਮਾਂ", r: "Maa", e: "Mother" },
  { g: "ਘਰ", r: "Ghar", e: "Home" },
  { g: "ਸਿੱਖ", r: "Sikh", e: "Sikh / Learner" },
  { g: "ੴ", r: "Ik Oankaar", e: "One God (sacred symbol)" },
];

type Tab = "vowels" | "consonants" | "matras" | "examples";

const TABS: { id: Tab; label: string; gurmukhi: string }[] = [
  { id: "vowels", label: "Vowels", gurmukhi: "ਸੁਰ" },
  { id: "consonants", label: "Consonants", gurmukhi: "ਵਿਅੰਜਨ" },
  { id: "matras", label: "Matras", gurmukhi: "ਮਾਤਰਾ" },
  { id: "examples", label: "Examples", gurmukhi: "ਉਦਾਹਰਣ" },
];

export default function AlphabetPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("vowels");
  const [selected, setSelected] = useState<{ g: string; r: string; e: string } | null>(null);

  const handleCardClick = (item: { g: string; r: string; e: string }) => {
    setSelected(item);
    speakPunjabi(item.g, item.r);
  };

  const data = activeTab === "vowels" ? VOWELS
    : activeTab === "consonants" ? CONSONANTS
    : activeTab === "matras" ? MATRAS
    : EXAMPLES;

  return (
    <div className="page-enter mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => navigate("/learn")}
        className="inline-flex items-center gap-1 mb-6 -ml-1 text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-1 rounded transition-colors hover:bg-accent"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Units
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">ੴ</span>
          <div>
            <h1 className="text-xl font-bold">Gurmukhi Script</h1>
            <p className="gurmukhi text-sm text-muted-foreground">ਗੁਰਮੁਖੀ ਲਿਪੀ</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-prose">
          Gurmukhi (ਗੁਰਮੁਖੀ) is the writing system used for the Punjabi language. It has <strong>35 consonants</strong>, <strong>10 independent vowels</strong>, and a set of vowel signs called <em>matras</em>. Tap any character to hear it spoken aloud.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelected(null); }}
            className={`flex-1 min-w-fit px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="gurmukhi ml-1.5 text-xs opacity-60">{tab.gurmukhi}</span>
          </button>
        ))}
      </div>

      {/* Selected card highlight */}
      {selected && (
        <div className="mb-6 p-5 rounded-2xl border-2 border-primary/40 bg-primary/5 flex items-center gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-6xl font-bold leading-none w-20 text-center flex-shrink-0">{selected.g}</div>
          <div>
            <div className="text-xl font-semibold text-primary">{selected.r}</div>
            <div className="text-sm text-muted-foreground">{selected.e}</div>
            <button
              onClick={() => speakPunjabi(selected.g, selected.r)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Tap to hear again
            </button>
          </div>
        </div>
      )}

      {/* Character grid */}
      <div className="grid gap-3 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
        {data.map((item, i) => (
          <button
            key={i}
            onClick={() => handleCardClick(item)}
            className={`group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
              selected?.g === item.g
                ? "border-primary bg-primary/10 shadow-sm scale-105"
                : "border-border/60 bg-card hover:border-primary/40 hover:bg-accent hover:scale-105"
            }`}
          >
            <span className="text-3xl font-bold leading-tight mb-1">{item.g}</span>
            <span className="text-xs text-primary font-medium">{item.r}</span>
          </button>
        ))}
      </div>

      {/* Section description */}
      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/40 text-sm text-muted-foreground">
        {activeTab === "vowels" && (
          <p>Gurmukhi has <strong>10 independent vowels</strong>. When attached to a consonant, they appear as vowel signs (matras). Every syllable in Gurmukhi has an inherent 'a' sound unless a matra overrides it.</p>
        )}
        {activeTab === "consonants" && (
          <p>The <strong>35 consonants</strong> are arranged in groups by point of articulation — from the throat (ਕ) to the lips (ਪ). Many come in plain and aspirated pairs (e.g., ਕ / ਖ, ਗ / ਘ).</p>
        )}
        {activeTab === "matras" && (
          <p><strong>Matras</strong> are vowel diacritics that attach to consonants to change their vowel sound. They replace the default inherent 'a' sound. For example: ਕ (ka) + ੀ matra = ਕੀ (kee).</p>
        )}
        {activeTab === "examples" && (
          <p>Common Punjabi words written in Gurmukhi. Tap each one to hear its pronunciation. Notice how the characters combine to form words — consonants carry the vowel matras as attachments.</p>
        )}
      </div>

      {/* Quiz teaser */}
      <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Ready to practice?</p>
          <p className="text-xs text-muted-foreground">Head to Unit 1 to test your Gurmukhi knowledge with exercises.</p>
        </div>
        <button
          onClick={() => navigate("/learn/1")}
          className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Unit 1 →
        </button>
      </div>
    </div>
  );
}
