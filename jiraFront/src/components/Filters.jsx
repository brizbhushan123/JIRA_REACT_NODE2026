import { useRef, useState, useEffect } from 'react';
import { useAppMeta } from '../context/AppMetaContext';
import { useFilter } from '../context/FilterContext';

function FilterDropdown({ label, options, selected, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (value) =>
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        );

    return (
        <div className="filter-dropdown" ref={ref}>
            <button
                className={`filter-dropdown-btn ${selected.length > 0 ? 'active' : ''}`}
                onClick={() => setOpen((o) => !o)}
            >
                {label}
                {selected.length > 0 && (
                    <span className="filter-badge">{selected.length}</span>
                )}
                <span className={`filter-chevron ${open ? 'open' : ''}`}>▾</span>
            </button>

            {open && (
                <div className="filter-dropdown-panel">
                    {options.map((opt) => (
                        <label key={opt.value} className="filter-checkbox-item">
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.value)}
                                onChange={() => toggle(opt.value)}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Filters() {
    const { users } = useAppMeta();
    const { filters, setFilters } = useFilter();

    const hasFilters =
        filters.types.length > 0 ||
        filters.priorities.length > 0 ||
        filters.assigneeIds.length > 0;

    return (
        <div className="filters-bar">
            <FilterDropdown
                label="Type"
                options={[
                    { value: 'Story', label: 'Story' },
                    { value: 'Bug',   label: 'Bug' },
                    { value: 'Task',  label: 'Task' },
                    { value: 'Epic',  label: 'Epic' },
                ]}
                selected={filters.types}
                onChange={(types) => setFilters((f) => ({ ...f, types }))}
            />

            <FilterDropdown
                label="Priority"
                options={[
                    { value: 'Highest', label: 'Highest' },
                    { value: 'High',    label: 'High' },
                    { value: 'Medium',  label: 'Medium' },
                    { value: 'Low',     label: 'Low' },
                    { value: 'Lowest',  label: 'Lowest' },
                ]}
                selected={filters.priorities}
                onChange={(priorities) => setFilters((f) => ({ ...f, priorities }))}
            />

            <FilterDropdown
                label="Assignee"
                options={users.map((u) => ({
                    value: String(u.id),
                    label: u.displayName || u.username,
                }))}
                selected={filters.assigneeIds}
                onChange={(assigneeIds) => setFilters((f) => ({ ...f, assigneeIds }))}
            />

            {hasFilters && (
                <button
                    className="clear-filters-btn"
                    onClick={() =>
                        setFilters((f) => ({
                            ...f,
                            types:       [],
                            priorities:  [],
                            assigneeIds: [],
                        }))
                    }
                >
                    Clear filters
                </button>
            )}
        </div>
    );
}
