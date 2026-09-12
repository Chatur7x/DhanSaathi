"use client";

import { Search, Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { searchTickers, type TickerSearchResult } from "@/lib/api";

interface TickerSearchProps {
  onSelect: (ticker: TickerSearchResult) => void;
  isAdded?: (symbol: string) => boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export function TickerSearch({ onSelect, isAdded, placeholder = "Search stocks, crypto, indices…", autoFocus = false, onFocusChange }: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) return;
    const timer = setTimeout(() => {
      setSearching(true);
      searchTickers(q)
        .then((rows) => {
          setResults(Array.isArray(rows) ? rows : []);
          setHighlight(0);
          setFailed(false);
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
          setFailed(true);
          setOpen(true);
        })
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        onFocusChange?.(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onFocusChange]);

  const choose = (t: TickerSearchResult) => {
    onSelect(t);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && open && results[highlight]) {
      e.preventDefault();
      choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      <input
        ref={inputRef}
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          if (v.trim().length === 0) {
            setResults([]);
            setOpen(false);
            setFailed(false);
          }
        }}
        onFocus={() => { if (results.length > 0 || failed) setOpen(true); onFocusChange?.(true); }}
        onBlur={() => onFocusChange?.(false)}
        onKeyDown={onKey}
        placeholder={placeholder}
        aria-label="Search tickers"
        role="combobox"
        aria-expanded={open}
        aria-controls="ticker-search-list"
        aria-autocomplete="list"
        className="w-full bg-card border border-border rounded-2xl pl-10 pr-9 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 outline-none transition-colors"
      />
      {query ? (
        <button
          onClick={() => { setQuery(""); setResults([]); setOpen(false); }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={15} />
        </button>
      ) : null}
      <AnimatePresence>
      {open && (
        <motion.div
          id="ticker-search-list"
          role="listbox"
          initial={{ opacity: 0, y: -6, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.99 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-popover shadow-[var(--paper-shadow)] overflow-hidden z-30 max-h-72 overflow-y-auto"
        >
          {searching && results.length === 0 ? (
            <div className="px-4 py-3 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 rounded-lg bg-muted animate-shimmer" />
              ))}
            </div>
          ) : failed ? (
            <p className="px-4 py-3.5 text-[13px] text-muted-foreground">Search unavailable — check your connection and try again.</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3.5 text-[13px] text-muted-foreground">No matches for “{query.trim()}”.</p>
          ) : (
            results.map((t, i) => {
              const added = isAdded?.(t.symbol) ?? false;
              return (
                <motion.button
                  key={`${t.yahooSymbol}-${i}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.18), type: "spring", stiffness: 450, damping: 30 }}
                  onClick={() => choose(t)}
                  onMouseEnter={() => setHighlight(i)}
                  role="option"
                  aria-selected={i === highlight}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === highlight ? "bg-accent" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate">{t.symbol}</span>
                    <span className="block text-xs text-muted-foreground truncate">{t.name}{t.exchange ? ` · ${t.exchange}` : ""}</span>
                  </span>
                  <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold ${added ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
                    {added ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}
                  </span>
                </motion.button>
              );
            })
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
