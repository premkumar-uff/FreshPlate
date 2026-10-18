import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, ShieldAlert } from "lucide-react";
import { BackHeader, Chip, PackageCard, ShelfStrip, TagButton } from "../components/ui";
import { getAiStatus, sendChat, transcribeAudio, type AiStatus, type ChatTurn } from "../lib/api";

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

const SAFETY_PATTERNS = [
  /hot oil/i,
  /oil.*(smoke|burn|fire|splash)/i,
  /fire/i,
  /burn/i,
  /smoke/i,
  /scald/i,
];

const DEMO_QUESTIONS = [
  "What do I do next?",
  "How much water should I add?",
  "Is this step safe?",
  "The oil is extremely hot",
];

function answer(question: string): { reply: string; safety: boolean } {
  const text = question.toLowerCase();
  if (SAFETY_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      safety: true,
      reply:
        "Safety first. Turn off the heat immediately. Do not move the hot pan and do not add water to hot oil. Step back from the stove, keep your hands and face away, and ask an adult or another person nearby to help right now. If there is a fire or smoke that keeps growing, leave the kitchen and call emergency services. Do not wait it out and do not assume a fixed time makes hot oil safe.",
    };
  }
  if (/water|how much liquid/.test(text)) {
    return {
      safety: false,
      reply:
        "Use about two cups of water for one cup of rice, adding it a little at a time. If the dish looks dry, add two tablespoons more and stir gently.",
    };
  }
  if (/spice|chilli|chili|salt|season/.test(text)) {
    return {
      safety: false,
      reply:
        "Add spices in small amounts and taste before adding more. A quarter teaspoon of chilli powder is a gentle start for two servings.",
    };
  }
  if (/next|what now|what do i do|continue/.test(text)) {
    return {
      safety: false,
      reply:
        "Look at the highlighted step on your screen. Read the short instruction, finish it, then press Next step. I will read the following step out loud.",
    };
  }
  if (/knife|chop|cut|peel/.test(text)) {
    return {
      safety: false,
      reply:
        "Keep your fingers curled away from the blade and cut on a stable board. If the item is slippery, cut a flat base first so it cannot roll.",
    };
  }
  return {
    safety: false,
    reply:
      "I am listening. Tell me where you are stuck, for example what you can see in the pan or which instruction you do not understand.",
  };
}

