import React, { useState, useEffect } from 'react';
import { articles as articlesData, Article } from '../data/articles';
import { XIcon, TrashIcon } from './Icons';

// --- SEED DATA ---
// This data will be used to populate the CMS on first load if no data exists in localStorage.
const defaultAboutPageContent = {
  mission: "Providing accessible and reliable health solutions using smart technology in a placid environment and in collaboration with our purpose-driven staff.",
  vision: "To be a distinguished leader in premium health solutions around the globe, recognized for our commitment to authenticity and innovation.",
  teamMembers: [
    { name: 'Dr. Kingsley Emeka (CEO)', title: 'Founder & Chief Pharmacist', bio: 'With over 20 years of experience in the pharmaceutical industry, Dr. Okoro founded Kingzy Pharma to make healthcare accessible to all Nigerians.', imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769975052/kngzyceo_jc7dpl.jpg' },
    { name: 'Tunde Adebayo', title: 'Head of Operations', bio: 'Tunde is a logistics expert who ensures that your orders are processed efficiently and delivered on time, every time.', imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769541476/guy1_w46lys.jpg' },
    { name: 'Chiamaka Nwosu', title: 'Lead Technologist', bio: 'Chiamaka leads the tech team, building the innovative platform that powers Kingzy Pharma with a focus on user experience.', imageUrl: 'https://res.cloudinary.com/dzbibbld6/image/upload/v1769541475/lady2_qfoh5b.jpg' }
  ],
  coreValues: [
    { title: 'Integrity', description: 'We maintain the highest ethical standards in all our pharmaceutical dealings.' },
    { title: 'Quality', description: 'We source only authentic medications from certified manufacturers.' },
    { title: 'Efficiency', description: 'Using technology to streamline healthcare delivery across the nation.' },
    { title: 'Safety', description: 'Your health is our priority; we never compromise on drug safety protocols.' }
  ]
};

const defaultMirevaPageContent = {
    hero: { title: "Mireva Diagnostic Excellence", subtitle: "Advanced laboratory services powered by Kingzy Pharmaceuticals. Precision diagnostics for a healthier you.", imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769976731/medical_lab_hephke.jpg" },
    intro: { heading: "World-Class Diagnostic Solutions", subheading: "At Mireva Diagnostics, we believe that accurate diagnosis is the cornerstone of effective healthcare. We utilize state-of-the-art automated systems to deliver fast, reliable, and precise results." },
    features: [
        { title: "Automated Processing", description: "Minimizing human error through advanced robotic sample handling and analysis." },
        { title: "Home Sample Collection", description: "Qualified phlebotomists can visit your home or office for painless sample extraction." },
        { title: "Digital Results Hub", description: "Access your reports securely through our online portal or get them delivered via WhatsApp/Email." },
    ],
    testTypes: [
        { title: "Comprehensive Wellness", tests: ["Full Blood Count (FBC)", "Lipid Profile", "Kidney Function Test", "Liver Function Test"], icon: "🔬", color: "bg-blue-50 text-blue-700" },
        { title: "Specialized Screening", tests: ["HBA1C (Diabetes)", "Thyroid Profile (T3, T4, TSH)", "Tumor Markers", "Hormonal Assay"], icon: "🧪", color: "bg-purple-50 text-purple-700" },
        { title: "Infection & Immunity", tests: ["Malaria Parasite", "Typhoid (Widal)", "COVID-19 PCR/Rapid", "Hepatitis Screening"], icon: "🛡️", color: "bg-green-50 text-green-700" },
        { title: "Molecular & DNA", tests: ["Paternity Testing", "Genotype (Hemoglobin)", "Viral Load Testing", "Allergy Panels"], icon: "🧬", color: "bg-indigo-50 text-indigo-700" }
    ],
    cta: { heading: "Book Your Test Today", subheading: "Speak with our diagnostic coordinator to schedule your screening or request a home visit." }
};

const defaultPlusMembershipPageContent = {
    hero: { title: "Kingzy Platinum Cluster", subtitle: "The Gold Standard in Personalized Pharmaceutical Care & Service Excellence.", imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769978308/Image_fx_16_zbmeqr.jpg" },
    intro: { heading: "Experience Premium Healthcare", subheading: "The Kingzy Platinum Cluster is an exclusive membership designed for individuals and healthcare providers who demand nothing but the best. We combine smart technology with white-glove service to manage your health needs with unprecedented efficiency." },
    benefits: [
        { icon: "TruckIcon", title: "Priority Express Delivery", description: "Platinum members receive priority in our dispatch queue, ensuring your medications arrive faster than ever." },
        { icon: "PhoneIcon", title: "24/7 Dedicated Concierge", description: "Direct line to our senior pharmacists for medical guidance and order assistance at any time." },
        { icon: "ShieldCheckIcon", title: "Exclusive Quality Assurance", description: "Direct tracking of manufacturing batches for absolute peace of mind regarding drug safety and origin." },
        { icon: "ClipboardCheckIcon", title: "Custom Order Fulfillment", description: "Hard-to-find medications? Our global sourcing team works specifically for Platinum Cluster requests." }
    ],
    cta: { heading: "Elevate Your Health Journey", subheading: "Join the elite circle of Kingzy partners and enjoy benefits tailored for the modern healthcare professional.", buttonText: "JOIN THE PLATINUM CLUSTER" },
    partners: { heading: "Trusted by Premium Clinics Worldwide", logos: [
            { name: "Supreme Darmatologist", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977494/clinic4-removebg-preview_f2azqg.png" },
            { name: "Nigeria Medical Association", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977493/clinic2-removebg-preview_o5nu6e.png" },
            { name: "The Premier Specialist Medical Center", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977493/clinic3-removebg-preview_ohderf.png" },
            { name: "St. Marys", url: "https://res.cloudinary.com/dzbibbld6/image/upload/v1769977493/clinic1-removebg-preview_nbosky.png" },
    ]}
};

const defaultOffersPageContent = {
    labTest: { value: '15%', title: 'First Lab Test', description: 'Apply code MIREVA15 at checkout for your first Mireva diagnostic booking.' },
    homeCollection: { value: 'FREE', title: 'Home Collection', description: 'On all laboratory test orders above ₦50,000 within Lagos state.' },
    referral: { value: '₦1k', title: 'Referral Credit', description: 'Get ₦1,000 credit for every successful referral to Kingzy Platinum Cluster.' }
};

const CMS_DATA_KEY = 'kingzy_cms_content';

const seedData = {
    articles: articlesData,
    aboutPage: defaultAboutPageContent,
    mirevaPage: defaultMirevaPageContent,
    plusMembershipPage: defaultPlusMembershipPageContent,
    offersPage: defaultOffersPageContent
};


type CmsSection = 'dashboard' | 'articles' | 'aboutPage' | 'mirevaPage' | 'plusMembershipPage' | 'offersPage' | 'products';

interface CmsManagementProps {
    setActiveTab: (tab: 'inventory' | 'cms') => void;
}

const CmsManagement: React.FC<CmsManagementProps> = ({ setActiveTab }) => {
    const [activeSection, setActiveSection] = useState<CmsSection>('dashboard');
    const [cmsData, setCmsData] = useState<typeof seedData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const rawData = localStorage.getItem(CMS_DATA_KEY);
        if (rawData) {
            const parsed = JSON.parse(rawData);
            const validatedData = { ...seedData, ...parsed }; // Merge to ensure all keys exist
            setCmsData(validatedData);
        } else {
            setCmsData(seedData);
            localStorage.setItem(CMS_DATA_KEY, JSON.stringify(seedData));
        }
        setIsLoading(false);
    }, []);

    const handleSave = () => {
        if (cmsData) {
            localStorage.setItem(CMS_DATA_KEY, JSON.stringify(cmsData));
            alert("Content changes have been saved successfully!");
            window.dispatchEvent(new Event('storage')); // Notify other tabs/components
        }
    };
    
    const updateCmsSection = (section: keyof typeof seedData, data: any) => {
        setCmsData(prev => prev ? ({ ...prev, [section]: data }) : null);
    };
    
    const updateNestedField = (path: string, value: any) => {
        if (!cmsData) return;
        const keys = path.split('.');
        const newData = JSON.parse(JSON.stringify(cmsData)); // Deep copy
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setCmsData(newData);
    };

    const NavButton: React.FC<{ section: CmsSection; label: string; }> = ({ section, label }) => (
        <button onClick={() => setActiveSection(section)} className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${activeSection === section ? 'bg-brand-primary text-white' : 'hover:bg-gray-100'}`}>
            {label}
        </button>
    );

    const renderContent = () => {
        if (isLoading || !cmsData) return <p>Loading CMS data...</p>;

        switch(activeSection) {
            case 'dashboard': return <Dashboard setActiveSection={setActiveSection} setActiveTab={setActiveTab} />;
            case 'articles': return <ArticlesEditor articles={cmsData.articles} onUpdate={(d) => updateCmsSection('articles', d)} />;
            case 'aboutPage': return <AboutPageEditor data={cmsData.aboutPage} onUpdate={(d) => updateCmsSection('aboutPage', d)} />;
            case 'mirevaPage': return <MirevaPageEditor data={cmsData.mirevaPage} onUpdate={(d) => updateCmsSection('mirevaPage', d)} />;
            case 'plusMembershipPage': return <PlusMembershipPageEditor data={cmsData.plusMembershipPage} onUpdate={(d) => updateCmsSection('plusMembershipPage', d)} />;
            case 'offersPage': return <OffersPageEditor data={cmsData.offersPage} onUpdate={(path, value) => updateNestedField(path, value)} />;
            default: return <p>Select a section to edit.</p>;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border animate-fadeIn">
            <h2 className="text-xl font-bold text-brand-dark mb-6">Content Management System</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1 space-y-2">
                    <NavButton section="dashboard" label="CMS Dashboard" />
                    <NavButton section="articles" label="Health Insights (Blog)" />
                    <NavButton section="aboutPage" label="About Page" />
                    <NavButton section="mirevaPage" label="Mireva Diagnostics Page" />
                    <NavButton section="plusMembershipPage" label="Platinum Cluster Page" />
                    <NavButton section="offersPage" label="Special Offers Page" />
                </aside>

                <main className="md:col-span-3 bg-gray-50 p-6 rounded-lg border">
                    {activeSection !== 'dashboard' && (
                        <div className="flex justify-end mb-4">
                            <button onClick={handleSave} className="bg-accent-green text-white font-bold py-2 px-6 rounded-md hover:bg-green-600 transition-colors">
                                Save All Changes
                            </button>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const Dashboard: React.FC<{setActiveSection: (section: CmsSection) => void, setActiveTab: (tab: 'inventory') => void}> = ({setActiveSection, setActiveTab}) => (
    <div>
        <h3 className="text-lg font-bold text-brand-dark mb-4">Welcome to the CMS</h3>
        <p className="text-gray-600 mb-6">Select a page from the left to begin editing its content. All changes are saved locally in the browser. Click "Save All Changes" in any section to make your updates live.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setActiveSection('articles')} className="p-6 bg-white border rounded-lg hover:shadow-lg transition-shadow text-left"><h4 className="font-bold text-brand-primary">Manage Articles</h4><p className="text-sm text-gray-500 mt-1">Create, edit, and delete health insight blog posts.</p></button>
            <button onClick={() => setActiveTab('inventory')} className="p-6 bg-white border rounded-lg hover:shadow-lg transition-shadow text-left"><h4 className="font-bold text-brand-primary">Manage Products</h4><p className="text-sm text-gray-500 mt-1">Go to the product & inventory hub to update product details.</p></button>
            <button onClick={() => setActiveSection('aboutPage')} className="p-6 bg-white border rounded-lg hover:shadow-lg transition-shadow text-left"><h4 className="font-bold text-brand-primary">Edit About Page</h4><p className="text-sm text-gray-500 mt-1">Update mission, vision, team members, and core values.</p></button>
            <button onClick={() => setActiveSection('offersPage')} className="p-6 bg-white border rounded-lg hover:shadow-lg transition-shadow text-left"><h4 className="font-bold text-brand-primary">Edit Special Offers</h4><p className="text-sm text-gray-500 mt-1">Change the promotions displayed on the offers page.</p></button>
        </div>
    </div>
);

// --- Articles Editor ---
const ArticlesEditor: React.FC<{ articles: Article[], onUpdate: (data: Article[]) => void }> = ({ articles, onUpdate }) => {
    const [editingArticle, setEditingArticle] = useState<Article | 'new' | null>(null);

    const handleSave = (articleToSave: Article) => {
        let updatedArticles;
        if (articles.some(a => a.id === articleToSave.id)) {
            updatedArticles = articles.map(a => a.id === articleToSave.id ? articleToSave : a);
        } else {
            updatedArticles = [...articles, articleToSave];
        }
        onUpdate(updatedArticles);
        setEditingArticle(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            onUpdate(articles.filter(a => a.id !== id));
        }
    };
    
    const ArticleForm = ({ article, onSave, onCancel }: { article: Article | 'new', onSave: (data: Article) => void, onCancel: () => void }) => {
        const isNew = article === 'new';
        const [formState, setFormState] = useState<Article>(isNew ? { id: `article-${Date.now()}`, title: '', summary: '', imageUrl: '', content: '', author: '', publishedDate: new Date().toISOString().split('T')[0] } : article);
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState({...formState, [e.target.name]: e.target.value });
        return (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg w-full max-w-2xl"><form onSubmit={(e) => { e.preventDefault(); onSave(formState); }}><div className="p-4 border-b"><h3 className="font-bold">{isNew ? 'New Article' : 'Edit Article'}</h3></div><div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <input name="title" value={formState.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" required/>
                <input name="author" value={formState.author} onChange={handleChange} placeholder="Author" className="w-full p-2 border rounded" required/>
                <input name="imageUrl" value={formState.imageUrl} onChange={handleChange} placeholder="Image URL" className="w-full p-2 border rounded" required/>
                <textarea name="summary" value={formState.summary} onChange={handleChange} placeholder="Summary" className="w-full p-2 border rounded" rows={3} required/>
                <textarea name="content" value={formState.content} onChange={handleChange} placeholder="Full content..." className="w-full p-2 border rounded" rows={10} required/>
             </div><div className="p-3 bg-gray-50 flex justify-end gap-3"><button type="button" onClick={onCancel}>Cancel</button><button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Save</button></div></form></div></div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-brand-dark">Health Insights Articles</h3><button onClick={() => setEditingArticle('new')} className="bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-md">New Article</button></div>
            <div className="space-y-2">{articles.map(article => (<div key={article.id} className="bg-white p-3 rounded-md border flex justify-between items-center"><div><p className="font-semibold">{article.title}</p><p className="text-xs text-gray-500">{article.author}</p></div><div className="space-x-2"><button onClick={() => setEditingArticle(article)} className="text-blue-600 text-sm font-semibold">Edit</button><button onClick={() => handleDelete(article.id)} className="text-red-600 text-sm font-semibold"><TrashIcon className="w-4 h-4 inline-block" /></button></div></div>))}</div>
            {editingArticle && <ArticleForm article={editingArticle} onSave={handleSave} onCancel={() => setEditingArticle(null)} />}
        </div>
    );
};

// --- About Page Editor ---
const AboutPageEditor: React.FC<{ data: typeof defaultAboutPageContent, onUpdate: (data: any) => void }> = ({ data, onUpdate }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onUpdate({ ...data, [e.target.name]: e.target.value });
    const handleListChange = (listName: 'teamMembers' | 'coreValues', index: number, field: string, value: string) => {
        const newList = [...data[listName]];
        newList[index] = { ...newList[index], [field]: value };
        onUpdate({ ...data, [listName]: newList });
    };
    const handleAdd = (listName: 'teamMembers' | 'coreValues') => {
        const newItem = listName === 'teamMembers' ? { name: '', title: '', bio: '', imageUrl: '' } : { title: '', description: '' };
        onUpdate({ ...data, [listName]: [...data[listName], newItem] });
    };
    const handleRemove = (listName: 'teamMembers' | 'coreValues', index: number) => {
        if (window.confirm("Are you sure?")) {
            const newList = data[listName].filter((_, i) => i !== index);
            onUpdate({ ...data, [listName]: newList });
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-brand-dark">About Page Content</h3>
            <fieldset className="p-4 border rounded-lg space-y-2"><legend className="font-semibold px-2">Mission & Vision</legend>
                <div><label className="text-sm font-bold">Mission</label><textarea name="mission" value={data.mission} onChange={handleChange} className="w-full p-2 border rounded" rows={3} /></div>
                <div><label className="text-sm font-bold">Vision</label><textarea name="vision" value={data.vision} onChange={handleChange} className="w-full p-2 border rounded" rows={3} /></div>
            </fieldset>
            <fieldset className="p-4 border rounded-lg"><legend className="font-semibold px-2">Core Values</legend>
                <div className="space-y-3">{data.coreValues.map((v, i) => (<div key={i} className="p-2 border rounded bg-white grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                    <input value={v.title} onChange={e => handleListChange('coreValues', i, 'title', e.target.value)} placeholder="Title" className="w-full p-1 border rounded" />
                    <textarea value={v.description} onChange={e => handleListChange('coreValues', i, 'description', e.target.value)} placeholder="Description" className="w-full p-1 border rounded md:col-span-2" rows={2} />
                    <button onClick={() => handleRemove('coreValues', i)} className="text-red-500 text-xs font-bold justify-self-end">Remove</button>
                </div>))}<button onClick={() => handleAdd('coreValues')} className="mt-3 text-sm font-bold text-blue-600">Add Value</button>
            </fieldset>
            <fieldset className="p-4 border rounded-lg"><legend className="font-semibold px-2">Team Members</legend>
                <div className="space-y-3">{data.teamMembers.map((m, i) => (<div key={i} className="p-2 border rounded bg-white space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         <input value={m.name} onChange={e => handleListChange('teamMembers', i, 'name', e.target.value)} placeholder="Name" className="w-full p-1 border rounded" />
                         <input value={m.title} onChange={e => handleListChange('teamMembers', i, 'title', e.target.value)} placeholder="Title" className="w-full p-1 border rounded" />
                    </div>
                    <input value={m.imageUrl} onChange={e => handleListChange('teamMembers', i, 'imageUrl', e.target.value)} placeholder="Image URL" className="w-full p-1 border rounded" />
                    <textarea value={m.bio} onChange={e => handleListChange('teamMembers', i, 'bio', e.target.value)} placeholder="Bio" className="w-full p-1 border rounded" rows={2} />
                    <button onClick={() => handleRemove('teamMembers', i)} className="text-red-500 text-xs font-bold">Remove Member</button>
                </div>))}<button onClick={() => handleAdd('teamMembers')} className="mt-3 text-sm font-bold text-blue-600">Add Member</button>
            </fieldset>
        </div>
    );
};


// --- Mireva Page Editor ---
const MirevaPageEditor: React.FC<{ data: typeof defaultMirevaPageContent, onUpdate: (data: any) => void }> = ({ data, onUpdate }) => {
    const handleNestedChange = (path: string, value: string) => {
        const keys = path.split('.');
        const newData = JSON.parse(JSON.stringify(data));
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
        current[keys[keys.length - 1]] = value;
        onUpdate(newData);
    };
    return ( <div className="space-y-6"><h3 className="text-lg font-bold">Mireva Page</h3>
        <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Hero</legend>
            <div><label>Title</label><input value={data.hero.title} onChange={e => handleNestedChange('hero.title', e.target.value)} className="w-full p-1 border rounded"/></div>
            <div><label>Subtitle</label><input value={data.hero.subtitle} onChange={e => handleNestedChange('hero.subtitle', e.target.value)} className="w-full p-1 border rounded"/></div>
            <div><label>Image URL</label><input value={data.hero.imageUrl} onChange={e => handleNestedChange('hero.imageUrl', e.target.value)} className="w-full p-1 border rounded"/></div>
        </fieldset>
         {/* Simple list editor for features */}
        <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Features</legend>
             {data.features.map((feat, i) => (<div key={i} className="p-2 border rounded bg-white space-y-1">
                <input value={feat.title} onChange={e => handleNestedChange(`features.${i}.title`, e.target.value)} placeholder="Title" className="w-full p-1 border rounded font-semibold"/>
                <textarea value={feat.description} onChange={e => handleNestedChange(`features.${i}.description`, e.target.value)} placeholder="Description" className="w-full p-1 border rounded" rows={2}/>
             </div>))}
        </fieldset>
    </div> );
};

// --- Platinum Membership Page Editor ---
const PlusMembershipPageEditor: React.FC<{ data: typeof defaultPlusMembershipPageContent, onUpdate: (data: any) => void }> = ({ data, onUpdate }) => {
    const handleChange = (path: string, value: string) => {
        const keys = path.split('.');
        const newData = JSON.parse(JSON.stringify(data));
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
        current[keys[keys.length - 1]] = value;
        onUpdate(newData);
    };
     const availableIcons = ["TruckIcon", "PhoneIcon", "ShieldCheckIcon", "ClipboardCheckIcon"];
    return (<div className="space-y-6"><h3 className="text-lg font-bold">Platinum Cluster Page</h3>
        <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Hero</legend>
             <div><label>Title</label><input value={data.hero.title} onChange={e => handleChange('hero.title', e.target.value)} className="w-full p-1 border rounded"/></div>
             <div><label>Subtitle</label><input value={data.hero.subtitle} onChange={e => handleChange('hero.subtitle', e.target.value)} className="w-full p-1 border rounded"/></div>
        </fieldset>
        <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Benefits</legend>
             {data.benefits.map((b, i) => (<div key={i} className="p-2 border rounded bg-white space-y-1">
                <select value={b.icon} onChange={e => handleChange(`benefits.${i}.icon`, e.target.value)} className="w-full p-1 border rounded">
                    {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
                <input value={b.title} onChange={e => handleChange(`benefits.${i}.title`, e.target.value)} placeholder="Title" className="w-full p-1 border rounded font-semibold"/>
                <textarea value={b.description} onChange={e => handleChange(`benefits.${i}.description`, e.target.value)} placeholder="Description" className="w-full p-1 border rounded" rows={2}/>
             </div>))}
        </fieldset>
    </div>);
};

// --- Offers Page Editor ---
const OffersPageEditor: React.FC<{ data: typeof defaultOffersPageContent, onUpdate: (path: string, value: string) => void }> = ({ data, onUpdate }) => {
    return (
        <div className="space-y-6"><h3 className="text-lg font-bold">Special Offers Page</h3>
            <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Offer 1: Lab Test</legend>
                 <div><label>Value (e.g., 15%)</label><input value={data.labTest.value} onChange={e => onUpdate('offersPage.labTest.value', e.target.value)} className="w-full p-1 border rounded"/></div>
                 <div><label>Title</label><input value={data.labTest.title} onChange={e => onUpdate('offersPage.labTest.title', e.target.value)} className="w-full p-1 border rounded"/></div>
                 <div><label>Description</label><textarea value={data.labTest.description} onChange={e => onUpdate('offersPage.labTest.description', e.target.value)} className="w-full p-1 border rounded" rows={2}/></div>
            </fieldset>
            <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Offer 2: Home Collection</legend>
                 <div><label>Value (e.g., FREE)</label><input value={data.homeCollection.value} onChange={e => onUpdate('offersPage.homeCollection.value', e.target.value)} className="w-full p-1 border rounded"/></div>
                 <div><label>Title</label><input value={data.homeCollection.title} onChange={e => onUpdate('offersPage.homeCollection.title', e.target.value)} className="w-full p-1 border rounded"/></div>
                 <div><label>Description</label><textarea value={data.homeCollection.description} onChange={e => onUpdate('offersPage.homeCollection.description', e.target.value)} className="w-full p-1 border rounded" rows={2}/></div>
            </fieldset>
            <fieldset className="p-4 border rounded space-y-2"><legend className="font-semibold px-2">Offer 3: Referral</legend>
                 <div><label>Value (e.g., ₦1k)</label><input value={data.referral.value} onChange={e => onUpdate('offersPage.referral.value', e.target.value)} className="w-full p-1 border rounded"/></div>
                 <div><label>Title</label><input value={data.referral.title} onChange={e => onUpdate('offersPage.referral.title', e.target.value)} className="w-full p-1 border rounded"/></div>
                 <div><label>Description</label><textarea value={data.referral.description} onChange={e => onUpdate('offersPage.referral.description', e.target.value)} className="w-full p-1 border rounded" rows={2}/></div>
            </fieldset>
        </div>
    );
};

export default CmsManagement;
