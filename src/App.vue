<script setup>
import { ref, onMounted } from 'vue';
import LoginView from './views/LoginView.vue';

const isLoggedIn = ref(false);
const sessionToken = ref('');
const tgUserId = ref('');

onMounted(async () => {
    let saved = null;
    try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key: 'shoof_session' });
        saved = value;
    } catch {
        saved = localStorage.getItem('shoof_session');
    }
    if (saved) {
        sessionToken.value = saved;
        isLoggedIn.value = true;
    }
});

function onLoggedIn({ session, userId }) {
    sessionToken.value = session || '';
    tgUserId.value = userId || '';
    isLoggedIn.value = true;
}

function getShoofUrl() {
    const base = 'https://shoof-tv.net';
    const params = new URLSearchParams();
    params.set('source', 'apk');
    if (sessionToken.value) params.set('mobile_token', sessionToken.value);
    return `${base}?${params.toString()}`;
}
</script>

<template>
    <LoginView v-if="!isLoggedIn" @logged-in="onLoggedIn" />

    <div v-else class="fixed inset-0 bg-black">
        <iframe
            :src="getShoofUrl()"
            class="w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media"
            allowfullscreen
        ></iframe>
    </div>
</template>