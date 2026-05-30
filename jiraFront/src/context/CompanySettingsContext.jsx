import { createContext, useContext, useState } from 'react';

const CompanySettingsContext = createContext(null);
const DEFAULT_LOGO = '/images/axira_logo.svg';
const DEFAULT_NAME = '';
const STORAGE_KEY = 'jira_company_logo';
const NAME_STORAGE_KEY = 'jira_company_name';

export function CompanySettingsProvider({ children }) {
    const [companyLogo, setCompanyLogoState] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_LOGO;
    });

    const [companyName, setCompanyNameState] = useState(() => {
        return localStorage.getItem(NAME_STORAGE_KEY) || DEFAULT_NAME;
    });

    const setCompanyLogo = (logo) => {
        setCompanyLogoState(logo);
        localStorage.setItem(STORAGE_KEY, logo);
    };

    const resetCompanyLogo = () => {
        setCompanyLogoState(DEFAULT_LOGO);
        localStorage.removeItem(STORAGE_KEY);
    };

    const setCompanyName = (name) => {
        setCompanyNameState(name);
        localStorage.setItem(NAME_STORAGE_KEY, name);
    };

    return (
        <CompanySettingsContext.Provider value={{ companyLogo, setCompanyLogo, resetCompanyLogo, companyName, setCompanyName }}>
            {children}
        </CompanySettingsContext.Provider>
    );
}

export function useCompanySettings() {
    const ctx = useContext(CompanySettingsContext);
    if (!ctx) throw new Error('useCompanySettings must be used inside CompanySettingsProvider');
    return ctx;
}
