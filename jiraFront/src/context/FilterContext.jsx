import { createContext, useContext, useMemo, useState } from 'react';

const FilterContext = createContext(null);

const INITIAL = { search: '', types: [], priorities: [], assigneeIds: [] };

export function FilterProvider({ children }) {
    const [filters, setFilters] = useState(INITIAL);

    const value = useMemo(() => ({ filters, setFilters }), [filters]);

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error('useFilter must be used inside FilterProvider');
    return ctx;
}
