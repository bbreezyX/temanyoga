"use client";

import { ImageIcon, Plus, Printer, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getDimensions } from "../../../scripts/poster/lib/sizes";
import type { DetailLine, EventCatalogData } from "../../../scripts/poster/lib/types";
import { EventCatalogPoster } from "../../../scripts/poster/templates/EventCatalogPoster";

interface Item {
  id: string;
  name: string;
  description: string;
  photo: string | null; // data URL
}

interface PosterState {
  heading: string;
  brandTag: string;
  subtitle: string;
  tagline: string;
  intro: string;
  items: Item[];
  logo: string | null;
  logoPos: { x: number; y: number };
  logoSize: number;
  detailTitle: string;
  details: DetailLine[];
  inspirationTitle: string;
  inspiration: string;
}

const FONTS =
  "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Caveat:wght@500;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600;1,700&family=Anton&family=Archivo:wght@400;500;600;700;800&display=swap";

const STYLE = `
.poster-scroll { scrollbar-width: thin; scrollbar-color: #d8cab7 transparent; }
.poster-scroll::-webkit-scrollbar { width: 9px; height: 9px; }
.poster-scroll::-webkit-scrollbar-track { background: transparent; }
.poster-scroll::-webkit-scrollbar-thumb {
  background: #d8cab7; border-radius: 9999px;
  border: 2px solid transparent; background-clip: content-box;
}
.poster-scroll::-webkit-scrollbar-thumb:hover { background: #c0ab90; background-clip: content-box; }
[data-poster-logo] { cursor: grab; touch-action: none; }
[data-poster-logo]:active { cursor: grabbing; }
[data-poster-logo-resize] { cursor: nwse-resize; touch-action: none; }
@media print {
  @page { size: 297mm 420mm; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body * { visibility: hidden !important; }
  .poster-print, .poster-print * { visibility: visible !important; }
  .poster-print { position: fixed !important; left: 0 !important; top: 0 !important; transform: none !important; }
  .poster-controls { display: none !important; }
  .logo-placeholder, .logo-handle { display: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}`;

let seq = 100;
const newId = () => String(seq++);

const DEFAULT_ITEMS: Item[] = [
  { id: "1", name: "Surya Tadasana Ready", description: "Energi pagi, siap yoga", photo: null },
  { id: "2", name: "Chandra Shanti Pose", description: "Tenang seperti malam", photo: null },
  { id: "3", name: "Vayu Sukhasana Smile", description: "Ringan, ceria, bebas", photo: null },
  { id: "4", name: "Anahata Anjali Mudra", description: "Penuh cinta & ketenangan", photo: null },
  { id: "5", name: "Arjuna Dhyana", description: "Fokus, tenang, bijak", photo: null },
  { id: "6", name: "Shiva Pranam Mudra", description: "Spiritual, kuat, dalam", photo: null },
  { id: "7", name: "Agni Surya Namaskar", description: "Energik, hangat, aktif", photo: null },
  { id: "8", name: "Rishi Shanti Pose", description: "Bijak, tenang, damai", photo: null },
];

const DEFAULTS: PosterState = {
  heading: "KATALOG",
  brandTag: "#temanyoga",
  subtitle: "Teman Baik Yoga – Boneka Rajut Yoga",
  tagline: "Aku menghirup kedamaian. Aku tenang. Aku merasa cukup.",
  intro:
    "Teman kecil handmade untuk menemani mat yoga dan momen meditasimu. Poseable, bisa diatur sesuai pose favoritmu. Ekspresi tenang dengan tangan anjali mudra bikin hati langsung adem.",
  items: DEFAULT_ITEMS,
  logo: null,
  logoPos: { x: 86, y: 10 },
  logoSize: 30,
  detailTitle: "Detail",
  details: [
    { label: "Bahan", value: "Benang polychery 100% polyester vegan-friendly, isi dakron, aksesoris manik." },
    { label: "Ukuran", value: "15–17 cm" },
    { label: "Fitur", value: "Dilengkapi mini yoga mat rajut" },
  ],
  inspirationTitle: "Inspirasi",
  inspiration:
    "Terinspirasi dari yogini di seluruh dunia yang percaya bahwa yoga adalah tentang hadir dan menerima diri sendiri apa adanya.",
};

// --- tiny IndexedDB key/value (handles large photo data URLs) ---
const DB_NAME = "poster-maker";
const STORE = "kv";
const KEY = "state";

function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    const open = indexedDB.open(DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore(STORE);
    open.onsuccess = () => {
      const tx = open.result.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => resolve(null);
    };
    open.onerror = () => resolve(null);
  });
}
const idbGet = () => withStore<PosterState>("readonly", (s) => s.get(KEY));
const idbSet = (v: PosterState) => withStore("readwrite", (s) => s.put(v, KEY));
const idbClear = () => withStore("readwrite", (s) => s.delete(KEY));

function readFile(file: File, cb: (url: string) => void) {
  const r = new FileReader();
  r.onload = () => cb(r.result as string);
  r.readAsDataURL(file);
}

