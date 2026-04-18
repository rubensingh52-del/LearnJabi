import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Volume2 } from "lucide-react";
import { speakPunjabi } from "@/lib/tts";

// Each letter has: gurmukhi char, full name (e.g. "sassaa"), short sound (e.g. "Sa"), english description
interface AlphaChar {
  g: string;
  name: string;    // full name: sassaa, haahaa, etc.
  sound: string;   // short sound: Sa, Ha, Ou
  e: string;       // english description
}

// The 35-letter Gurmukhi alphabet (paiṇṭī) — data from discoversikhism.com
// Each entry: character | full name | short sound | description
const ALPHABET: AlphaChar[] = [
  { g: "ੳ", name: "oorhaa",       sound: "Ou",   e: "Vowel carrier (silent): Placeholder for 'u' and 'o' sounds" },
  { g: "ਅ", name: "airhaa",       sound: "Aa",   e: "Vowel carrier (silent): Placeholder for 'a' sounds" },
  { g: "ੲ", name: "eerhee",       sound: "Ie",   e: "Vowel carrier (silent): Placeholder for 'i' and 'e' sounds" },
  { g: "ਸ", name: "sassaa",       sound: "Sa",   e: "s — as in sun" },
  { g: "ਹ", name: "haahaa",       sound: "Ha",   e: "h — as in hat" },
  { g: "ਕ", name: "kakkaa",       sound: "Ka",   e: "k — as in kit" },
  { g: "ਖ", name: "khakhkhaa",    sound: "Kha",  e: "kh — aspirated k" },
  { g: "ਗ", name: "gaggaa",       sound: "Ga",   e: "g — as in go" },
  { g: "ਘ", name: "ghaggaa",      sound: "Gha",  e: "gh — aspirated g" },
  { g: "ਙ", name: "nganngaa",     sound: "Nga",  e: "ng — as in sing" },
  { g: "ਚ", name: "chachchaa",    sound: "Cha",  e: "ch — as in chat" },
  { g: "ਛ", name: "chhachhchhaa", sound: "Chha", e: "chh — aspirated ch" },
  { g: "ਜ", name: "jajjaa",       sound: "Ja",   e: "j — as in jam" },
  { g: "ਝ", name: "jhajjaa",      sound: "Jha",  e: "jh — aspirated j" },
  { g: "ਞ", name: "njannjaa",     sound: "Nja",  e: "ny — as in canyon" },
  { g: "ਟ", name: "tainkaa",      sound: "Ta",   e: "ṭ — retroflex t" },
  { g: "ਠ", name: "thaththaa",    sound: "Tha",  e: "ṭh — aspirated retroflex t" },
  { g: "ਡ", name: "daddaa",       sound: "Da",   e: "ḍ — retroflex d" },
  { g: "ਢ", name: "dhaddaa",      sound: "Dha",  e: "ḍh — aspirated retroflex d" },
  { g: "ਣ", name: "nhaanhaa",     sound: "Na",   e: "ṇ — retroflex n" },
  { g: "ਤ", name: "tattaa",       sound: "Ta",   e: "t — soft dental t" },
  { g: "ਥ", name: "thaththaa",    sound: "Tha",  e: "th — aspirated dental t" },
  { g: "ਦ", name: "daddaa",       sound: "Da",   e: "d — dental d" },
  { g: "ਧ", name: "dhaddaa",      sound: "Dha",  e: "dh — aspirated dental d" },
  { g: "ਨ", name: "nannaa",       sound: "Na",   e: "n — as in no" },
  { g: "ਪ", name: "pappaa",       sound: "Pa",   e: "p — as in pen" },
  { g: "ਫ", name: "phaphphaa",    sound: "Pha",  e: "ph — aspirated p" },
  { g: "ਬ", name: "babbaa",       sound: "Ba",   e: "b — as in bed" },
  { g: "ਭ", name: "bhabbaa",      sound: "Bha",  e: "bh — aspirated b" },
  { g: "ਮ", name: "mammaa",       sound: "Ma",   e: "m — as in mat" },
  { g: "ਯ", name: "yayyaa",       sound: "Ya",   e: "y — as in yes" },
  { g: "ਰ", name: "raaraa",       sound: "Ra",   e: "r — rolled r" },
  { g: "ਲ", name: "lallaa",       sound: "La",   e: "l — as in love" },
  { g: "ਵ", name: "vavvaa",       sound: "Va",   e: "v/w — between v and w" },
  { g: "ੜ", name: "rhaarhaa",     sound: "Ra",   e: "ṛ — retroflex flap r" },
];

