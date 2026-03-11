import { describe, expect, it } from "vitest";
import { createAppRuntime, getRuntimeCacheKey, getVersionedRuntimePath } from "./appRuntime";
import type { AppConfig } from "../types";

describe("app runtime", () => {
    it("builds cache key from build hash first", () => {
        expect(
            getRuntimeCacheKey({
                appVersion: "1.0.0",
                appBuildHash: "abc123",
            }),
        ).toBe("abc123");
        expect(
            getRuntimeCacheKey({
                appVersion: "1.0.0",
                appBuildHash: "",
            }),
        ).toBe("1.0.0");
    });

    it("creates versioned runtime paths against the current app url", () => {
        expect(
            getVersionedRuntimePath(
                "locales/system/en.json",
                "build-1",
                "https://example.com/cv-generate/?profile=harold",
            ),
        ).toBe("/cv-generate/locales/system/en.json?v=build-1");
    });

    it("loads config and resolves translation fallback chain", async () => {
        const responses = new Map<string, unknown>([
            [
                "config/app.json",
                {
                    version: "1.0.0",
                    buildHash: "dev",
                    languages: ["en", "ru"],
                    themes: [
                        {
                            id: "meadow",
                            label: "Meadow",
                            stylesheet: "styles/themes/meadow.css",
                        },
                    ],
                    defaults: {
                        profile: "harold",
                        language: "en",
                        theme: "meadow",
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
                } satisfies AppConfig,
            ],
            [
                "/app/profiles/harold/profile.json?v=dev",
                {
                    label: "Harold",
                    defaultLanguage: "ru",
                    languages: ["ru", "en"],
                    contacts: {},
                    mediaPosts: [],
                },
            ],
            [
                "/app/profiles/harold/locales/en.json?v=dev",
                new Error("missing"),
            ],
            [
                "/app/profiles/harold/locales/ru.json?v=dev",
                {
                    title: "Harold CV",
                },
            ],
            [
                "/app/locales/system/ru.json?v=dev",
                {
                    toolingTitle: "Controls",
                },
            ],
        ]);

        const requestedPaths: string[] = [];

        async function fetchJsonMock<T>(
            path: string,
            _options?: RequestInit,
        ): Promise<T> {
            requestedPaths.push(path);
            const response = responses.get(path);
            if (response instanceof Error) {
                throw response;
            }
            if (!responses.has(path)) {
                throw new Error(`Unexpected path: ${path}`);
            }
            return response as T;
        }

        const runtime = createAppRuntime({
            fetchJson: fetchJsonMock,
            currentUrl: () => "https://example.com/app/",
        });

        const config = await runtime.loadAppConfig();
        runtime.state.appVersion = config.version;
        runtime.state.appBuildHash = config.buildHash || "";

        const translation = await runtime.ensureCvTranslation("harold", "en");
        const systemTranslation = await runtime.loadSystemTranslation("ru");

        expect(runtime.state.defaultProfileId).toBe("harold");
        expect(translation?.language).toBe("ru");
        expect(translation?.translation.title).toBe("Harold CV");
        expect(systemTranslation.toolingTitle).toBe("Controls");
        expect(requestedPaths[0]).toBe("config/app.json");
    });

    it("computes fallback language from profile metadata and config", () => {
        const runtime = createAppRuntime();
        runtime.state.supportedLanguages = ["en", "ru"];
        runtime.state.defaultLanguage = "en";

        expect(
            runtime.getFallbackProfileLanguage({
                id: "harold",
                label: "Harold",
                contacts: {
                    email: "",
                    linkedin: "",
                },
                languages: ["ru"],
                defaultLanguage: "ru",
                assetsPath: "assets",
                mediaPosts: [],
            }),
        ).toBe("ru");
        expect(runtime.getFallbackProfileLanguage(null)).toBe("en");
    });
});