function Range({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-neutral-500">
        <span>{label}</span>
        <span className="tabular-nums">
          {Math.round(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100";
const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500";
const sectionTitleCls = "text-xs font-bold uppercase tracking-wider text-neutral-400";

export default function PosterMakerPage() {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [scale, setScale] = useState(0.5);
  const previewRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const dragMode = useRef<"move" | "resize" | null>(null);

  const [s, setS] = useState<PosterState>(DEFAULTS);
  const set = <K extends keyof PosterState>(key: K, value: PosterState[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));
  const sRef = useRef(s);
  sRef.current = s;

  // mount + load saved state
  useEffect(() => {
    setMounted(true);
    idbGet().then((saved) => {
      if (saved) setS({ ...DEFAULTS, ...saved });
      setLoaded(true);
    });
  }, []);

  // autosave (debounced)
  useEffect(() => {
    if (!loaded) return;
    setStatus("saving");
    const t = setTimeout(() => {
      idbSet(s).then(() => setStatus("saved"));
    }, 500);
    return () => clearTimeout(t);
  }, [loaded, s]);

  // fit preview to available width
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const posterWpx = (297 * 96) / 25.4;
    const update = () => setScale(Math.min(1, el.clientWidth / posterWpx));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  // drag the logo badge in the preview → store position as % of the poster
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const box = printRef.current;
      if (!dragMode.current || !box) return;
      const r = box.getBoundingClientRect();
      if (dragMode.current === "move") {
        const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
        setS((prev) => ({ ...prev, logoPos: { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } }));
      } else {
        // resize: width from horizontal distance to the logo center (% of poster → mm)
        const centerX = r.left + (sRef.current.logoPos.x / 100) * r.width;
        const widthPx = Math.abs(e.clientX - centerX) * 2;
        const size = Math.min(80, Math.max(12, Math.round((widthPx / r.width) * 303)));
        setS((prev) => ({ ...prev, logoSize: size }));
      }
    };
    const up = () => (dragMode.current = null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const onPosterPointerDown = (e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-poster-logo-resize]")) {
      e.preventDefault();
      dragMode.current = "resize";
    } else if (t.closest("[data-poster-logo]")) {
      e.preventDefault();
      dragMode.current = "move";
    }
  };

  const base = getDimensions("A3", "portrait");
  const dims = { ...base, full: base.trim, bleed: 0, contentInset: base.safe };

  const data: EventCatalogData = {
    size: "A3",
    orientation: "portrait",
    columns: 4,
    brandTag: s.brandTag,
    logoPos: s.logoPos,
    logoSize: s.logoSize,
    heading: s.heading,
    subtitle: s.subtitle,
    tagline: s.tagline,
    intro: s.intro,
    items: s.items.map((it, i) => ({ photo: `p${i}`, name: it.name, tag: it.description || undefined })),
    detailTitle: s.detailTitle,
    details: s.details,
    inspirationTitle: s.inspirationTitle,
    inspiration: s.inspiration,
  };
  const photos = Object.fromEntries(s.items.map((it, i) => [`p${i}`, it.photo]));

  const setItem = (id: string, patch: Partial<Item>) =>
    set("items", s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => set("items", [...s.items, { id: newId(), name: "", description: "", photo: null }]);
  const removeItem = (id: string) => set("items", s.items.filter((it) => it.id !== id));
  const setDetail = (i: number, patch: Partial<DetailLine>) =>
    set("details", s.details.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  const reset = () => {
    idbClear().then(() => setS(DEFAULTS));
  };

  const boxW = ((297 * 96) / 25.4) * scale;
  const boxH = ((420 * 96) / 25.4) * scale;

  const statusText =
    status === "saving" ? "Menyimpan…" : status === "saved" ? "Tersimpan otomatis" : "Tersimpan di browser ini";

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* React 19 hoists these into <head> */}
      <link rel="stylesheet" href={FONTS} />
      <style>{STYLE}</style>

      {/* sidebar */}
      <aside className="poster-controls flex w-full flex-col border-neutral-200 bg-[#FBF8F3] lg:h-screen lg:w-[440px] lg:shrink-0 lg:border-r">
        <div className="border-b border-neutral-200 bg-white px-5 py-4">
          <h1 className="text-base font-bold text-neutral-900">Poster Maker</h1>
          <p className="text-xs text-neutral-500">Katalog event · A3 portrait</p>
          <button
            onClick={() => window.print()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Printer size={16} /> Cetak / Simpan PDF
          </button>
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${status === "saving" ? "bg-amber-400" : "bg-emerald-400"}`} />
              {statusText}
            </span>
            <button onClick={reset} className="flex items-center gap-1 hover:text-neutral-700">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        <div className="poster-scroll flex-1 space-y-7 overflow-y-auto px-5 py-6 pb-20">
          {/* items */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className={sectionTitleCls}>Item</h2>
              <span className="text-[11px] text-neutral-400">{s.items.length} item</span>
            </div>
            {s.items.map((it, i) => (
              <div key={it.id} className="space-y-2.5 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-700">
                    {i + 1}
                  </span>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="flex items-center gap-1 text-xs text-neutral-400 transition hover:text-red-600"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
                <div>
                  <label className={labelCls}>Nama</label>
                  <input className={inputCls} value={it.name} onChange={(e) => setItem(it.id, { name: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Deskripsi singkat</label>
                  <input
                    className={inputCls}
                    value={it.description}
                    onChange={(e) => setItem(it.id, { description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                    {it.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={16} className="text-neutral-300" />
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <label className="w-fit cursor-pointer rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200">
                      {it.photo ? "Ganti foto" : "Pilih foto"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) readFile(f, (url) => setItem(it.id, { photo: url }));
                        }}
                      />
                    </label>
                    {it.photo && (
                      <button
                        onClick={() => setItem(it.id, { photo: null })}
                        className="text-xs text-neutral-400 hover:text-red-600"
                      >
                        Hapus foto
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addItem}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 py-2.5 text-sm font-medium text-neutral-500 transition hover:border-orange-400 hover:text-orange-600"
            >
              <Plus size={15} /> Tambah item
            </button>
          </section>

          {/* poster text */}
          <section className="space-y-3">
            <h2 className={sectionTitleCls}>Teks poster</h2>
            <div>
              <label className={labelCls}>Judul</label>
              <input className={inputCls} value={s.heading} onChange={(e) => set("heading", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Subjudul</label>
              <input className={inputCls} value={s.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input className={inputCls} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Intro</label>
              <textarea className={inputCls} rows={3} value={s.intro} onChange={(e) => set("intro", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Logo</label>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
                  {s.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={15} className="text-neutral-300" />
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <label className="w-fit cursor-pointer rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200">
                    {s.logo ? "Ganti logo" : "Pilih logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) readFile(f, (url) => set("logo", url));
                      }}
                    />
                  </label>
                  {s.logo && (
                    <button
                      onClick={() => set("logo", null)}
                      className="text-xs text-neutral-400 hover:text-red-600"
                    >
                      Hapus logo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2.5 rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-center justify-between">
                <span className={labelCls + " mb-0"}>Posisi & ukuran logo</span>
                <button
                  onClick={() => setS((p) => ({ ...p, logoPos: DEFAULTS.logoPos, logoSize: DEFAULTS.logoSize }))}
                  className="text-[11px] text-neutral-400 hover:text-neutral-700"
                >
                  Reset posisi
                </button>
              </div>
              <Range label="Horizontal" value={s.logoPos.x} min={0} max={100} suffix="%" onChange={(v) => set("logoPos", { ...s.logoPos, x: v })} />
              <Range label="Vertikal" value={s.logoPos.y} min={0} max={100} suffix="%" onChange={(v) => set("logoPos", { ...s.logoPos, y: v })} />
              <Range label="Ukuran" value={s.logoSize} min={12} max={80} suffix=" mm" onChange={(v) => set("logoSize", v)} />
              <p className="text-[11px] text-neutral-400">Atau seret logo langsung di preview.</p>
            </div>
          </section>

          {/* detail + inspiration */}
          <section className="space-y-3">
            <h2 className={sectionTitleCls}>Detail & Inspirasi</h2>
            {s.details.map((d, i) => (
              <div key={i} className="grid grid-cols-[7rem_1fr] gap-2">
                <input
                  className={`${inputCls} min-w-0`}
                  value={d.label}
                  onChange={(e) => setDetail(i, { label: e.target.value })}
                />
                <input
                  className={`${inputCls} min-w-0`}
                  value={d.value}
                  onChange={(e) => setDetail(i, { value: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className={labelCls}>Judul inspirasi</label>
              <input
                className={inputCls}
                value={s.inspirationTitle}
                onChange={(e) => set("inspirationTitle", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Teks inspirasi</label>
              <textarea
                className={inputCls}
                rows={3}
                value={s.inspiration}
                onChange={(e) => set("inspiration", e.target.value)}
              />
            </div>
          </section>

          <p className="text-[11px] leading-relaxed text-neutral-400">
            Tersimpan otomatis di browser ini (termasuk foto). Bersih saat ganti device atau hapus data browser.
          </p>
        </div>
      </aside>

      {/* preview */}
      <main className="poster-scroll flex flex-1 justify-center overflow-auto p-6 lg:h-screen">
        <div ref={previewRef} className="w-full max-w-[720px]">
          {mounted && (
            <div style={{ width: boxW, height: boxH, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.18)" }}>
              <div
                ref={printRef}
                onPointerDown={onPosterPointerDown}
                className="poster-print"
                style={{ width: "297mm", height: "420mm", transform: `scale(${scale})`, transformOrigin: "top left" }}
              >
                <EventCatalogPoster data={data} dims={dims} photos={photos} logo={s.logo} editable />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