export default function VoiceHelp() {
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [heard, setHeard] = useState("");
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [answerSource, setAnswerSource] = useState<"live" | "demo" | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const historyRef = useRef<ChatTurn[]>([]);
  const supported = useRef<boolean>(getRecognition() !== null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAiStatus().then((value) => {
      if (!cancelled) setAi(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (mediaRef.current?.state === "recording") mediaRef.current.stop();
      timersRef.current.forEach((id) => window.clearTimeout(id));
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function respond(question: string) {
    setStatus("thinking");
    const isSafety = SAFETY_PATTERNS.some((pattern) => pattern.test(question));

    let reply: string;
    let source: "live" | "demo" = "demo";

    if (!isSafety && ai === "online") {
      try {
        reply = await sendChat({ message: question, history: historyRef.current });
        source = "live";
      } catch {
        reply = answer(question).reply;
      }
    } else {
      // Safety questions always get the reviewed instant reply, AI or not.
      reply = answer(question).reply;
    }

    historyRef.current = [
      ...historyRef.current,
      { role: "user" as const, content: question },
      { role: "assistant" as const, content: reply },
    ].slice(-8);

    setAnswerSource(source);
    setStatus("speaking");
    speak(reply);
    const idleTimer = window.setTimeout(
      () => setStatus("idle"),
      Math.max(2500, reply.length * 55)
    );
    timersRef.current.push(idleTimer);
  }

  async function dictateWithServer() {
    // Browsers without Web Speech API: record, transcribe on the AI server.
    if (mediaRef.current?.state === "recording") return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      setStatus("thinking");
      transcribeAudio(blob, "question.webm")
        .then((text) => {
          if (!text) throw new Error("empty");
          setHeard(text);
          void respond(text);
        })
        .catch(() => {
          setHeard("Could not hear you clearly.");
          setStatus("idle");
        });
    };
    mediaRef.current = recorder;
    recorder.start();
    setStatus("listening");
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    } else if (mediaRef.current?.state === "recording") {
      mediaRef.current.stop();
    }
  }

  function startListening() {
    const recognition = getRecognition();
    if (!recognition) {
      if (ai === "online" && navigator.mediaDevices) {
        dictateWithServer().catch(() => respond("Is this step safe?"));
        return;
      }
      respond("Is this step safe?");
      return;
    }
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setHeard(transcript);
      void respond(transcript);
    };
    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => setStatus((value) => (value === "listening" ? "idle" : value));
    setHeard("");
    setStatus("listening");
    recognition.start();
  }

  const isSafety = heard && SAFETY_PATTERNS.some((pattern) => pattern.test(heard));
  const label =
    status === "listening"
      ? "Listening"
      : status === "thinking"
        ? "Thinking"
        : status === "speaking"
          ? "Speaking"
          : "Tap to ask";

  const sourceLabel =
    ai === null
      ? "Checking assistant…"
      : ai === "online"
        ? "Live answers · Groq AI"
        : "Demo answers · AI server offline";

  return (
    <div className="min-h-full px-4 pb-12 pt-4 lg:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <BackHeader title="Voice help" subtitle="Audio only — speak and listen" />

        <PackageCard className="flex flex-col items-center gap-4 p-6 text-center">
          <button
            onClick={() => (status === "listening" ? stopListening() : startListening())}
            aria-label={status === "listening" ? "Stop listening" : "Start listening"}
            className={`grid h-32 w-32 place-items-center rounded-full border-[3px] border-ink transition active:translate-y-px ${
              status === "listening" ? "bg-tag-red text-white" : "bg-tag-canary text-ink"
            } ${status === "speaking" || status === "thinking" ? "motion-safe:animate-pulse" : ""}`}
          >
            {status === "listening" ? <MicOff size={44} /> : <Mic size={44} />}
          </button>
          <div>
            <p className="text-[22px] font-black uppercase leading-none tracking-[0.02em]">{label}</p>
            <p className="mt-1.5 text-xs text-soft">
              Ask about the current step, quantities or safety. The answer plays as audio only.
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
              {sourceLabel}
              {answerSource === "live" ? " · last answer live" : ""}
              {answerSource === "demo" ? " · last answer demo" : ""}
            </p>
          </div>
          {heard ? (
            <div className="w-full rounded-[8px] border border-rule bg-ground p-3 text-left">
              <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-soft">
                {isSafety ? <ShieldAlert size={12} className="text-tag-red" /> : <Volume2 size={12} />}
                You said
              </span>
              <p className="mt-1 text-sm">{heard}</p>
            </div>
          ) : null}
        </PackageCard>

        <PackageCard className="space-y-3 p-4">
          <ShelfStrip>Example questions</ShelfStrip>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_QUESTIONS.map((question) => (
              <Chip
                key={question}
                onClick={() => {
                  setHeard(question);
                  void respond(question);
                }}
              >
                {question}
              </Chip>
            ))}
          </div>
          {!supported.current && ai !== "online" ? (
            <p className="text-[11px] font-semibold text-tag-orange">
              Live speech recognition is unavailable in this browser. Example questions still work.
            </p>
          ) : null}
        </PackageCard>

        <PackageCard className="space-y-2.5 p-4">
          <div className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.08em] text-tag-red">
            <ShieldAlert size={15} /> Safety rules
          </div>
          <ul className="list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-soft">
            <li>Dangerous situations get immediate safety steps, never a fixed waiting time.</li>
            <li>Hot oil is not guaranteed safe after a set number of minutes.</li>
            <li>When in doubt, turn off the heat and get an adult&apos;s help.</li>
          </ul>
        </PackageCard>

        <TagButton
          variant="outline"
          full
          onClick={() => speak("I am here. Tell me what you need help with.")}
        >
          <Volume2 size={14} /> Hear a sample reply
        </TagButton>
      </div>
    </div>
  );
}
