import { reactive } from "vue";
import type {
    AppConfig,
    AppRuntimeState,
    CvTranslation,
    LoadCvTranslationResult,
    ProfileMeta,
    SystemTranslation,
} from "../types";
import { fetchJson } from "./content";
import { appendVersionParam } from "../utils/browser";
import { createProfileMeta, resolveAppConfig } from "../utils/validation";

interface RuntimeDependencies {
    fetchJson?: typeof fetchJson;
    currentUrl?: () => string;
}

const DEFAULT_RUNTIME_STATE: AppRuntimeState = {
    appVersion: "",
    appBuildHash: "",
    supportedLanguages: [],
    availableThemes: [],
    availableProfiles: [],
    defaultLanguage: "en",
    defaultTheme: "default",
    defaultProfileId: "",
    profileSelectorEnabled: false,
    atsIntegration: {
        enabled: false,
        providerId: "",
        providers: [],
    },
    systemTranslations: {},
    profileMetadata: {},
    cvTranslations: {},
};

export function getRuntimeCacheKey(state: Pick<AppRuntimeState, "appBuildHash" | "appVersion">): string {
    return state.appBuildHash || state.appVersion;
}

export function getVersionedRuntimePath(
    path: string,
    cacheKey: string,
    currentUrl: string,
): string {
    return appendVersionParam(path, cacheKey, currentUrl);
}

export function createAppRuntime(dependencies: RuntimeDependencies = {}) {
    const loadJson = dependencies.fetchJson || fetchJson;
    const getCurrentUrl = dependencies.currentUrl || (() => window.location.href);
    const state = reactive<AppRuntimeState>({
        ...DEFAULT_RUNTIME_STATE,
        systemTranslations: {},
        profileMetadata: {},
        cvTranslations: {},
    });

    function getCacheKey(): string {
        return getRuntimeCacheKey(state);
    }

    function versionedPath(path: string): string {
        return getVersionedRuntimePath(path, getCacheKey(), getCurrentUrl());
    }

    async function loadAppConfig(): Promise<AppConfig> {
        const config = await loadJson<AppConfig>("config/app.json", {
            cache: "no-cache",
        });
        const resolved = resolveAppConfig(config);

        state.supportedLanguages = resolved.languages;
        state.availableThemes = resolved.themes;
        state.availableProfiles = resolved.profiles;
        state.defaultLanguage = resolved.defaultLanguage;
        state.defaultTheme = resolved.defaultTheme;
        state.defaultProfileId = resolved.defaultProfileId;
        state.profileSelectorEnabled = resolved.profileSelectorEnabled;
        state.atsIntegration = resolved.atsIntegration;

        return config;
    }

    async function loadProfileMeta(profileId: string): Promise<ProfileMeta> {
        if (state.profileMetadata[profileId]) {
            return state.profileMetadata[profileId];
        }

        const profile = state.availableProfiles.find((item) => item.id === profileId);
        if (!profile) {
            throw new Error(`Unknown profile: ${profileId}`);
        }

        const source = await loadJson<Record<string, unknown>>(
            versionedPath(`${profile.path}/profile.json`),
        );
        const meta = createProfileMeta(
            source,
            profile,
            state.supportedLanguages,
            state.defaultLanguage,
        );
        state.profileMetadata[profileId] = meta;
        return meta;
    }

    async function loadSystemTranslation(language: string): Promise<SystemTranslation> {
        if (!state.systemTranslations[language]) {
            state.systemTranslations[language] = await loadJson<SystemTranslation>(
                versionedPath(`locales/system/${language}.json`),
            );
        }
        return state.systemTranslations[language];
    }

    async function loadCvTranslation(
        profileId: string,
        language: string,
    ): Promise<CvTranslation | null> {
        const profile = state.availableProfiles.find((item) => item.id === profileId);
        if (!profile || !state.supportedLanguages.includes(language)) {
            return null;
        }

        state.cvTranslations[profileId] = state.cvTranslations[profileId] || {};
        if (state.cvTranslations[profileId][language]) {
            return state.cvTranslations[profileId][language];
        }

        try {
            state.cvTranslations[profileId][language] = await loadJson<CvTranslation>(
                versionedPath(`${profile.path}/locales/${language}.json`),
            );
            return state.cvTranslations[profileId][language];
        } catch {
            return null;
        }
    }

    async function ensureCvTranslation(
        profileId: string,
        requestedLanguage: string,
    ): Promise<LoadCvTranslationResult | null> {
        const meta = await loadProfileMeta(profileId);
        const candidates = Array.from(
            new Set(
                [
                    requestedLanguage,
                    meta.defaultLanguage,
                    state.defaultLanguage,
                    ...meta.languages,
                ].filter(Boolean),
            ),
        );

        for (const candidate of candidates) {
            const translation = await loadCvTranslation(profileId, candidate);
            if (translation) {
                return {
                    language: candidate,
                    translation,
                };
            }
        }

        return null;
    }

    function getFallbackProfileLanguage(meta: ProfileMeta | null): string {
        if (meta && state.supportedLanguages.includes(meta.defaultLanguage)) {
            return meta.defaultLanguage;
        }
        if (state.supportedLanguages.includes(state.defaultLanguage)) {
            return state.defaultLanguage;
        }
        return state.supportedLanguages[0] || "en";
    }

    return {
        state,
        getCacheKey,
        versionedPath,
        loadAppConfig,
        loadProfileMeta,
        loadSystemTranslation,
        ensureCvTranslation,
        getFallbackProfileLanguage,
    };
}
