import { useState } from 'react';
import { IoBusinessOutline, IoImageOutline, IoRefreshOutline, IoSaveOutline } from 'react-icons/io5';
import { useCompanySettings } from '../../context/CompanySettingsContext';

export default function AdminSettings() {
    const { companyLogo, setCompanyLogo, resetCompanyLogo, companyName, setCompanyName } = useCompanySettings();
    const [previewLogo, setPreviewLogo] = useState(companyLogo);
    const [logoUrl, setLogoUrl] = useState('');
    const [nameInput, setNameInput] = useState(companyName);
    const [message, setMessage] = useState('');

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setPreviewLogo(String(reader.result));
            setMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleUrlPreview = () => {
        if (!logoUrl.trim()) return;
        setPreviewLogo(logoUrl.trim());
        setMessage('');
    };

    const handleSave = () => {
        setCompanyLogo(previewLogo);
        setCompanyName(nameInput.trim());
        setMessage('Company settings updated successfully.');
    };

    const handleReset = () => {
        resetCompanyLogo();
        setPreviewLogo('/images/axira_logo.svg');
        setLogoUrl('');
        setNameInput('');
        setCompanyName('');
        setMessage('Company settings reset to default.');
    };

    return (
        <main className="admin-page">
            <div className="admin-header">
                <div>
                    <h1>Settings</h1>
                    <p>Update branding for the admin and user workspace.</p>
                </div>
            </div>

            <section className="admin-panel admin-form-panel">
                <div className="admin-panel-title">
                    <IoBusinessOutline />
                    <h2>Company Details</h2>
                </div>

                {message && <div className="admin-success">{message}</div>}

                <div className="admin-user-form" style={{ marginBottom: '1.5rem' }}>
                    <div className="create-issue-field">
                        <label>Company Name</label>
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(event) => setNameInput(event.target.value)}
                            placeholder="Enter company name"
                        />
                    </div>
                </div>

                <div className="admin-panel-title" style={{ marginBottom: '1rem' }}>
                    <IoImageOutline />
                    <h2>Company Logo</h2>
                </div>

                <div className="admin-logo-settings">
                    <div className="admin-logo-preview">
                        <img src={previewLogo} alt="Company logo preview" />
                    </div>

                    <div className="admin-user-form">
                        <div className="create-issue-field">
                            <label>Upload Logo</label>
                            <input type="file" accept="image/*" onChange={handleFile} />
                        </div>

                        <div className="create-issue-field">
                            <label>Logo URL</label>
                            <div className="admin-logo-url-row">
                                <input
                                    type="url"
                                    value={logoUrl}
                                    onChange={(event) => setLogoUrl(event.target.value)}
                                    placeholder="https://example.com/logo.svg"
                                />
                                <button type="button" className="btn-secondary" onClick={handleUrlPreview}>
                                    Preview
                                </button>
                            </div>
                        </div>

                        <div className="create-issue-actions">
                            <button type="button" className="btn-secondary" onClick={handleReset}>
                                <IoRefreshOutline /> Reset
                            </button>
                            <button type="button" className="btn-primary" onClick={handleSave}>
                                <IoSaveOutline /> Save
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
