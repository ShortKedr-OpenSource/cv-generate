<template>
    <aside class="sidebar">
        <section v-if="mediaPost" class="profile-photo-card side-card">
            <img
                class="profile-photo-image"
                :src="mediaPost.src"
                :alt="mediaPost.alt"
            />
            <p v-if="mediaPost.description" class="profile-photo-description">
                {{ mediaPost.description }}
            </p>
        </section>

        <section class="contact-info side-card">
            <h2>{{ cvData.contact || "Contact" }}</h2>
            <p v-if="meta.contacts.email" class="contact-email-row">
                <a
                    class="profile-email-link"
                    :href="`mailto:${meta.contacts.email}`"
                    >{{ meta.contacts.email }}</a
                >
            </p>
            <p v-if="meta.contacts.linkedin" class="contact-linkedin-row">
                <a
                    class="profile-linkedin-link"
                    :href="meta.contacts.linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ cvData.linkedin || "LinkedIn" }}
                </a>
            </p>
        </section>

        <section class="skills side-card">
            <h2>{{ cvData.skillsTitle || "Key Skills" }}</h2>
            <ul id="skills-list">
                <li v-for="skill in cvData.skills || []" :key="skill">
                    {{ skill }}
                </li>
            </ul>
        </section>

        <section class="languages side-card">
            <h2>{{ cvData.languagesTitle || "Languages" }}</h2>
            <ul id="languages-list">
                <li v-for="language in cvData.languages || []" :key="language">
                    {{ language }}
                </li>
            </ul>
        </section>

        <section class="certifications side-card">
            <h2>{{ cvData.certificationsTitle || "Certifications" }}</h2>
            <p>{{ cvData.certifications || "" }}</p>
        </section>

        <section class="gdpr-compliance side-card">
            <p>{{ cvData.gdpr || "" }}</p>
        </section>
    </aside>
</template>

<script setup lang="ts">
import type { CvTranslation, ProfileMeta } from "../types";

defineProps<{
    cvData: CvTranslation;
    mediaPost: { src: string; description: string; alt: string } | null;
    meta: ProfileMeta;
}>();
</script>
