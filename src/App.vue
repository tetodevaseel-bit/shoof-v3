<script setup>
import { ref, onMounted } from 'vue';
import LoginView from './views/LoginView.vue';

const isLoggedIn = ref(false);

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
        goToShoof(saved);
    }
});

function onLoggedIn({ session }) {
    goToShoof(session);
}

function goToShoof(token) {
    // Navigate the entire WebView to shoof-tv.net — no iframe restrictions
    const url = `https://shoof-tv.net?source=apk&mobile_token=${encodeURIComponent(token)}`;
    window.location.replace(url);
}
</script>

<template>
    <LoginView v-if="!isLoggedIn" @logged-in="onLoggedIn" />
    <div v-else class="fixed inset-0 bg-black flex items-center justify-center">
        <div class="text-white text-center">
            <div class="text-4xl mb-4">🎬</div>
            <p class="text-gray-400">جاري التحميل...</p>
        </div>
    </div>
</template>