// 6 extra letters added later (for borrowed sounds from other languages)
const EXTRA_LETTERS: AlphaChar[] = [
  { g: "ਸ਼", name: "shashashaa",   sound: "Sha",  e: "sh — as in shop (borrowed sound)" },
  { g: "ਖ਼", name: "khhakhhkhha",  sound: "Khha", e: "ḵh — guttural kh (Arabic/Persian)" },
  { g: "ਗ਼", name: "ghagghaa",     sound: "Ga",   e: "ġ — voiced velar fricative (borrowed)" },
  { g: "ਜ਼", name: "zazzaa",       sound: "Za",   e: "z — as in zebra (borrowed sound)" },
  { g: "ਫ਼", name: "faffaa",       sound: "Fa",   e: "f — as in fan (borrowed sound)" },
  { g: "ਲ਼", name: "lallaa",       sound: "La",   e: "ḷ — retroflex l (borrowed sound)" },
];

const MATRAS = [
  { g: "ਾ",  name: "kannaa",      sound: "aa",  e: "Adds a long 'aa' sound — like the 'a' in Father" },
  { g: "ਿ",  name: "sihaaree",    sound: "i",   e: "Adds a short 'i' sound — like the 'i' in It (written before the letter)" },
  { g: "ੀ",  name: "bihaaree",    sound: "ee",  e: "Adds a long 'ee' sound — like the 'ee' in See" },
  { g: "ੁ",  name: "aunkarh",     sound: "u",   e: "Adds a short 'u' sound — like the 'u' in Put" },
  { g: "ੂ",  name: "dulainkarh",  sound: "oo",  e: "Adds a long 'oo' sound — like the 'oo' in Food" },
  { g: "ੇ",  name: "laavaan",     sound: "ay",  e: "Adds the 'ay' sound to a letter — like the 'ay' in Play" },
  { g: "ੈ",  name: "dulaavaan",   sound: "a",   e: "Adds the 'a' sound to a letter — like the 'a' in Man" },
  { g: "ੋ",  name: "horhaa",      sound: "o",   e: "Adds an 'o' sound — like the 'o' in Go" },
  { g: "ੌ",  name: "kanaurhaa",   sound: "au",  e: "Adds an 'au' sound — like the 'au' in Caught" },
];

