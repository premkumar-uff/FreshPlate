import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Barcode as BarcodeIcon, PencilLine, Loader2, Check } from "lucide-react";
import { CATALOG, findCatalog } from "../data/catalog";
import { addDaysISO, todayISO } from "../lib/freshness";
import { namesMatch } from "../lib/match";
import { analyzeFoodPhoto, getAiStatus, type AiStatus, type VisionItem } from "../lib/api";
import { useFreshPlate } from "../state/store";
import {
  BackHeader,
  Chip,
  Field,
  PackageCard,
  ShelfStrip,
  TagButton,
} from "../components/ui";
import type { Storage } from "../types";

type Mode = "produce" | "packaged" | "manual";
const STORAGE_OPTIONS: Storage[] = ["fridge", "freezer", "pantry", "counter"];
const SAMPLE_BARCODES: Record<string, string> = {
  "8901058000100": "Maggi Noodles",
  "8901234567890": "Milk",
  "4001234567890": "Bread",
  "8909876543210": "Curd",
};

function catalogName(item: VisionItem): string {
  const match = CATALOG.find((entry) => namesMatch(entry.name, item.name));
  return match ? match.name : item.name;
}

export default function Scan() {
  const navigate = useNavigate();
  const { addItem } = useFreshPlate();
  const photoInput = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("produce");
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("piece");
  const [storage, setStorage] = useState<Storage>("fridge");
  const [purchaseDate, setPurchaseDate] = useState(todayISO());
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [photoNote, setPhotoNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAiStatus().then((value) => {
      if (!cancelled) setAi(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function applyDetected(itemName: string) {
    const entry = findCatalog(itemName);
    setDetected(itemName);
    setName(itemName);
    setUnit(entry?.defaultUnit ?? "piece");
    setStorage(entry?.defaultStorage ?? "fridge");
  }

  function simulatePhotoScan() {
    setScanning(true);
    setDetected(null);
    window.setTimeout(() => {
      const pool = CATALOG.filter((entry) => entry.category === "produce" || entry.category === "dairy");
      applyDetected(pool[Math.floor(Math.random() * pool.length)].name);
      setScanning(false);
    }, 1100);
  }

  async function analyzePhoto(file: File) {
    setScanning(true);
    setDetected(null);
    setCandidates([]);
    setPhotoNote("");
    try {
      const result = await analyzeFoodPhoto(file, file.name || "photo.jpg");
      setScanning(false);
      const mapped = result.items
        .map(catalogName)
        .filter((name, index, all) => name.trim() && all.indexOf(name) === index);
      if (!mapped.length) {
        setPhotoNote(result.summary || "Nothing recognisable in this photo.");
        setMode("manual");
        return;
      }
      applyDetected(mapped[0]);
      setCandidates(mapped.slice(1));
      setPhotoNote(result.summary);
    } catch {
      setPhotoNote("The AI server could not read this photo — running a demo scan instead.");
      simulatePhotoScan();
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (ai === "online") {
      await analyzePhoto(file);
    } else {
      if (ai === "offline") setPhotoNote("AI server offline — ran a demo scan instead.");
      simulatePhotoScan();
    }
  }

  function lookupBarcode(code: string) {
    const found = SAMPLE_BARCODES[code];
    if (found) return applyDetected(found);
    setDetected(null);
    setMode("manual");
  }

  function save() {
    if (!name.trim()) return;
    const entry = findCatalog(name);
    addItem({
      name: name.trim(),
      emoji: entry?.emoji ?? "🍽️",
      quantity,
      unit,
      category: entry?.category ?? "pantry",
      storage,
      purchaseDate,
      expiryDate: expiryDate || undefined,
      notes: notes || undefined,
    });
    setSaved(true);
    window.setTimeout(() => navigate("/kitchen"), 650);
  }

  return (
    <div className="min-h-full px-4 pb-12 pt-4 lg:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <BackHeader title="Register" subtitle="Photo for fresh food, barcode for packaged" />

        <div className="flex gap-2">
          {(
            [
              { id: "produce", label: "Fresh food", icon: Camera },
              { id: "packaged", label: "Packaged", icon: BarcodeIcon },
              { id: "manual", label: "Manual", icon: PencilLine },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-[10px] border-[1.5px] py-3 text-[11px] font-bold uppercase tracking-[0.04em] transition ${
                mode === id
                  ? "border-ink bg-ink text-ground"
                  : "border-rule bg-card text-soft hover:border-ink hover:text-ink"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {mode === "produce" ? (
          <PackageCard className="space-y-3 p-4 text-center">
            <div className="relative mx-auto grid h-44 w-full place-items-center overflow-hidden rounded-[8px] bg-ink">
              <div className="lattice absolute inset-0 opacity-25" aria-hidden />
              <span className="absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-white" />
              <span className="absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-white" />
              <span className="absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-white" />
              <span className="absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-white" />
              {scanning ? (
                <Loader2 className="relative text-tag-canary" size={30} />
              ) : (
                <span className="relative text-4xl" aria-hidden>
                  {detected ? findCatalog(detected)?.emoji ?? "🥕" : "📷"}
                </span>
              )}
            </div>
            <p className="text-[12px] leading-relaxed text-soft">
              One fresh item at a time. Freshness is estimated from food type, storage and dates —
              never from the photo alone.
            </p>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <TagButton full onClick={() => photoInput.current?.click()} disabled={scanning}>
              <Camera size={16} /> {scanning ? "Recognising…" : "Take photo"}
            </TagButton>
            <TagButton full variant="outline" onClick={simulatePhotoScan} disabled={scanning}>
              Run a demo scan
            </TagButton>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
              {ai === null
                ? "Checking assistant…"
                : ai === "online"
                  ? "Live recognition · Groq AI"
                  : "Demo scans · AI server offline"}
            </p>
            {candidates.length ? (
              <div className="flex flex-wrap items-center gap-1.5 text-left">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-soft">
                  Also saw
                </span>
                {candidates.map((name) => (
                  <Chip key={name} onClick={() => applyDetected(name)}>
                    {name}
                  </Chip>
                ))}
              </div>
            ) : null}
            {photoNote ? (
              <p className="rounded-[8px] border border-rule bg-ground p-2.5 text-left text-[11px] leading-relaxed text-soft">
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink">
                  AI guess
                </span>{" "}
                — {photoNote} A photo is never proof: confirm the item before saving.
              </p>
            ) : null}
          </PackageCard>
        ) : null}

        {mode === "packaged" ? (
          <PackageCard className="space-y-3 p-4">
            <ShelfStrip guide="mock DB">Barcode</ShelfStrip>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Field
                  label="Code"
                  placeholder="Enter or scan"
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") lookupBarcode(barcode.trim());
                  }}
                />
              </div>
              <TagButton variant="ink" onClick={() => lookupBarcode(barcode.trim())}>
                Look up
              </TagButton>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SAMPLE_BARCODES).map(([code, product]) => (
                <Chip
                  key={code}
                  onClick={() => {
                    setBarcode(code);
                    lookupBarcode(code);
                  }}
                >
                  {product}
                </Chip>
              ))}
            </div>
            <p className="text-[11px] text-soft">
              Demo codes only. In production this calls a product database.
            </p>
          </PackageCard>
        ) : null}

        {(detected || mode === "manual") && (
          <PackageCard tab={detected ? "Detected" : "Manual"} className="space-y-4 p-4 pt-5">
            <ShelfStrip>Confirm details</ShelfStrip>
            <Field
              label="Item"
              placeholder="e.g. Spinach"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              />
              <Field label="Unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
            </div>
            <div>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-soft">
                Storage
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STORAGE_OPTIONS.map((option) => (
                  <Chip key={option} active={storage === option} onClick={() => setStorage(option)}>
                    {option}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Bought"
                type="date"
                value={purchaseDate}
                max={addDaysISO(1)}
                onChange={(event) => setPurchaseDate(event.target.value)}
              />
              <Field
                label="Printed expiry"
                hint="optional"
                type="date"
                value={expiryDate}
                onChange={(event) => setExpiryDate(event.target.value)}
              />
            </div>
            <Field
              label="Notes"
              hint="optional"
              placeholder="e.g. opened pack"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <TagButton full onClick={save} disabled={!name.trim() || saved}>
              {saved ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                "Add to kitchen"
              )}
            </TagButton>
          </PackageCard>
        )}
      </div>
    </div>
  );
}
