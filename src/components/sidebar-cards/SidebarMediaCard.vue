<template>
    <section v-if="mediaPost" class="profile-photo-card side-card">
        <img class="profile-photo-image" :src="mediaPost.src" :alt="mediaPost.alt" />
        <p v-if="mediaPost.description" class="profile-photo-description">
            {{ mediaPost.description }}
        </p>
    </section>
</template>

<script setup lang="ts">
import type { MediaPostView } from "../../types";

defineProps<{
    mediaPost: MediaPostView | null;
}>();
</script>
