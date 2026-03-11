<template>
    <aside class="sidebar">
        <SidebarMediaCard :media-post="mediaPost" />
        <SidebarContactCard
            :contacts="meta.contacts"
            :linkedin-label="cvData.linkedin"
            :title="cvData.contact"
        />
        <SidebarListCard
            card-class="skills"
            list-id="skills-list"
            :items="cvData.skills"
            :title="cvData.skillsTitle || 'Key Skills'"
        />
        <SidebarListCard
            card-class="languages"
            list-id="languages-list"
            :items="cvData.languages"
            :title="cvData.languagesTitle || 'Languages'"
        />
        <SidebarTextCard
            card-class="certifications"
            :text="cvData.certifications"
            :title="cvData.certificationsTitle || 'Certifications'"
        />
        <SidebarTextCard card-class="gdpr-compliance" :text="cvData.gdpr" />
    </aside>
</template>

<script setup lang="ts">
import type { CvTranslation, ProfileMeta } from "../types";
import SidebarContactCard from "./sidebar-cards/SidebarContactCard.vue";
import SidebarListCard from "./sidebar-cards/SidebarListCard.vue";
import SidebarMediaCard from "./sidebar-cards/SidebarMediaCard.vue";
import SidebarTextCard from "./sidebar-cards/SidebarTextCard.vue";

defineProps<{
    cvData: CvTranslation;
    mediaPost: { src: string; description: string; alt: string } | null;
    meta: ProfileMeta;
}>();
</script>
