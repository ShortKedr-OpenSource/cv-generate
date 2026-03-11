<template>
    <div v-if="activeCvData && activeProfileMeta">
        <div class="shell">
            <ControlsPanel
                :active-language="activeLanguage"
                :active-profile-id="activeProfileId"
                :active-profile-label="activeProfileConfig?.label || ''"
                :ats-provider="atsProvider"
                :collapsed="controlsCollapsed"
                :filtered-profiles="filteredProfiles"
                :highlighted-index="highlightedProfileIndex"
                :languages="supportedLanguages"
                :popover-style="selectorPopoverStyle"
                :profile-filter="profileSelectorFilter"
                :profile-open="profileSelectorOpen"
                :profile-selector-enabled="profileSelectorEnabled"
                :selected-theme="selectedTheme"
                :system-data="systemData"
                :theme-status="themeStatusMessage"
                :theme-status-visible="isThemeStatusVisible"
                :themes="availableThemes"
                @change-language="void changeLanguage($event)"
                @change-profile="void changeProfile($event)"
                @change-theme="void applyTheme($event)"
                @export-pdf="exportPdf($event)"
                @filter-profile="setProfileFilter"
                @highlight-profile="setHighlightedProfileIndex($event)"
                @move-highlight="highlightNextProfile($event)"
                @open-ats="openAtsChecker"
                @open-profile-selector="openProfileSelector(true)"
                @reset-profile-selector="resetProfileSelector"
                @select-highlighted-profile="void selectHighlightedProfile()"
                @selector-field="setSelectorField"
                @toggle-collapsed="setControlsCollapsed(!controlsCollapsed)"
            />

            <div class="container">
                <SidebarCards
                    :cv-data="activeCvData"
                    :media-post="mediaPost"
                    :meta="activeProfileMeta"
                />
                <ProfileSections :cv-data="activeCvData" />
            </div>
        </div>

        <AtsPrintView :cv-data="activeCvData" :meta="activeProfileMeta" />
        <BuildWatermark :label="buildLabel" />
    </div>

    <div v-else class="shell">
        <section class="tooling-panel">
            <div class="tooling-panel-header-row">
                <div class="tooling-panel-header">
                    <h2>Controls</h2>
                </div>
            </div>
            <div class="tooling-panel-info" role="status">
                {{ bootError || "Loading application..." }}
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AtsPrintView from "./components/AtsPrintView.vue";
import BuildWatermark from "./components/BuildWatermark.vue";
import ControlsPanel from "./components/ControlsPanel.vue";
import ProfileSections from "./components/ProfileSections.vue";
import SidebarCards from "./components/SidebarCards.vue";
import { useCvApp } from "./composables/useCvApp";

const app = useCvApp();

const {
    activeCvData,
    activeLanguage,
    activeProfileConfig,
    activeProfileId,
    activeProfileMeta,
    applyTheme,
    atsProvider,
    availableThemes,
    bootError,
    bootstrap,
    buildLabel,
    changeLanguage,
    changeProfile,
    controlsCollapsed,
    exportPdf,
    filteredProfiles,
    highlightedProfileIndex,
    highlightNextProfile,
    isThemeStatusVisible,
    mediaPost,
    openAtsChecker,
    openProfileSelector,
    profileSelectorEnabled,
    profileSelectorFilter,
    profileSelectorOpen,
    resetProfileSelector,
    selectedTheme,
    selectorPopoverStyle,
    setControlsCollapsed,
    setHighlightedProfileIndex,
    setProfileFilter,
    setSelectorField,
    selectHighlightedProfile,
    supportedLanguages,
    systemData,
    themeStatusMessage,
} = app;

onMounted(() => {
    void bootstrap();
});
</script>
