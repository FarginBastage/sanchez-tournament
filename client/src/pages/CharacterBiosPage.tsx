import React from "react";

export default function CharacterBiosPage() {
  const characters = CHARACTERS;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="text-xs font-black tracking-[0.4em] uppercase text-amber-400/60 mb-2">
          Official Dossiers
        </div>
        <h1 className="text-3xl font-black tracking-tight dbz-title mb-2">
          Fighter Profiles
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Every warrior has an origin story. These are the legends of the Sanchez Tournament of Cleaning.
        </p>
      </div>

      <div className="space-y-8">
        {characters.map((char, i) => (
          <CharacterCard key={char.name} char={char} flip={i % 2 !== 0} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-muted-foreground/40 italic">
        A Fargin Bastage Production · Combat Power Levels Certified Accurate
      </div>
    </div>
  );
}

// ─── Character Card ───────────────────────────────────────────────────────────
function CharacterCard({ char, flip }: { char: typeof CHARACTERS[0]; flip: boolean }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{
        borderColor: char.accent + "50",
        boxShadow: `0 0 0 1px ${char.accent}20, 0 8px 40px ${char.accent}20`,
      }}
    >
      {/* Top banner with name */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: char.headerBg }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{char.emoji}</span>
          <div>
            <div className="font-black text-lg text-white tracking-wide">{char.name}</div>
            <div className="text-xs font-bold tracking-widest uppercase opacity-60 text-white">{char.title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold tracking-widest uppercase opacity-50 text-white">Power Level</div>
          <div className="font-black text-xl text-white" style={{ textShadow: `0 0 12px ${char.accent}` }}>
            {char.powerLevel}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`flex flex-col ${flip ? "md:flex-row-reverse" : "md:flex-row"} bg-card`}>

        {/* Photo */}
        <div className="md:w-56 flex-shrink-0">
          <div className="relative h-64 md:h-full min-h-56 overflow-hidden">
            <img
              src={char.photo}
              alt={char.name}
              className="w-full h-full object-cover"
              style={{ objectPosition: char.photoPos }}
            />
            {/* Character color wash at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-20"
              style={{
                background: `linear-gradient(to top, ${char.accent}40, transparent)`,
              }}
            />
            {/* Character name watermark */}
            <div
              className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-black tracking-widest uppercase opacity-50"
              style={{ color: char.accent }}
            >
              {char.character.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-5 space-y-4">

          {/* Origin / backstory */}
          <div>
            <SectionLabel color={char.accent}>Origin</SectionLabel>
            <p className="text-sm text-foreground/80 leading-relaxed mt-1">{char.origin}</p>
          </div>

          {/* Cleaning style */}
          <div>
            <SectionLabel color={char.accent}>Cleaning Style</SectionLabel>
            <p className="text-sm text-foreground/80 leading-relaxed mt-1">{char.style}</p>
          </div>

          {/* Powers */}
          <div>
            <SectionLabel color={char.accent}>Special Abilities</SectionLabel>
            <div className="mt-2 space-y-1.5">
              {char.powers.map(p => (
                <div key={p.name} className="flex items-start gap-2">
                  <div
                    className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: char.accent }}
                  />
                  <div>
                    <span className="text-xs font-black" style={{ color: char.accent }}>{p.name}</span>
                    <span className="text-xs text-muted-foreground"> — {p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weakness */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-sm">⚠️</span>
            <div>
              <span className="text-xs font-black text-amber-400">Fatal Weakness: </span>
              <span className="text-xs text-muted-foreground">{char.weakness}</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="space-y-1.5 pt-1">
            {char.stats.map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-20 text-right flex-shrink-0">{s.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.value}%`, backgroundColor: char.accent }}
                  />
                </div>
                <span className="text-[10px] font-black w-6 text-right" style={{ color: char.accent }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1 opacity-20" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-black tracking-widest uppercase" style={{ color }}>{children}</span>
      <div className="h-px flex-1 opacity-20" style={{ backgroundColor: color }} />
    </div>
  );
}

// ─── Character Data ───────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    name: "Jesse",
    character: "roshi",
    title: "Master Roshi — The Turtle Hermit",
    emoji: "🐢",
    photo: "jesse-roshi.jpeg",
    photoPos: "center 35%",
    accent: "#ff6d00",
    headerBg: "linear-gradient(135deg, #1a0a00 0%, #3e1a00 60%, #bf360c 100%)",
    powerLevel: "8,001",
    origin: `Long ago, Jesse trained alone on a remote island — not Kame House, but a split-level in Indianapolis, Indiana. For decades he honed the ancient art of the Mafuba — the Evil Containment Wave — adapting it for household use to trap dirty laundry in hampers before it could escape to the floor. His white beard is rumored to have formed overnight the first time he saw the state of the downstairs bathroom. He has since channeled his rage into something constructive: dinner.`,
    style: `Methodical. Surgical. Jesse approaches cooking with the calm intensity of a man who has seen things. He does not "throw something together." He executes a battle plan. Each ingredient is retrieved in sequence. The kitchen is left cleaner than he found it — always — because chaos is for lesser warriors. He has never once asked where the can opener is.`,
    powers: [
      { name: "Kamehameha Cuisine", desc: "Charges energy for exactly 8 minutes before unleashing a perfect meal. The kitchen shakes. The family is fed." },
      { name: "Turtle Shell Defense", desc: "Impervious to complaints about dinner options. Has weathered 10,000 \"I don't like this.\"" },
      { name: "Master's Gaze", desc: "One look stops anyone mid-mess. Dishes are put away within seconds. No words spoken." },
      { name: "Hermit's Patience", desc: "Can wait indefinitely for others to start their chores. Has been waiting since 2019." },
    ],
    weakness: "Will lose all power if asked to find something that is 'right there' when it is clearly not right there.",
    stats: [
      { label: "Cooking", value: 98 },
      { label: "Speed", value: 72 },
      { label: "Dishes", value: 85 },
      { label: "Patience", value: 61 },
      { label: "Leadership", value: 95 },
    ],
  },
  {
    name: "Angela",
    character: "bulma",
    title: "Bulma — Genius Inventor of Capsule Corp",
    emoji: "💡",
    photo: "angela.jpeg",
    photoPos: "center 20%",
    accent: "#ce93d8",
    headerBg: "linear-gradient(135deg, #0d001a 0%, #2d0060 60%, #6a1b9a 100%)",
    powerLevel: "∞ (self-reported)",
    origin: `Angela did not stumble into domestic excellence — she engineered it. Armed with a Capsule Corp Dragon Radar and a color-coded chore matrix she invented at age 9, she has spent 25 years optimizing the household to within 0.3% of theoretical perfection. The remaining 0.3% is David. She has the blueprints to fix it. Nobody has asked to see them. She brings them up anyway.`,
    style: `Systems-based. Angela does not just empty the dishwasher — she runs a full load audit, identifies inefficiencies in the stacking pattern, and leaves a sticky note. She has invented three separate organizational systems for the spice cabinet. Two were adopted. The third was "too advanced." She considers this a personal failure and is working on version four. She does not load dishes — she deploys them.`,
    powers: [
      { name: "Dragon Radar Lock-On", desc: "Can locate any missing household item within 30 seconds. Has never been wrong. Not once." },
      { name: "Capsule Compression", desc: "Somehow fits everything into the dishwasher in a single load. Physics are not consulted." },
      { name: "Blueprint Fury", desc: "When the chore system is ignored, she upgrades it. The new version is always more complicated and more correct." },
      { name: "Genius Delegation", desc: "Assigns tasks with such precision that no one can claim they didn't understand. There is a diagram." },
    ],
    weakness: "Loses composure entirely if someone puts a non-dishwasher-safe item in the dishwasher. Recovery time: 45 minutes.",
    stats: [
      { label: "Intelligence", value: 99 },
      { label: "Organization", value: 97 },
      { label: "Dishes", value: 96 },
      { label: "Patience", value: 55 },
      { label: "Inventing", value: 100 },
    ],
  },
  {
    name: "Jude",
    character: "gohan",
    title: "Gohan — The Scholar",
    emoji: "⚡",
    photo: "jude.jpeg",
    photoPos: "center 25%",
    accent: "#66bb6a",
    headerBg: "linear-gradient(135deg, #001a00 0%, #003300 60%, #1b5e20 100%)",
    powerLevel: "Dormant (Trust the Process)",
    origin: `Jude's power has always been greater than anyone suspected — including Jude. Like his predecessor, he spent years suppressing his hidden potential behind a studied expression of mild inconvenience. But under the surface, a storm brews. The dog bowls have been washed. The trash has been emptied. The table has been set with a precision that suggests he may have used a ruler. The scholars believe he is on the verge of something. The scholars are watching.`,
    style: `Reluctant but devastating. Jude does not want to do the chores. He has made this clear through body language, sighing, and the strategic timing of bathroom breaks. And yet — when he commits — the table is set with military geometry, the dog bowls gleam, and the trash is removed without being asked twice. Observers disagree on whether this is effort or just what Gohan looks like at 30%.`,
    powers: [
      { name: "Hidden Power Surge", desc: "Chore completion speed triples without warning. Entire jobs vanish in minutes. Family stands in awe." },
      { name: "Scholar's Focus", desc: "Can read, watch TV, and complete table-setting simultaneously. Accuracy unaffected." },
      { name: "Dog Whisperer", desc: "The dogs do what Jude says. No one understands this. The dogs eat when Jude feeds them. Always." },
      { name: "Mystic Form", desc: "Occasionally cleans things no one asked him to clean. Room still wonders if it was a dream." },
    ],
    weakness: "Powering up requires exactly the right atmospheric conditions: no one watching, no one commenting on speed, and at least one good song.",
    stats: [
      { label: "Raw Power", value: 94 },
      { label: "Consistency", value: 68 },
      { label: "Table Setting", value: 91 },
      { label: "Dog Duties", value: 88 },
      { label: "Attitude", value: 52 },
    ],
  },
  {
    name: "David",
    character: "goku",
    title: "Goku — Low-Class Warrior",
    emoji: "🔥",
    photo: "david.jpeg",
    photoPos: "center 15%",
    accent: "#ffa726",
    headerBg: "linear-gradient(135deg, #1a0800 0%, #3d1c00 60%, #e65100 100%)",
    powerLevel: "Over 9,000 (Enthusiasm Only)",
    origin: `David arrived on this planet with one mission: to help. He does not know what the mission requires. He has not asked. He will figure it out when he gets there. Born a low-class warrior like his character, David has always had to fight harder than the rest — not because the chores are difficult, but because he genuinely cannot find the sponge. He has found it 400 times. He forgets where it is each morning. He remains optimistic. He is Goku. He will never stop trying.`,
    style: `Enthusiastic and catastrophic in equal measure. David approaches counter-wiping the way Goku approaches a new transformation: with full commitment, no technique, and spectacular results. The counter is clean. Several other things are now also wet. He is proud. He helped. He would like a snack. He will absolutely do the dishes — as soon as he remembers what the dishes are. He is asking clarifying questions about the dishes.`,
    powers: [
      { name: "Instant Transmission", desc: "Disappears from the kitchen exactly when a new task appears. Reappears once it's done." },
      { name: "Spirit Bomb Enthusiasm", desc: "Draws energy from every family member's belief in him. Briefly unstoppable. Then hungry." },
      { name: "Saiyan Appetite", desc: "Motivation to cook dinner scales directly with personal hunger. Peak performance: 6:30pm." },
      { name: "Battle Instinct", desc: "Wipes counters with the intensity of someone who learned from a sensei. The sensei did not teach wiping. He learned it himself." },
    ],
    weakness: "Easily distracted by anything more interesting than the current chore. Current list: most things.",
    stats: [
      { label: "Power", value: 97 },
      { label: "Focus", value: 41 },
      { label: "Enthusiasm", value: 100 },
      { label: "Counter Wiping", value: 83 },
      { label: "Finding Things", value: 22 },
    ],
  },
];
