<template>
    <div class="profile-selector" :data-open="isOpen ? 'true' : 'false'">
        <div ref="fieldRef" class="profile-selector-field">
            <input
                :value="displayValue"
                id="profile-selector-input"
                class="profile-selector-input"
                type="text"
                role="combobox"
                aria-autocomplete="list"
                :aria-expanded="isOpen ? 'true' : 'false'"
                aria-controls="profile-selector-listbox"
                aria-haspopup="listbox"
                autocomplete="off"
                spellcheck="false"
                @focus="emit('open')"
                @click="emit('open')"
                @input="handleInput"
                @blur="handleBlur"
                @keydown.down.prevent="emit('arrow', 1)"
                @keydown.up.prevent="emit('arrow', -1)"
                @keydown.enter.prevent="emit('select-highlighted')"
                @keydown.esc.prevent="emit('reset')"
            />
            <button
                class="profile-selector-toggle"
                type="button"
                aria-label="Toggle profile selector"
                @click="toggleSelector"
            >
                <span
                    class="profile-selector-toggle-icon"
                    aria-hidden="true"
                ></span>
            </button>
        </div>

        <div
            class="profile-selector-popover"
            :style="popoverStyle"
            :hidden="!isOpen"
        >
            <ul
                id="profile-selector-listbox"
                class="profile-selector-list"
                role="listbox"
            >
                <li
                    v-for="(profile, index) in profiles"
                    :id="`profile-option-${profile.id}`"
                    :key="profile.id"
                    class="profile-selector-option"
                    :class="{ active: index === highlightedIndex }"
                    role="option"
                    :aria-selected="
                        profile.id === activeProfileId ? 'true' : 'false'
                    "
                    @mousedown.prevent="emit('select', profile.id)"
                    @mousemove="emit('highlight', index)"
                >
                    {{ profile.label }}
                </li>
            </ul>
            <p class="profile-selector-empty" :hidden="profiles.length > 0">
                {{ noResultsLabel }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import type { ProfileConfig } from "../types";

const props = defineProps<{
    activeProfileId: string;
    activeProfileLabel: string;
    filterValue: string;
    highlightedIndex: number;
    isOpen: boolean;
    noResultsLabel: string;
    popoverStyle: Record<string, string>;
    profiles: ProfileConfig[];
}>();

const emit = defineEmits<{
    (event: "arrow", direction: 1 | -1): void;
    (event: "elements", field: HTMLElement | null): void;
    (event: "filter", value: string): void;
    (event: "highlight", index: number): void;
    (event: "open"): void;
    (event: "reset"): void;
    (event: "select", profileId: string): void;
    (event: "select-highlighted"): void;
}>();

const fieldRef = ref<HTMLElement | null>(null);
const displayValue = computed(
    () => props.filterValue || props.activeProfileLabel,
);

function handleInput(event: Event): void {
    emit("filter", (event.target as HTMLInputElement).value);
}

function handleBlur(): void {
    window.setTimeout(() => emit("reset"), 120);
}

function toggleSelector(): void {
    if (props.isOpen) {
        emit("reset");
        return;
    }
    emit("open");
    nextTick(() => fieldRef.value?.querySelector("input")?.focus());
}

onMounted(() => {
    emit("elements", fieldRef.value);
});
</script>