const EXAMPLES = [
  { g: "ਪੰਜਾਬ",       name: "Panjaab",      sound: "",  e: "Punjab" },
  { g: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", name: "Sat Sri Akal", sound: "",  e: "Hello / God is truth" },
  { g: "ਪਾਣੀ",        name: "Paani",         sound: "",  e: "Water" },
  { g: "ਖਾਣਾ",        name: "Khaana",        sound: "",  e: "Food" },
  { g: "ਮਾਂ",          name: "Maa",           sound: "",  e: "Mother" },
  { g: "ਘਰ",          name: "Ghar",           sound: "",  e: "Home" },
  { g: "ਸਿੱਖ",         name: "Sikh",          sound: "",  e: "Sikh / Learner" },
  { g: "ੴ",           name: "Ik Onkar",       sound: "",  e: "One God — the sacred symbol opening the Guru Granth Sahib Ji" },
];

type Tab = "alphabet" | "extra" | "matras" | "examples";

const TABS: { id: Tab; label: string; gurmukhi: string }[] = [
  { id: "alphabet", label: "Alphabet",  gurmukhi: "ਪੈਂਤੀ" },
  { id: "extra",    label: "Extra Letters", gurmukhi: "ਹੋਰ" },
  { id: "matras",   label: "Matras",    gurmukhi: "ਮਾਤਰਾ" },
  { id: "examples", label: "Examples",  gurmukhi: "ਉਦਾਹਰਣ" },
];

export default function AlphabetPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("alphabet");
  const [selected, setSelected] = useState<AlphaChar | null>(null);

  const handleCardClick = (item: AlphaChar) => {
    setSelected(item);
    speakPunjabi(item.g, item.name);
  };

  const data: AlphaChar[] =
    activeTab === "alphabet" ? ALPHABET
    : activeTab === "extra"  ? EXTRA_LETTERS
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
          <span className="gurmukhi text-4xl font-bold text-primary">ਗੁ</span>
          <div>
            <h1 className="text-xl font-bold">Gurmukhi Script</h1>
            <p className="gurmukhi text-sm text-muted-foreground">ਗੁਰਮੁਖੀ ਲਿਪੀ</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-prose">
          Gurmukhi (ਗੁਰਮੁਖੀ) has <strong>35 core letters</strong> — the <em>paiṇṭī</em> (ਪੈਂਤੀ). Every letter has three things: its <strong>shape</strong>, its <strong>full name</strong> (e.g. <em>sassaa</em>), and a <strong>short sound</strong> (e.g. <em>Sa</em>). Tap any character to hear it.
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
          <div className="gurmukhi text-6xl font-bold leading-none w-20 text-center flex-shrink-0">{selected.g}</div>
          <div>
            <div className="flex flex-col gap-1.5 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground w-20">Name</span>
                <span className="text-base font-semibold text-foreground/80 italic leading-none">{selected.name}</span>
              </div>
              {selected.sound && (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground w-20 shrink-0 mt-1">Pronunciation</span>
                  <span className="text-sm font-bold text-primary leading-tight">
                    {activeTab === "matras" ? `Adds an '${selected.sound}' sound to the letter` : selected.sound}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground leading-snug bg-muted/30 p-2 rounded-lg border border-border/40">
              {selected.e}
            </div>
            <button
              onClick={() => speakPunjabi(selected.g, selected.name)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors bg-primary/10 px-2.5 py-1.5 rounded-md border border-primary/20"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Listen to the name
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
              selected?.g === item.g && selected?.name === item.name
                ? "border-primary bg-primary/10 shadow-sm scale-105"
                : "border-border/60 bg-card hover:border-primary/40 hover:bg-accent hover:scale-105"
            }`}
          >
            <span className="gurmukhi text-3xl font-bold leading-tight mb-1">{item.g}</span>
            {item.sound ? (
              <>
                <span className="text-xs font-bold text-primary">{item.sound}</span>
                <span className="text-[10px] text-muted-foreground italic leading-tight">{item.name}</span>
              </>
            ) : (
              <span className="text-xs text-primary font-medium">{item.name}</span>
            )}
          </button>
        ))}
      </div>

      {/* Section description */}
      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/40 text-sm text-muted-foreground">
        {activeTab === "alphabet" && (
          <p>The <strong>35 letters</strong> of the Gurmukhi script, called the <em>paiṇṭī</em> (ਪੈਂਤੀ). The first three — ੳ, ਅ, ੲ — are vowel carriers: they don't make a sound on their own but carry vowel signs. Each letter shows its short sound (<em>Sa, Ha, Ka…</em>) and full name (<em>sassaa, haahaa, kakkaa…</em>).</p>
        )}
        {activeTab === "extra" && (
          <p>Six <strong>extra letters</strong> added after the original 35 to represent sounds borrowed from Arabic, Persian, and other languages. They are formed by adding a dot (pair bindī) to existing letters. Many Punjabi speakers don't distinguish these from their plain equivalents.</p>
        )}
        {activeTab === "matras" && (
          <p><strong>Matras</strong> are vowel signs that attach to consonants to change their vowel sound. They replace the default short 'a' sound every consonant inherits. For example: ਕ (Ka) + ੀ matra = ਕੀ (Kee).</p>
        )}
        {activeTab === "examples" && (
          <p>Common Punjabi words written in Gurmukhi. Tap each one to hear its pronunciation. Notice how characters combine — consonants carry the vowel matras as attachments above, below, or beside them.</p>
        )}
      </div>

      {/* Quiz teaser */}
      <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Ready to practice?</p>
          <p className="text-xs text-muted-foreground">Head to Unit 1 to test your Gurmukhi knowledge with exercises.</p>
        </div>
        <button
          onClick={() => navigate("/learn")}
          className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Unit 1 →
        </button>
      </div>
    </div>
  );
}
