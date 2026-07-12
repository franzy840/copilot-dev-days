import { useEffect, useRef, useState } from 'react';

interface Props {
  id: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

/** Accessible custom dropdown (button + listbox) with optional in-panel filtering for long option lists. */
export default function Select({ id, value, options, placeholder = 'Choose…', onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showFilter = options.length > 7;
  const filtered = showFilter && filter ? options.filter((o) => o.toLowerCase().includes(filter.toLowerCase())) : options;

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setFilter('');
      setHighlight(Math.max(0, options.indexOf(value)));
      (showFilter ? filterRef.current : rootRef.current?.querySelector('button'))?.focus();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listRef.current?.children[highlight]?.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  function commit(option: string) {
    onChange(option);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) commit(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="dd-root" ref={rootRef}>
      <button
        type="button"
        id={id}
        className="dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={value ? '' : 'dd-placeholder'}>{value || placeholder}</span>
        <svg className="dd-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="dd-panel" role="presentation">
          {showFilter && (
            <input
              ref={filterRef}
              className="dd-filter"
              type="text"
              value={filter}
              placeholder="Type to filter…"
              onChange={(e) => {
                setFilter(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onKeyDown}
            />
          )}
          <ul className="dd-list" role="listbox" ref={listRef} tabIndex={-1} onKeyDown={onKeyDown}>
            {filtered.length === 0 && <li className="dd-empty">No matches</li>}
            {filtered.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={opt === value}
                className={'dd-option' + (i === highlight ? ' dd-highlight' : '') + (opt === value ? ' dd-selected' : '')}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(opt)}
              >
                <span>{opt}</span>
                {opt === value && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
