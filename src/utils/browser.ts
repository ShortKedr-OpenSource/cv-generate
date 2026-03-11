import {
    APP_VERSION_STORAGE_KEY,
    CONTROLS_PANEL_STORAGE_KEY,
    PROFILE_QUERY_PARAM,
    VERSION_QUERY_PARAM,
} from "../constants";
import type { AppConfig } from "../types";
import { isSafeProfileId } from "./validation";

export function getStoredValue(key: string): string {
    try {
        return window.localStorage.getItem(key) || "";
    } catch {
        return "";
    }
}

export function setStoredValue(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // ignore storage errors
    }
}

export function getStoredControlsCollapsed(): boolean {
    return getStoredValue(CONTROLS_PANEL_STORAGE_KEY) !== "false";
}

export function getRequestedProfileId(): string | null {
    const url = new URL(window.location.href);
    const requestedProfileId = url.searchParams.get(PROFILE_QUERY_PARAM);
    return isSafeProfileId(requestedProfileId) ? requestedProfileId : null;
}

export function appendVersionParam(path: string, cacheKey: string): string {
    if (!cacheKey) {
        return path;
    }

    const url = new URL(path, window.location.href);
    url.searchParams.set(VERSION_QUERY_PARAM, cacheKey);
    return url.origin === window.location.origin
        ? `${url.pathname}${url.search}${url.hash}`
        : url.toString();
}

export function syncProjectVersion(config: AppConfig): {
    didRedirect: boolean;
    version: string;
    buildHash: string;
} {
    const version =
        typeof config.version === "string" ? config.version.trim() : "";
    const buildHash =
        typeof config.buildHash === "string" ? config.buildHash.trim() : "";
    const cacheKey = buildHash || version;

    if (!cacheKey) {
        return { didRedirect: false, version, buildHash };
    }

    const storedVersion = getStoredValue(APP_VERSION_STORAGE_KEY);
    const currentUrl = new URL(window.location.href);
    const currentQueryVersion =
        currentUrl.searchParams.get(VERSION_QUERY_PARAM) || "";

    if (storedVersion !== cacheKey || currentQueryVersion !== cacheKey) {
        setStoredValue(APP_VERSION_STORAGE_KEY, cacheKey);
        currentUrl.searchParams.set(VERSION_QUERY_PARAM, cacheKey);
        window.location.replace(currentUrl.toString());
        return { didRedirect: true, version, buildHash };
    }

    return { didRedirect: false, version, buildHash };
}

export function syncProfileUrl(profileId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(PROFILE_QUERY_PARAM, profileId);
    window.history.replaceState({}, "", url.toString());
}
