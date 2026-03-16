import { describe, expect, it } from "vitest";
import {
    createProfileMeta,
    isSafeHttpsUrl,
    isSafeThemeStylesheet,
    resolveAppConfig,
} from "./validation";

describe("validation helpers", () => {
    it("accepts only safe theme stylesheets under styles/themes", () => {
        expect(isSafeThemeStylesheet("styles/themes/meadow.css")).toBe(true);
        expect(isSafeThemeStylesheet("/styles/themes/meadow.css")).toBe(false);
        expect(isSafeThemeStylesheet("../themes/meadow.css")).toBe(false);
        expect(isSafeThemeStylesheet("https://example.com/theme.css")).toBe(
            false,
        );
    });

    it("accepts only https urls", () => {
        expect(isSafeHttpsUrl("https://example.com")).toBe(true);
        expect(isSafeHttpsUrl("http://example.com")).toBe(false);
        expect(isSafeHttpsUrl("javascript:alert(1)")).toBe(false);
    });

    it("resolves app config defaults against valid entries", () => {
        const resolved = resolveAppConfig({
            version: "1",
            buildHash: "abc",
            languages: ["en", "ru"],
            themes: [
                {
                    id: "meadow",
                    label: "Meadow",
                    stylesheet: "styles/themes/meadow.css",
                },
            ],
            defaults: {
                profile: "missing-profile",
                language: "de",
                theme: "missing-theme",
            },
            features: {
                profileSelector: true,
            },
            profiles: [
                {
                    id: "harold",
                    label: "Harold",
                    path: "profiles/harold",
                },
            ],
            integrations: {
                ats: {
                    enabled: true,
                    providerId: "enhancv",
                    providers: [
                        {
                            id: "enhancv",
                            label: "Enhancv",
                            url: "https://example.com",
                            openInNewTab: true,
                            requiresPdf: true,
                            showDisclaimer: true,
                        },
                    ],
                },
            },
        });

        expect(resolved.defaultLanguage).toBe("en");
        expect(resolved.defaultTheme).toBe("meadow");
        expect(resolved.defaultProfileId).toBe("harold");
        expect(resolved.profileSelectorEnabled).toBe(true);
        expect(resolved.atsIntegration.enabled).toBe(true);
    });

    it("creates profile metadata with sanitized defaults", () => {
        const meta = createProfileMeta(
            {
                label: "Profile Label",
                contacts: {
                    email: "person@example.com",
                    linkedin: "https://linkedin.com/in/person",
                    github: "https://github.com/person",
                },
                defaultLanguage: "ru",
                languages: ["ru"],
                assetsPath: "assets/gallery",
                mediaPosts: [
                    {
                        type: "image",
                        file: "portrait.png",
                    },
                    {
                        type: "video",
                        file: "clip.mp4",
                    },
                ],
            },
            {
                id: "harold",
                label: "Fallback Label",
                path: "profiles/harold",
            },
            ["en", "ru"],
            "en",
        );

        expect(meta.label).toBe("Profile Label");
        expect(meta.defaultLanguage).toBe("ru");
        expect(meta.contacts.email).toBe("person@example.com");
        expect(meta.contacts.github).toBe("https://github.com/person");
        expect(meta.mediaPosts).toEqual([
            {
                type: "image",
                file: "portrait.png",
            },
        ]);
    });
});
