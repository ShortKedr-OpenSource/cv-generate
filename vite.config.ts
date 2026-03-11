import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const repoName = "cv-generate";

function copyRuntimeAssets() {
    const runtimeEntries = [
        "config",
        "locales",
        "profiles",
        "styles/themes",
    ];

    return {
        name: "copy-runtime-assets",
        async closeBundle() {
            const outDir = path.resolve(__dirname, "dist");

            for (const entry of runtimeEntries) {
                const source = path.resolve(__dirname, entry);
                const destination = path.resolve(outDir, entry);
                await mkdir(path.dirname(destination), { recursive: true });
                await cp(source, destination, { recursive: true, force: true });
            }

            const configPath = path.resolve(__dirname, "dist/config/app.json");
            const raw = await readFile(configPath, "utf8");
            const config = JSON.parse(raw) as Record<string, unknown>;
            if (!config.buildHash || config.buildHash === "dev") {
                config.buildHash = "local-dev";
            }
            await writeFile(
                configPath,
                `${JSON.stringify(config, null, 2)}\n`,
                "utf8",
            );
        },
    };
}

function cleanBundledThemes() {
    return {
        name: "clean-bundled-themes-and-extras",
        async writeBundle() {
            await rm(path.resolve(__dirname, "dist/assets/themes"), {
                recursive: true,
                force: true,
            });
            await rm(path.resolve(__dirname, "dist/favicon.ico"), {
                force: true,
            });
        },
    };
}

export default defineConfig({
    plugins: [vue(), copyRuntimeAssets(), cleanBundledThemes()],
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: true,
    },
});
