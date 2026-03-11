import { computed, ref, watch } from "vue";
import { DEFAULT_BUILD_ERROR } from "../constants";
import { createAppRuntime } from "../services/appRuntime";
import { createBrowserRuntime } from "../services/browserRuntime";
import type { AtsIntegration, MediaPostView } from "../types";
import { useProfileSelector } from "./useProfileSelector";

export function useCvApp() {
    const runtime = createAppRuntime();
    const browser = createBrowserRuntime();

    const selectedTheme = ref("");
    const activeLanguage = ref("");
    const activeProfileId = ref("");
    const controlsCollapsed = ref(true);
    const bootError = ref("");
    const themeStatusMessage = ref("");
    const isThemeStatusVisible = ref(false);
    const exportMode = ref<"default" | "ats">("default");

    const activeProfileConfig = computed(() => {
        return (
            runtime.state.availableProfiles.find(
                (profile) => profile.id === activeProfileId.value,
            ) ||
            runtime.state.availableProfiles.find(
                (profile) => profile.id === runtime.state.defaultProfileId,
            ) ||
            runtime.state.availableProfiles[0] ||
            null
        );
    });

    const selector = useProfileSelector({
        getActiveProfileId: () => activeProfileId.value,
        getActiveProfileLabel: () => activeProfileConfig.value?.label || "",
        getProfiles: () => runtime.state.availableProfiles,
    });

    const activeProfileMeta = computed(
        () => runtime.state.profileMetadata[activeProfileId.value] || null,
    );
    const activeCvData = computed(
        () =>
            runtime.state.cvTranslations[activeProfileId.value]?.[
                activeLanguage.value
            ] || null,
    );
    const systemData = computed(
        () => runtime.state.systemTranslations[activeLanguage.value] || {},
    );
    const buildLabel = computed(
        () => runtime.state.appBuildHash || runtime.state.appVersion,
    );
    const currentAtsProvider = computed(() => {
        const atsIntegration: AtsIntegration = runtime.state.atsIntegration;
        if (!atsIntegration.enabled) {
            return null;
        }

        return (
            atsIntegration.providers.find(
                (provider) => provider.id === atsIntegration.providerId,
            ) ||
            atsIntegration.providers[0] ||
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
            src: runtime.versionedPath(
                `${profile.path}/${assetsPath}/${mediaMeta.file.replace(/^\/+/, "")}`,
            ),
            description:
                activeCvData.value?.mediaPosts?.[0]?.description?.trim() || "",
            alt: meta.label ? `${meta.label} portrait` : "Profile portrait",
        };
    });

    function updateDocumentMetadata(): void {
        browser.updateDocumentMetadata(
            activeLanguage.value,
            runtime.state.defaultLanguage,
            exportMode.value,
            activeCvData.value?.title,
        );
    }

    function showThemeStatus(message: string): void {
        themeStatusMessage.value = message;
        isThemeStatusVisible.value = Boolean(message);
    }

    function hideThemeStatus(): void {
        themeStatusMessage.value = "";
        isThemeStatusVisible.value = false;
    }

    async function switchTheme(themeId: string): Promise<boolean> {
        const theme =
            runtime.state.availableThemes.find((item) => item.id === themeId) ||
            runtime.state.availableThemes.find(
                (item) => item.id === runtime.state.defaultTheme,
            ) ||
            runtime.state.availableThemes[0];

        try {
            selectedTheme.value = theme.id;
            browser.applyDocumentTheme(theme.id);
            browser.setStoredTheme(theme.id);
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

    async function switchLanguage(language: string): Promise<void> {
        const requested = runtime.state.supportedLanguages.includes(language)
            ? language
            : runtime.state.defaultLanguage;
        await runtime.loadSystemTranslation(requested);
        const resolved = await runtime.ensureCvTranslation(
            activeProfileId.value,
            requested,
        );
        if (!resolved) {
            throw new Error(
                `No profile data available for profile: ${activeProfileId.value}`,
            );
        }

        await runtime.loadSystemTranslation(resolved.language);
        activeLanguage.value = resolved.language;
        browser.setStoredLanguage(resolved.language);
        updateDocumentMetadata();
    }

    async function switchProfile(profileId: string): Promise<void> {
        const target = runtime.state.availableProfiles.find(
            (profile) => profile.id === profileId,
        );
        if (!target) {
            return;
        }

        await runtime.loadProfileMeta(target.id);
        activeProfileId.value = target.id;
        browser.syncProfileUrl(target.id);
        selector.resetProfileSelector();
        await switchLanguage(activeLanguage.value || runtime.state.defaultLanguage);
    }

    async function selectHighlightedProfile(): Promise<void> {
        const profile =
            selector.filteredProfiles.value[
                selector.highlightedProfileIndex.value
            ];
        if (!profile) {
            return;
        }

        await switchProfile(profile.id);
    }

    function setControlsCollapsed(isCollapsed: boolean): void {
        controlsCollapsed.value = isCollapsed;
        browser.setStoredControlsCollapsed(isCollapsed);
    }

    function setExportMode(mode: "default" | "ats"): void {
        exportMode.value = mode;
        browser.setExportMode(mode);
    }

    function clearExportMode(): void {
        exportMode.value = "default";
        browser.clearExportMode();
    }

    function prepareExport(mode: "default" | "ats"): void {
        exportMode.value = mode;
        browser.exportPdf(mode);
        window.setTimeout(() => {
            exportMode.value = "default";
        }, 1000);
    }

    function openAtsChecker(): void {
        const provider = currentAtsProvider.value;
        if (!provider) {
            return;
        }

        browser.openExternalUrl(provider.url, provider.openInNewTab);
    }

    async function initializeApp(): Promise<void> {
        try {
            setExportMode("default");
            const config = await runtime.loadAppConfig();
            const versionState = browser.syncProjectVersion(config);
            runtime.state.appVersion = versionState.version;
            runtime.state.appBuildHash = versionState.buildHash;
            if (versionState.didRedirect) {
                return;
            }

            selectedTheme.value = runtime.state.defaultTheme;
            activeLanguage.value = runtime.state.defaultLanguage;
            activeProfileId.value = runtime.state.defaultProfileId;
            controlsCollapsed.value = browser.getStoredControlsCollapsed();

            const requestedProfileId = browser.getRequestedProfileId();
            const initialProfile =
                runtime.state.availableProfiles.find(
                    (profile) => profile.id === requestedProfileId,
                ) ||
                runtime.state.availableProfiles.find(
                    (profile) => profile.id === runtime.state.defaultProfileId,
                ) ||
                runtime.state.availableProfiles[0];

            activeProfileId.value = initialProfile.id;
            const meta = await runtime.loadProfileMeta(activeProfileId.value);
            browser.syncProfileUrl(activeProfileId.value);

            const storedTheme = browser.getStoredTheme();
            const initialTheme = runtime.state.availableThemes.some(
                (theme) => theme.id === storedTheme,
            )
                ? storedTheme
                : runtime.state.defaultTheme;
            await switchTheme(initialTheme);

            const storedLanguage = browser.getStoredLanguage();
            const initialLanguage =
                storedLanguage &&
                runtime.state.supportedLanguages.includes(storedLanguage)
                    ? storedLanguage
                    : runtime.getFallbackProfileLanguage(meta);
            await switchLanguage(initialLanguage);
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
        applyTheme: switchTheme,
        atsProvider: currentAtsProvider,
        availableProfiles: computed(() => runtime.state.availableProfiles),
        availableThemes: computed(() => runtime.state.availableThemes),
        bootError,
        bootstrap: initializeApp,
        buildLabel,
        changeLanguage: switchLanguage,
        changeProfile: switchProfile,
        controlsCollapsed,
        exportPdf: prepareExport,
        filteredProfiles: selector.filteredProfiles,
        highlightedProfileIndex: selector.highlightedProfileIndex,
        highlightNextProfile: selector.highlightNextProfile,
        isThemeStatusVisible,
        mediaPost,
        openAtsChecker,
        openProfileSelector: selector.openProfileSelector,
        profileSelectorEnabled: computed(
            () => runtime.state.profileSelectorEnabled,
        ),
        profileSelectorFilter: selector.profileSelectorFilter,
        profileSelectorOpen: selector.profileSelectorOpen,
        resetProfileSelector: selector.resetProfileSelector,
        selectedTheme,
        selectorPopoverStyle: selector.selectorPopoverStyle,
        setControlsCollapsed,
        setHighlightedProfileIndex: selector.setHighlightedProfileIndex,
        setProfileFilter: selector.setProfileFilter,
        setSelectorField: selector.setSelectorField,
        selectHighlightedProfile,
        supportedLanguages: computed(() => runtime.state.supportedLanguages),
        systemData,
        themeStatusMessage,
    };
}
