import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Check, Pencil, Recycle, Trash2, ScanLine } from "lucide-react";
import { useFreshPlate } from "../state/store";
import { FRESHNESS_BUCKETS, freshnessBucket, getFreshness } from "../lib/freshness";
import {
  Chip,
  Dialog,
  EmptyState,
  Field,
  PackageCard,
  Segmented,
  ShelfStrip,
  TagButton,
} from "../components/ui";
import GroceryPackage from "../components/GroceryLabel";
import type { GroceryItem, Storage } from "../types";

const STORAGE_OPTIONS: Storage[] = ["fridge", "freezer", "pantry", "counter"];
const DISCARD_REASONS = ["Spoiled", "Forgotten", "Didn't like it", "Overbought", "Other"];
const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function Kitchen() {
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "freshness" ? "freshness" : "inventory";
  const { groceries, updateItem, removeItem, consumeItem, discardItem } = useFreshPlate();

  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [bucket, setBucket] = useState<string | null>(null);
  const [editing, setEditing] = useState<GroceryItem | null>(null);
  const [discarding, setDiscarding] = useState<GroceryItem | null>(null);
  const [reason, setReason] = useState(DISCARD_REASONS[0]);

  const counted = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of groceries) {
      const key = item.name[0]?.toUpperCase() ?? "#";
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [groceries]);

  const inventory = useMemo(() => {
    const list = query
      ? groceries.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      : groceries;
    return [...list].sort((a, b) => getFreshness(a).daysLeft - getFreshness(b).daysLeft);
  }, [groceries, query]);

  const alphabetical = useMemo(() => {
    return groceries
      .filter((item) => (letter ? item.name.toUpperCase().startsWith(letter) : true))
      .filter((item) => (bucket ? freshnessBucket(item) === bucket : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [groceries, letter, bucket]);

  const guide =
    alphabetical.length > 1
      ? `${alphabetical[0].name} — ${alphabetical[alphabetical.length - 1].name}`
      : alphabetical.length === 1
        ? alphabetical[0].name
        : "empty";

  return (
    <div className="px-4 pt-5 lg:px-8 lg:pt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-black uppercase leading-none tracking-[0.01em]">Kitchen</h1>
          <p className="mt-1.5 font-mono text-[11px] text-soft">
            {groceries.length} item{groceries.length === 1 ? "" : "s"} on the shelf
          </p>
        </div>
        <Link to="/scan" aria-label="Add grocery">
          <TagButton variant="primary" className="!px-3 !py-2">
            <Plus size={18} />
          </TagButton>
        </Link>
      </div>

      <div className="mt-5">
        <Segmented
          value={view}
          onChange={(id) => setParams(id === "freshness" ? { view: "freshness" } : {})}
          options={[
            { id: "inventory", label: "Inventory" },
            { id: "freshness", label: "Freshness A–Z" },
          ]}
        />
      </div>

      {view === "inventory" ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 rounded-[8px] border border-rule bg-card px-3 py-2.5">
            <Search size={15} className="text-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search the kitchen"
              placeholder="Search the kitchen"
              className="w-full bg-transparent text-sm outline-none placeholder:text-soft"
            />
          </div>

          {inventory.length === 0 ? (
            <EmptyState
              title="No groceries"
              body="Scan or add groceries to track freshness and cook from what you own."
              action={
                <Link to="/scan" className="mt-2">
                  <TagButton>
                    <ScanLine size={15} /> Scan a grocery
                  </TagButton>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {inventory.map((item) => (
                <div key={item.id} className="space-y-2">
                  <GroceryPackage
                    item={item}
                    flag={getFreshness(item).daysLeft < 1}
                    footer={
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <ActionPill
                          onClick={() => consumeItem(item.id, 1)}
                          icon={<Check size={12} />}
                        >
                          Used 1
                        </ActionPill>
                        <ActionPill onClick={() => setEditing(item)} icon={<Pencil size={12} />}>
                          Edit
                        </ActionPill>
                        <ActionPill
                          onClick={() => {
                            setDiscarding(item);
                            setReason(DISCARD_REASONS[0]);
                          }}
                          icon={<Recycle size={12} />}
                        >
                          Discard
                        </ActionPill>
                        <ActionPill
                          danger
                          onClick={() => removeItem(item.id)}
                          icon={<Trash2 size={12} />}
                        >
                          Remove
                        </ActionPill>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <PackageCard className="flex items-center justify-between p-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-soft">
              In view
            </span>
            <span className="max-w-[60%] truncate text-right font-mono text-[11px] text-ink">
              {guide}
            </span>
          </PackageCard>

          <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
            <div className="flex gap-1.5">
              <LetterButton active={letter === null} onClick={() => setLetter(null)}>
                All
              </LetterButton>
              {LETTERS.map((entry) => (
                <LetterButton
                  key={entry}
                  active={letter === entry}
                  disabled={!counted[entry]}
                  onClick={() => setLetter(entry)}
                >
                  {entry}
                </LetterButton>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Chip active={bucket === null} onClick={() => setBucket(null)}>
              Any freshness
            </Chip>
            {FRESHNESS_BUCKETS.map(({ id, label }) => (
              <Chip key={id} active={bucket === id} onClick={() => setBucket(id)}>
                {label}
              </Chip>
            ))}
          </div>

          <p className="text-[11px] leading-relaxed text-soft">
            Windows are estimates from food type, storage and dates — not guaranteed expiry. Always
            check the food itself.
          </p>

          {alphabetical.length === 0 ? (
            <PackageCard className="p-5 text-sm text-soft">No items match this filter.</PackageCard>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {alphabetical.map((item) => (
                <GroceryPackage key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      <EditSheet
        editing={editing}
        onClose={() => setEditing(null)}
        onSave={(item) => {
          updateItem(item.id, item);
          setEditing(null);
        }}
        onChange={setEditing}
      />

      {discarding ? (
        <Sheet onClose={() => setDiscarding(null)} label="Record waste">
          <ShelfStrip>Record waste</ShelfStrip>
          <p className="text-sm text-soft">
            {discarding.name} · {discarding.quantity} {discarding.unit}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DISCARD_REASONS.map((option) => (
              <Chip key={option} active={reason === option} onClick={() => setReason(option)}>
                {option}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <TagButton variant="outline" full onClick={() => setDiscarding(null)}>
              Cancel
            </TagButton>
            <TagButton
              variant="ink"
              full
              onClick={() => {
                discardItem({
                  name: discarding.name,
                  quantity: discarding.quantity,
                  unit: discarding.unit,
                  reason,
                });
                removeItem(discarding.id);
                setDiscarding(null);
              }}
            >
              Record
            </TagButton>
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}

function ActionPill({
  children,
  icon,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center gap-1 rounded-[6px] border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] transition ${
        danger
          ? "border-tag-red/40 text-tag-red hover:bg-tag-red/5"
          : "border-rule text-soft hover:border-ink hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function LetterButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`tabular h-10 w-10 shrink-0 rounded-[6px] border font-mono text-[12px] font-semibold transition ${
        active
          ? "border-ink bg-ink text-ground"
          : disabled
            ? "border-rule/50 text-soft/40"
            : "border-rule bg-card text-soft hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EditSheet({
  editing,
  onClose,
  onSave,
  onChange,
}: {
  editing: GroceryItem | null;
  onClose: () => void;
  onSave: (item: GroceryItem) => void;
  onChange: (item: GroceryItem) => void;
}) {
  if (!editing) return null;
  return (
    <Sheet onClose={onClose} label={editing.name}>
      <ShelfStrip>{editing.name}</ShelfStrip>
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Quantity"
          type="number"
          min={0}
          value={editing.quantity}
          onChange={(event) => onChange({ ...editing, quantity: Number(event.target.value) || 0 })}
        />
        <Field
          label="Unit"
          value={editing.unit}
          onChange={(event) => onChange({ ...editing, unit: event.target.value })}
        />
      </div>
      <div>
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-soft">
          Storage
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STORAGE_OPTIONS.map((option) => (
            <Chip
              key={option}
              active={editing.storage === option}
              onClick={() => onChange({ ...editing, storage: option })}
            >
              {option}
            </Chip>
          ))}
        </div>
      </div>
      <Field
        label="Printed expiry"
        hint="optional"
        type="date"
        value={editing.expiryDate ?? ""}
        onChange={(event) => onChange({ ...editing, expiryDate: event.target.value || undefined })}
      />
      <div className="flex gap-2">
        <TagButton variant="outline" full onClick={onClose}>
          Cancel
        </TagButton>
        <TagButton full onClick={() => onSave(editing)}>
          Save
        </TagButton>
      </div>
    </Sheet>
  );
}

function Sheet({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose: () => void;
  label: string;
}) {
  return (
    <Dialog open onClose={onClose} label={label}>
      {children}
    </Dialog>
  );
}
