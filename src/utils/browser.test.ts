import { describe, expect, it, vi } from "vitest";
import {
    appendVersionParam,
    getRequestedProfileIdFromUrl,
    readStoredValue,
    resolveProjectVersionState,
    writeStoredValue,
} from "./browser";

describe("browser helpers", () => {
    it("reads and writes storage safely", () => {
        const storage = {
            values: new Map<string, string>(),
            getItem(key: string) {
                return this.values.get(key) || null;
            },
            setItem(key: string, value: string) {
                this.values.set(key, value);
            },
        };

        writeStoredValue(storage, "theme", "meadow");

        expect(readStoredValue(storage, "theme")).toBe("meadow");
        expect(readStoredValue(null, "theme")).toBe("");
    });

    it("extracts only safe profile ids from url", () => {
        expect(
            getRequestedProfileIdFromUrl("https://example.com/?profile=harold"),
        ).toBe("harold");
        expect(
            getRequestedProfileIdFromUrl(
                "https://example.com/?profile=../../etc/passwd",
            ),
        ).toBeNull();
    });

    it("appends version query param relative to current url", () => {
        expect(
            appendVersionParam(
                "profiles/harold/profile.json",
                "build-1",
                "https://example.com/cv-generate/?profile=harold",
            ),
        ).toBe("/cv-generate/profiles/harold/profile.json?v=build-1");
    });

    it("returns redirect metadata when version is stale", () => {
        const config = {
            version: "2026-03-11-1",
            buildHash: "local-dev",
            languages: ["en"],
            themes: [],
            defaults: {
                profile: "harold",
                language: "en",
                theme: "meadow",
            },
            features: {
                profileSelector: true,
            },
            profiles: [],
        };

        const state = resolveProjectVersionState(
            config,
            "https://example.com/cv-generate/",
            "",
        );

        expect(state.didRedirect).toBe(true);
        expect(state.cacheKey).toBe("local-dev");
        expect(state.redirectUrl).toBe(
            "https://example.com/cv-generate/?v=local-dev",
        );
    });

    it("does not throw on broken storage implementations", () => {
        const brokenStorage = {
            getItem: vi.fn(() => {
                throw new Error("blocked");
            }),
            setItem: vi.fn(() => {
                throw new Error("blocked");
            }),
        };

        expect(readStoredValue(brokenStorage, "theme")).toBe("");
        expect(() => writeStoredValue(brokenStorage, "theme", "sand")).not.toThrow();
    });
});
