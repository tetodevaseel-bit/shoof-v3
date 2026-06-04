<script setup>
import { ref, onUnmounted } from 'vue';

const emit = defineEmits(['logged-in']);

const step = ref('welcome');
const otp = ref(['', '', '', '', '', '']);
const error = ref('');
const loading = ref(false);
const deepLink = ref('');
const authToken = ref('');
const otpInputs = ref([]);
let pollInterval = null;

const API = 'https://shoof-tv.net/api/v1';

async function requestAuth() {
    loading.value = true;
    error.value = '';
    try {
        const res = await fetch(`${API}/mobile/auth/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (!data.token) throw new Error('فشل الاتصال بالخادم');

        authToken.value = data.token;
        deepLink.value = data.deep_link;
        step.value = 'telegram';
        startPolling();
    } catch (e) {
        error.value = e.message || 'تعذر الاتصال بالخادم';
    } finally {
        loading.value = false;
    }
}

function openTelegram() {
    // Convert https://t.me/Bot?start=X to tg://resolve?domain=Bot&start=X
    const tgUrl = deepLink.value
        .replace('https://t.me/', 'tg://resolve?domain=')
        .replace('?start=', '&start=');
    // Try tg:// first (opens Telegram directly), fallback to https
    try {
        window.location.href = tgUrl;
        setTimeout(() => { window.open(deepLink.value, '_system'); }, 1500);
    } catch {
        window.open(deepLink.value, '_system');
    }
}

function startPolling() {
    pollInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API}/mobile/auth/status/${authToken.value}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (data.status === 'claimed') {
                clearInterval(pollInterval);
                step.value = 'otp';
            } else if (data.status === 'expired') {
                clearInterval(pollInterval);
                error.value = 'انتهت صلاحية الرابط، حاول مجدداً';
                step.value = 'welcome';
            }
        } catch {}
    }, 2000);
}

function onOtpInput(i, e) {
    const val = e.target.value.replace(/\D/g, '');
    otp.value[i] = val;
    if (val && i < 5) otpInputs.value[i + 1]?.focus();
    if (otp.value.join('').length === 6) submitOtp();
}

function onOtpKeydown(i, e) {
    if (e.key === 'Backspace' && !otp.value[i] && i > 0) otpInputs.value[i - 1]?.focus();
}

async function submitOtp() {
    const code = otp.value.join('');
    if (code.length !== 6 || loading.value) return;
    loading.value = true;
    error.value = '';
    try {
        const res = await fetch(`${API}/mobile/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ token: authToken.value, otp_code: code })
        });
        const data = await res.json();
        if (data.status === 'ok' && data.session_token) {
            try {
                const { Preferences } = await import('@capacitor/preferences');
                await Preferences.set({ key: 'shoof_session', value: data.session_token });
            } catch {
                localStorage.setItem('shoof_session', data.session_token);
            }
            emit('logged-in', { session: data.session_token, userId: data.user?.telegram_id || '' });
        } else {
            error.value = data.message || 'رمز غير صحيح';
            otp.value = ['', '', '', '', '', ''];
            otpInputs.value[0]?.focus();
        }
    } catch (e) {
        error.value = 'تعذر التحقق، حاول مجدداً';
    } finally {
        loading.value = false;
    }
}

onUnmounted(() => { if (pollInterval) clearInterval(pollInterval); });
</script>

<template>
<div class="min-h-screen bg-black text-white flex flex-col" dir="rtl">

    <!-- Welcome -->
    <div v-if="step === 'welcome'" class="flex flex-col flex-1">
        <div class="flex-1 flex flex-col items-center justify-center gap-6 px-8">
            <div class="w-24 h-24 rounded-3xl bg-blue-500 flex items-center justify-center text-5xl shadow-2xl shadow-blue-900/50">📺</div>
            <div class="text-center">
                <h1 class="text-5xl font-black tracking-tight">شوف <span class="text-blue-400">TV</span></h1>
                <p class="text-gray-400 mt-3 text-sm leading-relaxed">شاهد آلاف المسلسلات والأنيميات<br/>بجودة عالية في أي مكان</p>
            </div>
            <p v-if="error" class="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-3 text-red-400 text-sm text-center w-full">{{ error }}</p>
        </div>
        <div class="px-6 pb-14 space-y-3">
            <button @click="requestAuth" :disabled="loading"
                class="w-full py-4 rounded-2xl bg-blue-500 font-bold text-lg active:scale-95 transition-transform disabled:opacity-50">
                {{ loading ? 'جاري الاتصال...' : 'ابدأ المشاهدة مجاناً' }}
            </button>
            <p class="text-center text-gray-600 text-xs">يتطلب حساب تيليجرام</p>
        </div>
    </div>

    <!-- Open Telegram -->
    <div v-else-if="step === 'telegram'" class="flex flex-col flex-1 px-6">
        <div class="flex-1 flex flex-col items-center justify-center gap-8">
            <div class="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-4xl">✈️</div>
            <div class="text-center">
                <h2 class="text-2xl font-black">افتح تيليجرام</h2>
                <p class="text-gray-400 mt-2 text-sm leading-relaxed">
                    اضغط الزر أدناه لفتح تيليجرام<br/>
                    سيرسل لك @Crepixbot رمز التحقق
                </p>
            </div>
            <div class="flex items-center gap-2 text-blue-400 text-sm">
                <span class="animate-pulse">●</span>
                <span>بانتظار تأكيدك على تيليجرام...</span>
            </div>
        </div>
        <div class="pb-14 px-0 space-y-3">
            <button @click="openTelegram"
                class="w-full py-4 rounded-2xl bg-blue-500 font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-3">
                <span>✈️</span> فتح تيليجرام
            </button>
            <button @click="step='welcome'; if(pollInterval) clearInterval(pollInterval)"
                class="w-full py-3 rounded-2xl text-gray-500 text-sm">
                رجوع
            </button>
        </div>
    </div>

    <!-- OTP -->
    <div v-else-if="step === 'otp'" class="flex flex-col flex-1 px-6">
        <div class="pt-12 pb-8 text-center">
            <div class="text-4xl mb-4">🔐</div>
            <h2 class="text-2xl font-black">رمز التحقق</h2>
            <p class="text-gray-400 mt-2 text-sm">أدخل الرمز المكوّن من 6 أرقام<br/>الذي أرسله لك @Crepixbot</p>
        </div>
        <div class="flex gap-2 justify-center mb-6" dir="ltr">
            <input v-for="(_, i) in 6" :key="i" :ref="el => otpInputs[i] = el"
                v-model="otp[i]" type="tel" inputmode="numeric" maxlength="1"
                @input="onOtpInput(i, $event)" @keydown="onOtpKeydown(i, $event)"
                class="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-white/8 outline-none transition-colors"
                :class="otp[i] ? 'border-blue-500 text-white' : 'border-white/15 text-white'" />
        </div>
        <p v-if="error" class="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-2.5 text-red-400 text-sm text-center mb-4">{{ error }}</p>
        <button @click="submitOtp" :disabled="otp.join('').length !== 6 || loading"
            class="w-full py-4 rounded-2xl font-bold bg-blue-500 text-white active:scale-95 disabled:opacity-40">
            {{ loading ? 'جاري التحقق...' : 'تأكيد الدخول ←' }}
        </button>
    </div>

</div>
</template>