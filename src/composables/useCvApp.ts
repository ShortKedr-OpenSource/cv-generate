import { computed, reactive, ref, watch } from "vue";
import {
    CONTROLS_PANEL_STORAGE_KEY,
    DEFAULT_BUILD_ERROR,
    LANGUAGE_STORAGE_KEY,
    THEME_STORAGE_KEY,
} from "../constants";
import { fetchJson } from "../services/content";
import type {
    AppConfig,
    AtsIntegration,
    CvTranslation,
    MediaPostView,
    ProfileMeta,
    SystemTranslation,
} from "../types";
import {
    appendVersionParam,
    getRequestedProfileId,
    getStoredControlsCollapsed,
    getStoredValue,
    setStoredValue,
    syncProfileUrl,
    syncProjectVersion,
} from "../utils/browser";
import { createProfileMeta, resolveAppConfig } from "../utils/validation";
import { useProfileSelector } from "./useProfileSelector";

export function useCvApp() {
    const appVersion = ref("");
    const appBuildHash = ref("");
    const supportedLanguages = ref<string[]>([]);
    const availableThemes = ref<AppConfig["themes"]>([]);
    const availableProfiles = ref<AppConfig["profiles"]>([]);
    const defaultLanguage = ref("en");
    const defaultTheme = ref("default");
    const defaultProfileId = ref("");
    const selectedTheme = ref("");
    const activeLanguage = ref("");
    const activeProfileId = ref("");
    const controlsCollapsed = ref(true);
    const profileSelectorEnabled = ref(false);
    const atsIntegration = ref<AtsIntegration>({
        enabled: false,
        providerId: "",
        providers: [],
    });
    const bootError = ref("");
    const themeStatusMessage = ref("");
    const isThemeStatusVisible = ref(false);
    const exportMode = ref<"default" | "ats">("default");
    const systemTranslations = reactive<Record<string, SystemTranslation>>({});
    const profileMetadata = reactive<Record<string, ProfileMeta>>({});
    const cvTranslations = reactive<
        Record<string, Record<string, CvTranslation>>
    >({});

    function getCacheKey(): string {
        return appBuildHash.value || appVersion.value;
    }

    function versionedPath(path: string): string {
        return appendVersionParam(path, getCacheKey());
    }

    const activeProfileConfig = computed(() => {
        return (
            availableProfiles.value.find(
                (profile) => profile.id === activeProfileId.value,
            ) ||
            availableProfiles.value.find(
                (profile) => profile.id === defaultProfileId.value,
            ) ||
            availableProfiles.value[0] ||
            null
        );
    });

    const selector = useProfileSelector({
        getActiveProfileId: () => activeProfileId.value,
        getActiveProfileLabel: () => activeProfileConfig.value?.label || "",
        getProfiles: () => availableProfiles.value,
    });

    function syncConfigState(config: AppConfig): void {
        const resolved = resolveAppConfig(config);
        supportedLanguages.value = resolved.languages;
        availableThemes.value = resolved.themes;
        availableProfiles.value = resolved.profiles;
        defaultLanguage.value = resolved.defaultLanguage;
        defaultTheme.value = resolved.defaultTheme;
        defaultProfileId.value = resolved.defaultProfileId;
        profileSelectorEnabled.value = resolved.profileSelectorEnabled;
        atsIntegration.value = resolved.atsIntegration;
    }

    async function loadAppConfig(): Promise<boolean> {
        const config = await fetchJson<AppConfig>("config/app.json", {
            cache: "no-cache",
        });
        const versionState = syncProjectVersion(config);
        appVersion.value = versionState.version;
        appBuildHash.value = versionState.buildHash;
        if (versionState.didRedirect) {
            return false;
        }

        syncConfigState(config);
        selectedTheme.value = defaultTheme.value;
        activeLanguage.value = defaultLanguage.value;
        activeProfileId.value = defaultProfileId.value;
        return true;
    }

    async function loadProfileMeta(profileId: string): Promise<ProfileMeta> {
        if (profileMetadata[profileId]) {
            return profileMetadata[profileId];
        }

        const profile = availableProfiles.value.find(
            (item) => item.id === profileId,
        );
        if (!profile) {
            throw new Error(`Unknown profile: ${profileId}`);
        }

        const source = await fetchJson<Record<string, unknown>>(
            versionedPath(`${profile.path}/profile.json`),
        );
        const meta = createProfileMeta(
            source,
            profile,
            supportedLanguages.value,
            defaultLanguage.value,
        );
        profileMetadata[profileId] = meta;
        return meta;
    }

    async function loadSystemTranslation(language: string): Promise<void> {
        systemTranslations[language] = await fetchJson<SystemTranslation>(
            versionedPath(`locales/system/${language}.json`),
        );
    }

    async function loadCvTranslation(
        profileId: string,
        language: string,
    ): Promise<boolean> {
        const profile = availableProfiles.value.find(
            (item) => item.id === profileId,
        );
        if (!profile || !supportedLanguages.value.includes(language)) {
            return false;
        }

        cvTranslations[profileId] = cvTranslations[profileId] || {};
        try {
            cvTranslations[profileId][language] =
                await fetchJson<CvTranslation>(
                    versionedPath(`${profile.path}/locales/${language}.json`),
                );
            return true;
        } catch {
            return false;
        }
    }

    async function ensureCvTranslation(
        profileId: string,
        requestedLanguage: string,
    ): Promise<string | null> {
        const meta = await loadProfileMeta(profileId);
        const candidates = Array.from(
            new Set(
                [
                    requestedLanguage,
                    meta.defaultLanguage,
                    defaultLanguage.value,
                    ...meta.languages,
                ].filter(Boolean),
            ),
        );

        for (const candidate of candidates) {
            if (await loadCvTranslation(profileId, candidate)) {
                return candidate;
            }
        }

        return null;
    }

    function getFallbackProfileLanguage(meta: ProfileMeta | null): string {
        if (meta && supportedLanguages.value.includes(meta.defaultLanguage)) {
            return meta.defaultLanguage;
        }
        if (supportedLanguages.value.includes(defaultLanguage.value)) {
            return defaultLanguage.value;
        }
        return supportedLanguages.value[0] || "en";
    }

    const activeProfileMeta = computed(
        () => profileMetadata[activeProfileId.value] || null,
    );
    const activeCvData = computed(
        () =>
            cvTranslations[activeProfileId.value]?.[activeLanguage.value] ||
            null,
    );
    const systemData = computed(
        () => systemTranslations[activeLanguage.value] || {},
    );
    const buildLabel = computed(() => appBuildHash.value || appVersion.value);
    const currentAtsProvider = computed(() => {
        if (!atsIntegration.value.enabled) {
            return null;
        }

        return (
            atsIntegration.value.providers.find(
                (provider) => provider.id === atsIntegration.value.providerId,
            ) ||
            atsIntegration.value.providers[0] ||
            null
        );
    });
    const mediaPost = computed<MediaPostView | null>(() => {
        const meta = activeProfileMeta.value;
        const profile = activeProfileConfig.value;
        const mediaMeta = meta?.mediaPosts?.[0];
        if (!meta || !profile || !mediaMeta) {
            return null;
        }

        const assetsPath = meta.assetsPath.replace(/^\/+|\/+$/g, "");
        return {
            src: versionedPath(
                `${profile.path}/${assetsPath}/${mediaMeta.file.replace(/^\/+/, "")}`,
            ),
            description:
                activeCvData.value?.mediaPosts?.[0]?.description?.trim() || "",
            alt: meta.label ? `${meta.label} portrait` : "Profile portrait",
        };
    });

    function updateDocumentMetadata(): void {
        document.documentElement.lang =
            activeLanguage.value || defaultLanguage.value;
        document.documentElement.dataset.exportMode = exportMode.value;
        if (activeCvData.value?.title) {
            document.title = activeCvData.value.title;
        }
    }

    function showThemeStatus(message: string): void {
        themeStatusMessage.value = message;
        isThemeStatusVisible.value = Boolean(message);
    }

    function hideThemeStatus(): void {
        themeStatusMessage.value = "";
        isThemeStatusVisible.value = false;
    }

    function setDocumentTheme(themeId: string): void {
        document.documentElement.dataset.theme = themeId;
    }

    async function applyTheme(themeId: string): Promise<boolean> {
        const theme =
            availableThemes.value.find((item) => item.id === themeId) ||
            availableThemes.value.find(
                (item) => item.id === defaultTheme.value,
            ) ||
            availableThemes.value[0];

        try {
            selectedTheme.value = theme.id;
            setDocumentTheme(theme.id);
            setStoredValue(THEME_STORAGE_KEY, theme.id);
            hideThemeStatus();
            return true;
        } catch (error) {
            console.error(error);
            const message =
                systemData.value.themeLoadError ||
                "Could not load the visual theme. Check the stylesheet file and try again.";
            showThemeStatus(`${message} (${theme.label})`);
            return false;
        }
    }

    async function changeLanguage(language: string): Promise<void> {
        const requested = supportedLanguages.value.includes(language)
            ? language
            : defaultLanguage.value;
        await loadSystemTranslation(requested);
        const resolvedLanguage = await ensureCvTranslation(
            activeProfileId.value,
            requested,
        );
        if (!resolvedLanguage) {
            throw new Error(
                `No profile data available for profile: ${activeProfileId.value}`,
            );
        }

        await loadSystemTranslation(resolvedLanguage);
        activeLanguage.value = resolvedLanguage;
        setStoredValue(LANGUAGE_STORAGE_KEY, resolvedLanguage);
        updateDocumentMetadata();
    }

    async function changeProfile(profileId: string): Promise<void> {
        const target = availableProfiles.value.find(
            (profile) => profile.id === profileId,
        );
        if (!target) {
            return;
        }

        await loadProfileMeta(target.id);
        activeProfileId.value = target.id;
        syncProfileUrl(target.id);
        selector.resetProfileSelector();
        await changeLanguage(activeLanguage.value || defaultLanguage.value);
    }

    async function selectHighlightedProfile(): Promise<void> {
        const profile =
            selector.filteredProfiles.value[
                selector.highlightedProfileIndex.value
            ];
        if (!profile) {
            return;
        }

        await changeProfile(profile.id);
    }

    function setControlsCollapsed(isCollapsed: boolean): void {
        controlsCollapsed.value = isCollapsed;
        setStoredValue(
            CONTROLS_PANEL_STORAGE_KEY,
            isCollapsed ? "true" : "false",
        );
    }

    function setExportMode(mode: "default" | "ats"): void {
        exportMode.value = mode;
        document.documentElement.dataset.exportMode = mode;
    }

    function clearExportMode(): void {
        setExportMode("default");
    }

    function exportPdf(mode: "default" | "ats"): void {
        setExportMode(mode);
        const restoreMode = () => clearExportMode();
        window.addEventListener("afterprint", restoreMode, { once: true });
        window.print();
        window.setTimeout(clearExportMode, 1000);
    }

    function openAtsChecker(): void {
        const provider = currentAtsProvider.value;
        if (!provider) {
            return;
        }

        if (!provider.openInNewTab) {
            window.location.href = provider.url;
            return;
        }

        const newWindow = window.open(
            provider.url,
            "_blank",
            "noopener,noreferrer",
        );
        if (newWindow) {
            newWindow.opener = null;
        }
    }

    async function bootstrap(): Promise<void> {
        try {
            setExportMode("default");
            const didLoadConfig = await loadAppConfig();
            if (!didLoadConfig) {
                return;
            }

            controlsCollapsed.value = getStoredControlsCollapsed();
            const requestedProfileId = getRequestedProfileId();
            const initialProfile =
                availableProfiles.value.find(
                    (profile) => profile.id === requestedProfileId,
                ) ||
                availableProfiles.value.find(
                    (profile) => profile.id === defaultProfileId.value,
                ) ||
                availableProfiles.value[0];

            activeProfileId.value = initialProfile.id;
            const meta = await loadProfileMeta(activeProfileId.value);
            syncProfileUrl(activeProfileId.value);

            const storedTheme = getStoredValue(THEME_STORAGE_KEY);
            const initialTheme = availableThemes.value.some(
                (theme) => theme.id === storedTheme,
            )
                ? storedTheme
                : defaultTheme.value;
            await applyTheme(initialTheme);

            const storedLanguage = getStoredValue(LANGUAGE_STORAGE_KEY);
            const initialLanguage =
                storedLanguage &&
                supportedLanguages.value.includes(storedLanguage)
                    ? storedLanguage
                    : getFallbackProfileLanguage(meta);
            await changeLanguage(initialLanguage);
            updateDocumentMetadata();
        } catch (error) {
            console.error("Application bootstrap failed", error);
            bootError.value = DEFAULT_BUILD_ERROR;
            showThemeStatus(DEFAULT_BUILD_ERROR);
        }
    }

    watch(
        () => [
            activeLanguage.value,
            activeCvData.value?.title,
            exportMode.value,
        ],
        () => updateDocumentMetadata(),
    );

    return {
        activeCvData,
        activeLanguage,
        activeProfileConfig,
        activeProfileId,
        activeProfileMeta,
        applyTheme,
        appVersion,
        atsProvider: currentAtsProvider,
        availableProfiles,
        availableThemes,
        bootError,
        bootstrap,
        buildLabel,
        changeLanguage,
        changeProfile,
        clearExportMode,
        controlsCollapsed,
        exportPdf,
        filteredProfiles: selector.filteredProfiles,
        highlightedProfileIndex: selector.highlightedProfileIndex,
        highlightNextProfile: selector.highlightNextProfile,
        isThemeStatusVisible,
        mediaPost,
        openAtsChecker,
        openProfileSelector: selector.openProfileSelector,
        profileSelectorEnabled,
        profileSelectorFilter: selector.profileSelectorFilter,
        profileSelectorOpen: selector.profileSelectorOpen,
        resetProfileSelector: selector.resetProfileSelector,
        selectedTheme,
        selectorPopoverStyle: selector.selectorPopoverStyle,
        setControlsCollapsed,
        setExportMode,
        setHighlightedProfileIndex: selector.setHighlightedProfileIndex,
        setProfileFilter: selector.setProfileFilter,
        setSelectorField: selector.setSelectorField,
        selectHighlightedProfile,
        supportedLanguages,
        systemData,
        themeStatusMessage,
    };
}
