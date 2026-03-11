<template>
    <section
        class="tooling-panel"
        :data-collapsed="collapsed ? 'true' : 'false'"
    >
        <div class="tooling-panel-header-row">
            <div class="tooling-panel-header">
                <h2>{{ systemData.toolingTitle || "Controls" }}</h2>
            </div>
            <div class="tooling-panel-header-actions">
                <p class="tooling-description">
                    {{
                        systemData.toolingDescription ||
                        "Switch language, theme, and export actions from one place."
                    }}
                </p>
                <button
                    class="tooling-panel-toggle"
                    type="button"
                    :aria-expanded="collapsed ? 'false' : 'true'"
                    aria-controls="tooling-panel-controls"
                    :aria-label="toggleLabel"
                    @click="emit('toggle-collapsed')"
                >
                    <span class="tooling-panel-toggle-label">{{
                        toggleLabel
                    }}</span>
                    <span
                        class="tooling-panel-toggle-icon"
                        aria-hidden="true"
                    ></span>
                </button>
            </div>
        </div>

        <div
            id="tooling-panel-controls"
            class="tooling-panel-controls"
            :style="controlsStyle"
            :aria-hidden="collapsed ? 'true' : 'false'"
            :inert="collapsed"
        >
            <div ref="controlsInnerRef" class="tooling-panel-controls-inner">
                <div class="tool-group tool-group-compact">
                    <div
                        class="tool-subgroup profile-subgroup"
                        :hidden="!profileSelectorEnabled"
                    >
                        <p class="tool-group-label">
                            {{ systemData.profileLabel || "Profile" }}
                        </p>
                        <ProfileSelector
                            v-if="profileSelectorEnabled"
                            :active-profile-id="activeProfileId"
                            :active-profile-label="activeProfileLabel"
                            :filter-value="profileFilter"
                            :highlighted-index="highlightedIndex"
                            :is-open="profileOpen"
                            :no-results-label="
                                systemData.profileNoResults ||
                                'No matching profiles'
                            "
                            :popover-style="popoverStyle"
                            :profiles="filteredProfiles"
                            @arrow="
                                (direction) => emit('move-highlight', direction)
                            "
                            @elements="(field) => emit('selector-field', field)"
                            @filter="(value) => emit('filter-profile', value)"
                            @highlight="
                                (index) => emit('highlight-profile', index)
                            "
                            @open="emit('open-profile-selector')"
                            @reset="emit('reset-profile-selector')"
                            @select="
                                (profileId) => emit('change-profile', profileId)
                            "
                            @select-highlighted="
                                emit('select-highlighted-profile')
                            "
                        />
                    </div>

                    <div class="tool-subgroup">
                        <p class="tool-group-label">
                            {{ systemData.languageLabel || "Language" }}
                        </p>
                        <div class="language-switcher">
                            <button
                                v-for="language in languages"
                                :key="language"
                                type="button"
                                :class="{ active: language === activeLanguage }"
                                @click="emit('change-language', language)"
                            >
                                {{ language.toUpperCase() }}
                            </button>
                        </div>
                    </div>

                    <div class="tool-subgroup tool-subgroup-theme">
                        <p class="tool-group-label">
                            {{ systemData.themeLabel || "Theme" }}
                        </p>
                        <div class="theme-switcher">
                            <button
                                v-for="theme in themes"
                                :key="theme.id"
                                type="button"
                                :class="{ active: theme.id === selectedTheme }"
                                @click="emit('change-theme', theme.id)"
                            >
                                {{ theme.label }}
                            </button>
                        </div>
                        <div
                            class="theme-status"
                            role="status"
                            aria-live="polite"
                            :hidden="!themeStatusVisible"
                        >
                            {{ themeStatus }}
                        </div>
                    </div>
                </div>

                <div class="tool-group tool-group-actions">
                    <p class="tool-group-label">
                        {{ systemData.actionsLabel || "Actions" }}
                    </p>
                    <div class="actions">
                        <button
                            class="export-button"
                            type="button"
                            @click="emit('export-pdf', 'default')"
                        >
                            {{ systemData.exportPdf || "Export PDF" }}
                        </button>
                        <button
                            class="export-button export-button-secondary"
                            type="button"
                            @click="emit('export-pdf', 'ats')"
                        >
                            {{ systemData.exportAtsPdf || "Export ATS PDF" }}
                        </button>
                        <button
                            v-if="atsProvider"
                            class="ats-button"
                            type="button"
                            @click="emit('open-ats')"
                        >
                            {{ systemData.atsAction || atsProvider.label }}
                        </button>
                    </div>
                </div>

                <div
                    v-if="atsProvider"
                    class="ats-info tooling-panel-info"
                    role="note"
                >
                    <p class="ats-info-title">
                        {{ systemData.atsTitle || "ATS Score" }}
                    </p>
                    <p class="ats-info-description">
                        {{ systemData.atsDescription || "" }}
                    </p>
                    <p class="ats-info-hint" :hidden="!atsProvider.requiresPdf">
                        {{
                            atsProvider.requiresPdf
                                ? systemData.atsHintUseCurrentPdf || ""
                                : ""
                        }}
                    </p>
                    <p
                        class="ats-info-notice"
                        :hidden="!atsProvider.showDisclaimer"
                    >
                        {{
                            atsProvider.showDisclaimer
                                ? systemData.atsExternalNotice || ""
                                : ""
                        }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import type {
    AtsProvider,
    ProfileConfig,
    SystemTranslation,
    ThemeConfig,
} from "../types";
import ProfileSelector from "./ProfileSelector.vue";

const props = defineProps<{
    activeLanguage: string;
    activeProfileId: string;
    activeProfileLabel: string;
    atsProvider: AtsProvider | null;
    collapsed: boolean;
    filteredProfiles: ProfileConfig[];
    highlightedIndex: number;
    languages: string[];
    popoverStyle: Record<string, string>;
    profileFilter: string;
    profileOpen: boolean;
    profileSelectorEnabled: boolean;
    selectedTheme: string;
    systemData: SystemTranslation;
    themeStatus: string;
    themeStatusVisible: boolean;
    themes: ThemeConfig[];
}>();

const emit = defineEmits<{
    (event: "change-language", language: string): void;
    (event: "change-profile", profileId: string): void;
    (event: "change-theme", themeId: string): void;
    (event: "export-pdf", mode: "default" | "ats"): void;
    (event: "filter-profile", value: string): void;
    (event: "highlight-profile", index: number): void;
    (event: "move-highlight", direction: 1 | -1): void;
    (event: "open-ats"): void;
    (event: "open-profile-selector"): void;
    (event: "reset-profile-selector"): void;
    (event: "select-highlighted-profile"): void;
    (event: "selector-field", field: HTMLElement | null): void;
    (event: "toggle-collapsed"): void;
}>();

const controlsInnerRef = ref<HTMLElement | null>(null);
const controlsHeight = ref("auto");
let resizeObserver: ResizeObserver | null = null;

const toggleLabel = computed(() => {
    return props.collapsed
        ? props.systemData.showControls || "Show controls"
        : props.systemData.hideControls || "Hide controls";
});

const controlsStyle = computed<Record<string, string>>(() => ({
    height: props.collapsed ? "0px" : controlsHeight.value,
}));

function measureControlsHeight(): void {
    if (!controlsInnerRef.value) {
        return;
    }
    controlsHeight.value = `${controlsInnerRef.value.scrollHeight}px`;
}

watch(
    () => [
        props.collapsed,
        props.filteredProfiles.length,
        props.languages.length,
        props.themes.length,
        props.profileSelectorEnabled,
        props.themeStatusVisible,
        props.themeStatus,
        props.atsProvider?.id,
    ],
    async () => {
        await nextTick();
        measureControlsHeight();
    },
    { immediate: true },
);

onMounted(() => {
    measureControlsHeight();

    if (typeof ResizeObserver !== "undefined" && controlsInnerRef.value) {
        resizeObserver = new ResizeObserver(() => {
            measureControlsHeight();
        });
        resizeObserver.observe(controlsInnerRef.value);
    }
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
});
</script>
