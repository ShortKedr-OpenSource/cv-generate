export interface ThemeConfig {
    id: string;
    label: string;
    stylesheet: string;
}

export interface ProfileConfig {
    id: string;
    label: string;
    path: string;
}

export interface AtsProvider {
    id: string;
    label: string;
    url: string;
    openInNewTab: boolean;
    requiresPdf: boolean;
    showDisclaimer: boolean;
}

export interface AtsIntegration {
    enabled: boolean;
    providerId: string;
    providers: AtsProvider[];
}

export interface AppConfig {
    version: string;
    buildHash?: string;
    languages: string[];
    themes: ThemeConfig[];
    defaults: {
        profile: string;
        language: string;
        theme: string;
    };
    features: {
        profileSelector: boolean;
    };
    profiles: ProfileConfig[];
    integrations?: {
        ats?: Partial<AtsIntegration>;
    };
}

export interface ResolvedAppConfig {
    languages: string[];
    themes: ThemeConfig[];
    profiles: ProfileConfig[];
    defaultLanguage: string;
    defaultTheme: string;
    defaultProfileId: string;
    profileSelectorEnabled: boolean;
    atsIntegration: AtsIntegration;
}

export interface AppRuntimeState {
    appVersion: string;
    appBuildHash: string;
    supportedLanguages: string[];
    availableThemes: ThemeConfig[];
    availableProfiles: ProfileConfig[];
    defaultLanguage: string;
    defaultTheme: string;
    defaultProfileId: string;
    profileSelectorEnabled: boolean;
    atsIntegration: AtsIntegration;
    systemTranslations: Record<string, SystemTranslation>;
    profileMetadata: Record<string, ProfileMeta>;
    cvTranslations: Record<string, Record<string, CvTranslation>>;
}

export interface BootstrapResult {
    didRedirect: boolean;
    version: string;
    buildHash: string;
    cacheKey: string;
}

export interface LoadCvTranslationResult {
    language: string;
    translation: CvTranslation;
}

export interface MediaPostMeta {
    type: "image";
    file: string;
}

export interface MediaPostView {
    src: string;
    description: string;
    alt: string;
}

export interface ProfileMeta {
    id: string;
    label: string;
    contacts: {
        email: string;
        linkedin: string;
    };
    languages: string[];
    defaultLanguage: string;
    assetsPath: string;
    mediaPosts: MediaPostMeta[];
}

export interface CvExperienceItem {
    company?: string;
    date?: string;
    title?: string;
    description?: string | null;
}

export interface CvTranslation {
    title?: string;
    contact?: string;
    linkedin?: string;
    skillsTitle?: string;
    skills?: string[];
    languagesTitle?: string;
    languages?: string[];
    certificationsTitle?: string;
    certifications?: string;
    gdpr?: string;
    name?: string;
    subtitle?: string;
    location?: string;
    summaryTitle?: string;
    summary?: string[];
    mediaPosts?: Array<{ description?: string }>;
    experienceTitle?: string;
    experience?: CvExperienceItem[];
    educationTitle?: string;
    education?: {
        university?: string;
        degree?: string;
        date?: string;
    };
}

export type SystemTranslation = Record<string, string>;
