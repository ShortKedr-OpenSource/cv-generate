<template>
    <section class="contact-info side-card">
        <h2>{{ title || "Contact" }}</h2>
        <p v-if="contacts.email" class="contact-email-row">
            <a class="profile-email-link" :href="`mailto:${contacts.email}`">
                {{ contacts.email }}
            </a>
        </p>
        <p v-if="contacts.linkedin" class="contact-linkedin-row">
            <a
                class="profile-linkedin-link"
                :href="contacts.linkedin"
                target="_blank"
                rel="noopener noreferrer"
            >
                {{ linkedinLabel || "LinkedIn" }}
            </a>
        </p>
    </section>
</template>

<script setup lang="ts">
import type { ProfileMeta } from "../../types";

defineProps<{
    title?: string;
    linkedinLabel?: string;
    contacts: ProfileMeta["contacts"];
}>();
</script>
