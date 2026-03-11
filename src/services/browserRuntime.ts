import {
    APP_VERSION_STORAGE_KEY,
    CONTROLS_PANEL_STORAGE_KEY,
    LANGUAGE_STORAGE_KEY,
    THEME_STORAGE_KEY,
} from "../constants";
import type { AppConfig, BootstrapResult } from "../types";
import {
    getRequestedProfileIdFromUrl,
    readStoredValue,
    resolveProjectVersionState,
    writeStoredValue,
} from "../utils/browser";

type ExportMode = "default" | "ats";

interface BrowserRuntimeDependencies {
    window?: Window;
    document?: Document;
}

export function createBrowserRuntime(
    dependencies: BrowserRuntimeDependencies = {},
) {
    const runtimeWindow = dependencies.window || window;
    const runtimeDocument = dependencies.document || document;

    function getStoredTheme(): string {
        return readStoredValue(runtimeWindow.localStorage, THEME_STORAGE_KEY);
    }

    function setStoredTheme(themeId: string): void {
        writeStoredValue(runtimeWindow.localStorage, THEME_STORAGE_KEY, themeId);
    }

    function getStoredLanguage(): string {
        return readStoredValue(runtimeWindow.localStorage, LANGUAGE_STORAGE_KEY);
    }

    function setStoredLanguage(language: string): void {
        writeStoredValue(runtimeWindow.localStorage, LANGUAGE_STORAGE_KEY, language);
    }

    function getStoredControlsCollapsed(): boolean {
        return (
            readStoredValue(runtimeWindow.localStorage, CONTROLS_PANEL_STORAGE_KEY) !==
            "false"
        );
    }

    function setStoredControlsCollapsed(isCollapsed: boolean): void {
        writeStoredValue(
            runtimeWindow.localStorage,
            CONTROLS_PANEL_STORAGE_KEY,
            isCollapsed ? "true" : "false",
        );
    }

    function getRequestedProfileId(): string | null {
        return getRequestedProfileIdFromUrl(runtimeWindow.location.href);
    }

    function syncProjectVersion(config: AppConfig): BootstrapResult {
        const versionState = resolveProjectVersionState(
            config,
            runtimeWindow.location.href,
            readStoredValue(runtimeWindow.localStorage, APP_VERSION_STORAGE_KEY),
        );

        if (versionState.cacheKey) {
            writeStoredValue(
                runtimeWindow.localStorage,
                APP_VERSION_STORAGE_KEY,
                versionState.cacheKey,
            );
        }
        if (versionState.didRedirect && versionState.redirectUrl) {
            runtimeWindow.location.replace(versionState.redirectUrl);
        }

        return versionState;
    }

    function syncProfileUrl(profileId: string): void {
        const url = new URL(runtimeWindow.location.href);
        url.searchParams.set("profile", profileId);
        runtimeWindow.history.replaceState({}, "", url.toString());
    }

    function updateDocumentMetadata(
        language: string,
        fallbackLanguage: string,
        exportMode: ExportMode,
        title?: string,
    ): void {
        runtimeDocument.documentElement.lang = language || fallbackLanguage;
        runtimeDocument.documentElement.dataset.exportMode = exportMode;
        if (title) {
            runtimeDocument.title = title;
        }
    }

    function applyDocumentTheme(themeId: string): void {
        runtimeDocument.documentElement.dataset.theme = themeId;
    }

    function setExportMode(mode: ExportMode): void {
        runtimeDocument.documentElement.dataset.exportMode = mode;
    }

    function clearExportMode(): void {
        setExportMode("default");
    }

    function exportPdf(mode: ExportMode): void {
        setExportMode(mode);
        const restoreMode = () => clearExportMode();
        runtimeWindow.addEventListener("afterprint", restoreMode, { once: true });
        runtimeWindow.print();
        runtimeWindow.setTimeout(clearExportMode, 1000);
    }

    function openExternalUrl(url: string, openInNewTab: boolean): void {
        if (!openInNewTab) {
            runtimeWindow.location.href = url;
            return;
        }

        const newWindow = runtimeWindow.open(
            url,
            "_blank",
            "noopener,noreferrer",
        );
        if (newWindow) {
            newWindow.opener = null;
        }
    }

    return {
        applyDocumentTheme,
        clearExportMode,
        exportPdf,
        getRequestedProfileId,
        getStoredControlsCollapsed,
        getStoredLanguage,
        getStoredTheme,
        openExternalUrl,
        setExportMode,
        setStoredControlsCollapsed,
        setStoredLanguage,
        setStoredTheme,
        syncProfileUrl,
        syncProjectVersion,
        updateDocumentMetadata,
    };
}
