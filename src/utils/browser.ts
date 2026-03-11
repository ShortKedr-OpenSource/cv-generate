import {
    APP_VERSION_STORAGE_KEY,
    CONTROLS_PANEL_STORAGE_KEY,
    PROFILE_QUERY_PARAM,
    VERSION_QUERY_PARAM,
} from "../constants";
import type { AppConfig, BootstrapResult } from "../types";
import { isSafeProfileId } from "./validation";

export function readStoredValue(
    storage: Pick<Storage, "getItem"> | null | undefined,
    key: string,
): string {
    try {
        return storage?.getItem(key) || "";
    } catch {
        return "";
    }
}

export function writeStoredValue(
    storage: Pick<Storage, "setItem"> | null | undefined,
    key: string,
    value: string,
): void {
    try {
        storage?.setItem(key, value);
    } catch {
        // ignore storage errors
    }
}

export function getStoredValue(key: string): string {
    return readStoredValue(window.localStorage, key);
}

export function setStoredValue(key: string, value: string): void {
    writeStoredValue(window.localStorage, key, value);
}

export function getStoredControlsCollapsed(): boolean {
    return getStoredValue(CONTROLS_PANEL_STORAGE_KEY) !== "false";
}

export function getRequestedProfileId(): string | null {
    return getRequestedProfileIdFromUrl(window.location.href);
}

export function getRequestedProfileIdFromUrl(urlValue: string): string | null {
    const url = new URL(urlValue);
    const requestedProfileId = url.searchParams.get(PROFILE_QUERY_PARAM);
    return isSafeProfileId(requestedProfileId) ? requestedProfileId : null;
}

export function appendVersionParam(
    path: string,
    cacheKey: string,
    currentUrl = window.location.href,
): string {
    if (!cacheKey) {
        return path;
    }

    const url = new URL(path, currentUrl);
    url.searchParams.set(VERSION_QUERY_PARAM, cacheKey);
    return url.origin === new URL(currentUrl).origin
        ? `${url.pathname}${url.search}${url.hash}`
        : url.toString();
}

export function resolveProjectVersionState(
    config: AppConfig,
    currentUrlValue: string,
    storedVersion: string,
): BootstrapResult & { redirectUrl: string | null } {
    const version =
        typeof config.version === "string" ? config.version.trim() : "";
    const buildHash =
        typeof config.buildHash === "string" ? config.buildHash.trim() : "";
    const cacheKey = buildHash || version;

    if (!cacheKey) {
        return {
            didRedirect: false,
            version,
            buildHash,
            cacheKey,
            redirectUrl: null,
        };
    }

    const currentUrl = new URL(currentUrlValue);
    const currentQueryVersion =
        currentUrl.searchParams.get(VERSION_QUERY_PARAM) || "";

    if (storedVersion !== cacheKey || currentQueryVersion !== cacheKey) {
        currentUrl.searchParams.set(VERSION_QUERY_PARAM, cacheKey);
        return {
            didRedirect: true,
            version,
            buildHash,
            cacheKey,
            redirectUrl: currentUrl.toString(),
        };
    }

    return {
        didRedirect: false,
        version,
        buildHash,
        cacheKey,
        redirectUrl: null,
    };
}

export function syncProjectVersion(config: AppConfig): BootstrapResult {
    const versionState = resolveProjectVersionState(
        config,
        window.location.href,
        getStoredValue(APP_VERSION_STORAGE_KEY),
    );

    if (versionState.cacheKey) {
        setStoredValue(APP_VERSION_STORAGE_KEY, versionState.cacheKey);
    }
    if (versionState.didRedirect && versionState.redirectUrl) {
        window.location.replace(versionState.redirectUrl);
    }

    return versionState;
}

export function syncProfileUrl(profileId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(PROFILE_QUERY_PARAM, profileId);
    window.history.replaceState({}, "", url.toString());
}
