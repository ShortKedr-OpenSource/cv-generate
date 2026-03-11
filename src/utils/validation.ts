import type {
    AppConfig,
    AtsIntegration,
    AtsProvider,
    MediaPostMeta,
    ProfileConfig,
    ProfileMeta,
    ResolvedAppConfig,
    ThemeConfig,
} from "../types";

const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/i;
const SAFE_ID_PATTERN = /^[a-z0-9-]+$/i;

export function isSafeLanguageCode(value: unknown): value is string {
    return typeof value === "string" && LANGUAGE_CODE_PATTERN.test(value);
}

export function isSafeProfileId(value: unknown): value is string {
    return typeof value === "string" && SAFE_ID_PATTERN.test(value);
}

export function isSafeThemeId(value: unknown): value is string {
    return typeof value === "string" && SAFE_ID_PATTERN.test(value);
}

export function isSafeThemeStylesheet(value: unknown): value is string {
    if (typeof value !== "string" || !value.startsWith("styles/themes/")) {
        return false;
    }
    if (
        !value.endsWith(".css") ||
        value.includes("..") ||
        value.includes("\\")
    ) {
        return false;
    }
    return !/^(?:[a-z]+:)?\/\//i.test(value) && !value.startsWith("/");
}

export function isSafeHttpsUrl(value: unknown): value is string {
    if (typeof value !== "string") {
        return false;
    }

    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}

export function isSafeEmail(value: unknown): value is string {
    return (
        typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    );
}

export function isSafeProfilePath(value: unknown): value is string {
    if (typeof value !== "string" || !value.startsWith("profiles/")) {
        return false;
    }
    if (value.includes("..") || value.includes("\\")) {
        return false;
    }
    return !/^(?:[a-z]+:)?\/\//i.test(value) && !value.startsWith("/");
}

export function isSafeAssetPath(value: unknown): value is string {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }
    if (value.includes("..") || value.includes("\\")) {
        return false;
    }
    return !/^(?:[a-z]+:)?\/\//i.test(value) && !value.startsWith("/");
}

export function normalizeTheme(theme: unknown): ThemeConfig | null {
    if (!theme || typeof theme !== "object") {
        return null;
    }

    const candidate = theme as ThemeConfig;
    if (
        !isSafeThemeId(candidate.id) ||
        typeof candidate.label !== "string" ||
        !candidate.label.trim()
    ) {
        return null;
    }
    if (!isSafeThemeStylesheet(candidate.stylesheet)) {
        return null;
    }

    return {
        id: candidate.id,
        label: candidate.label.trim(),
        stylesheet: candidate.stylesheet,
    };
}

export function normalizeProfile(profile: unknown): ProfileConfig | null {
    if (!profile || typeof profile !== "object") {
        return null;
    }

    const candidate = profile as ProfileConfig;
    if (
        !isSafeProfileId(candidate.id) ||
        typeof candidate.label !== "string" ||
        !candidate.label.trim()
    ) {
        return null;
    }
    if (!isSafeProfilePath(candidate.path)) {
        return null;
    }

    return {
        id: candidate.id,
        label: candidate.label.trim(),
        path: candidate.path.replace(/\/+$/, ""),
    };
}

export function normalizeAtsIntegration(input: unknown): AtsIntegration {
    if (!input || typeof input !== "object") {
        return { enabled: false, providerId: "", providers: [] };
    }

    const source = input as Partial<AtsIntegration>;
    const providers = Array.isArray(source.providers)
        ? source.providers
              .filter((provider): provider is AtsProvider => {
                  return Boolean(
                      provider &&
                          typeof provider.id === "string" &&
                          typeof provider.label === "string" &&
                          isSafeHttpsUrl(provider.url),
                  );
              })
              .map((provider) => ({
                  id: provider.id,
                  label: provider.label,
                  url: provider.url,
                  openInNewTab: provider.openInNewTab !== false,
                  requiresPdf: provider.requiresPdf !== false,
                  showDisclaimer: provider.showDisclaimer !== false,
              }))
        : [];

    return {
        enabled: source.enabled === true && providers.length > 0,
        providerId:
            typeof source.providerId === "string" ? source.providerId : "",
        providers,
    };
}

export function resolveAppConfig(config: AppConfig): ResolvedAppConfig {
    const languages = Array.isArray(config.languages)
        ? config.languages.filter(isSafeLanguageCode)
        : [];
    const themes = Array.isArray(config.themes)
        ? config.themes
              .map(normalizeTheme)
              .filter((theme): theme is ThemeConfig => Boolean(theme))
        : [];
    const profiles = Array.isArray(config.profiles)
        ? config.profiles
              .map(normalizeProfile)
              .filter((profile): profile is ProfileConfig => Boolean(profile))
        : [];

    if (!languages.length || !themes.length || !profiles.length) {
        throw new Error("No valid application configuration found");
    }

    return {
        languages,
        themes,
        profiles,
        defaultLanguage: languages.includes(config.defaults?.language)
            ? config.defaults.language
            : languages[0],
        defaultTheme: themes.some(
            (theme) => theme.id === config.defaults?.theme,
        )
            ? config.defaults.theme
            : themes[0].id,
        defaultProfileId: profiles.some(
            (profile) => profile.id === config.defaults?.profile,
        )
            ? config.defaults.profile
            : profiles[0].id,
        profileSelectorEnabled: config.features?.profileSelector === true,
        atsIntegration: normalizeAtsIntegration(config.integrations?.ats),
    };
}

function normalizeMediaPosts(input: unknown): MediaPostMeta[] {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .filter((post) => post && typeof post === "object")
        .map((post) => {
            const candidate = post as Record<string, unknown>;
            return {
                type: candidate.type === "image" ? "image" : null,
                file: isSafeAssetPath(candidate.file) ? candidate.file : "",
            };
        })
        .filter(
            (post): post is MediaPostMeta =>
                post.type === "image" && Boolean(post.file),
        );
}

export function createProfileMeta(
    source: Record<string, unknown>,
    profile: ProfileConfig,
    supportedLanguages: string[],
    defaultLanguage: string,
): ProfileMeta {
    const declaredLanguages = Array.isArray(source.languages)
        ? source.languages.filter(isSafeLanguageCode)
        : supportedLanguages.slice();
    const contacts =
        source.contacts && typeof source.contacts === "object"
            ? (source.contacts as Record<string, unknown>)
            : {};
    const languages = declaredLanguages.length
        ? declaredLanguages
        : supportedLanguages.slice();

    return {
        id: profile.id,
        label:
            typeof source.label === "string" && source.label.trim()
                ? source.label.trim()
                : profile.label,
        contacts: {
            email: isSafeEmail(contacts.email) ? contacts.email : "",
            linkedin: isSafeHttpsUrl(contacts.linkedin)
                ? contacts.linkedin
                : "",
        },
        languages,
        defaultLanguage:
            typeof source.defaultLanguage === "string" &&
            languages.includes(source.defaultLanguage)
                ? source.defaultLanguage
                : defaultLanguage,
        assetsPath:
            typeof source.assetsPath === "string"
                ? source.assetsPath
                : "assets/",
        mediaPosts: normalizeMediaPosts(source.mediaPosts),
    };
}
