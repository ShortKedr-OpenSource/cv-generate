import { computed, nextTick, onBeforeUnmount, reactive, ref } from "vue";
import type { ProfileConfig } from "../types";

interface UseProfileSelectorOptions {
    getActiveProfileId: () => string;
    getActiveProfileLabel: () => string;
    getProfiles: () => ProfileConfig[];
}

export function useProfileSelector(options: UseProfileSelectorOptions) {
    const profileSelectorFilter = ref("");
    const profileSelectorOpen = ref(false);
    const highlightedProfileIndex = ref(-1);
    const selectorPopoverStyle = reactive<Record<string, string>>({});
    const selectorField = ref<HTMLElement | null>(null);

    const filteredProfiles = computed(() => {
        const filter = profileSelectorFilter.value.trim().toLowerCase();
        return options
            .getProfiles()
            .filter(
                (profile) =>
                    !filter || profile.label.toLowerCase().includes(filter),
            );
    });

    function syncHighlightedIndex(): void {
        highlightedProfileIndex.value = filteredProfiles.value.findIndex(
            (profile) => profile.id === options.getActiveProfileId(),
        );
    }

    function updateSelectorPopoverPosition(): void {
        if (!selectorField.value || !profileSelectorOpen.value) {
            return;
        }

        const fieldRect = selectorField.value.getBoundingClientRect();
        const viewportPadding = 12;
        const maxHeight = Math.max(
            160,
            window.innerHeight - fieldRect.bottom - viewportPadding - 8,
        );

        selectorPopoverStyle.left = "0";
        selectorPopoverStyle.top = "calc(100% + 8px)";
        selectorPopoverStyle.width = "100%";
        selectorPopoverStyle.maxHeight = `${maxHeight}px`;
    }

    function setProfileFilter(rawValue: string): void {
        const selectedLabel = options.getActiveProfileLabel();
        profileSelectorFilter.value =
            rawValue.trim() === selectedLabel ? "" : rawValue;
        profileSelectorOpen.value = true;
        syncHighlightedIndex();
        nextTick(updateSelectorPopoverPosition);
    }

    function resetProfileSelector(): void {
        profileSelectorFilter.value = "";
        profileSelectorOpen.value = false;
        syncHighlightedIndex();
    }

    function openProfileSelector(showAll = true): void {
        if (showAll) {
            profileSelectorFilter.value = "";
        }
        profileSelectorOpen.value = true;
        syncHighlightedIndex();
        nextTick(updateSelectorPopoverPosition);
    }

    function highlightNextProfile(direction: 1 | -1): void {
        if (!filteredProfiles.value.length) {
            return;
        }

        const current =
            highlightedProfileIndex.value < 0
                ? 0
                : highlightedProfileIndex.value;
        highlightedProfileIndex.value =
            direction === 1
                ? (current + 1) % filteredProfiles.value.length
                : (current - 1 + filteredProfiles.value.length) %
                  filteredProfiles.value.length;
    }

    function setHighlightedProfileIndex(index: number): void {
        highlightedProfileIndex.value = index;
    }

    function setSelectorField(element: HTMLElement | null): void {
        selectorField.value = element;
        if (profileSelectorOpen.value) {
            nextTick(updateSelectorPopoverPosition);
        }
    }

    const resizeHandler = () => updateSelectorPopoverPosition();
    window.addEventListener("resize", resizeHandler);
    window.addEventListener("scroll", resizeHandler, true);

    onBeforeUnmount(() => {
        window.removeEventListener("resize", resizeHandler);
        window.removeEventListener("scroll", resizeHandler, true);
    });

    return {
        filteredProfiles,
        highlightedProfileIndex,
        highlightNextProfile,
        openProfileSelector,
        profileSelectorFilter,
        profileSelectorOpen,
        resetProfileSelector,
        selectorPopoverStyle,
        setHighlightedProfileIndex,
        setProfileFilter,
        setSelectorField,
    };
}
