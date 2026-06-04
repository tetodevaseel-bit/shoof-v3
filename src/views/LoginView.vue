<script setup>
import { ref } from 'vue';

const emit = defineEmits(['logged-in']);

const step = ref('welcome');
const phone = ref('');
const code = ref(['', '', '', '', '']);
const password = ref('');
const error = ref('');
const loading = ref(false);
const selectedCountry = ref({ code: '+966', name: 'السعودية', flag: '🇸🇦' });
const showCountry = ref(false);
const codeInputs = ref([]);

let client = null;
let resolveCode = null;
let resolvePassword = null;

const countries = [
    { code: '+966', name: 'السعودية', flag: '🇸🇦' },
    { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
    { code: '+965', name: 'الكويت', flag: '🇰🇼' },
    { code: '+974', name: 'قطر', flag: '🇶🇦' },
    { code: '+973', name: 'البحرين', flag: '🇧🇭' },
    { code: '+968', name: 'عُمان', flag: '🇴🇲' },
    { code: '+962', name: 'الأردن', flag: '🇯🇴' },
    { code: '+20',  name: 'مصر', flag: '🇪🇬' },
    { code: '+964', name: 'العراق', flag: '🇮🇶' },
    { code: '+1',   name: 'أمريكا', flag: '🇺🇸' },
    { code: '+44',  name: 'بريطانيا', flag: '🇬🇧' },
    { code: '+90',  name: 'تركيا', flag: '🇹🇷' },
    { code: '+7',   name: 'روسيا', flag: '🇷🇺' },
    { code: '+91',  name: 'الهند', flag: '🇮🇳' },
    { code: '+92',  name: 'باكستان', flag: '🇵🇰' },
];

async function startLogin() {
    if (!phone.value.trim() || loading.value) return;
    loading.value = true;
    error.value = '';
    try {
        // Dynamic import - only loads when user actually needs it
        const { TelegramClient } = await import('telegram');
        const { StringSession } = await import('telegram/sessions/index.js');

        const session = new StringSession('');
        client = new TelegramClient(session, 26243133, '5b4fa6096be5bd4cfcbe3c8398258aed', {
            connectionRetries: 3,
            useWSS: true,          // Required for browser/WebView
            testServers: false,
        });

        await client.start({
            phoneNumber: () => selectedCountry.value.code + phone.value.trim(),
            phoneCode: () => new Promise(resolve => {
                resolveCode = resolve;
                step.value = 'code';
                loading.value = false;
            }),
            password: () => new Promise(resolve => {
                resolvePassword = resolve;
                step.value = 'password';
                loading.value = false;
            }),
            onError: (err) => { error.value = err.message; loading.value = false; },
        });

        const sessionStr = client.session.save();
        const me = await client.getMe();
        const userId = me.id?.toString() || '';

        try {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({ key: 'tg_session', value: sessionStr });
            await Preferences.set({ key: 'tg_user_id', value: userId });
        } catch {
            localStorage.setItem('tg_session', sessionStr);
            localStorage.setItem('tg_user_id', userId);
        }
        emit('logged-in', { session: sessionStr, userId });
    } catch (e) {
        error.value = e.message || 'حدث خطأ، حاول مجدداً';
        loading.value = false;
    }
}

function onCodeInput(i, e) {
    const val = e.target.value.replace(/\D/g, '');
    code.value[i] = val;
    if (val && i < 4) codeInputs.value[i + 1]?.focus();
    if (code.value.join('').length === 5) submitCode();
}

function onCodeKeydown(i, e) {
    if (e.key === 'Backspace' && !code.value[i] && i > 0) {
        codeInputs.value[i - 1]?.focus();
    }
}

function submitCode() {
    const full = code.value.join('');
    if (full.length !== 5 || !resolveCode) return;
    loading.value = true;
    resolveCode(full);
}

function submitPassword() {
    if (!password.value.trim() || !resolvePassword) return;
    loading.value = true;
    resolvePassword(password.value.trim());
}
</script>

<template>
<div class="min-h-screen bg-black text-white flex flex-col" dir="rtl">

    <!-- Welcome -->
    <div v-if="step === 'welcome'" class="flex flex-col flex-1">
        <div class="flex-1 flex flex-col items-center justify-center gap-6 px-8">
            <div class="w-24 h-24 rounded-3xl bg-blue-500 flex items-center justify-center text-5xl shadow-2xl shadow-blue-900/50">
                📺
            </div>
            <div class="text-center">
                <h1 class="text-5xl font-black tracking-tight">شوف <span class="text-blue-400">TV</span></h1>
                <p class="text-gray-400 mt-3 text-sm leading-relaxed">شاهد آلاف المسلسلات والأنيميات<br/>بجودة عالية في أي مكان</p>
            </div>
        </div>
        <div class="px-6 pb-14 space-y-3">
            <button @click="step='phone'"
                class="w-full py-4 rounded-2xl bg-blue-500 font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-blue-900/40">
                ابدأ المشاهدة مجاناً
            </button>
            <p class="text-center text-gray-600 text-xs">يتطلب حساب تيليجرام</p>
        </div>
    </div>

    <!-- Phone -->
    <div v-else-if="step === 'phone'" class="flex flex-col flex-1 px-6">
        <div class="pt-12 pb-6">
            <button @click="step='welcome'" class="text-gray-500 text-sm flex items-center gap-1 mb-6">← رجوع</button>
            <h2 class="text-3xl font-black">أدخل رقمك</h2>
            <p class="text-gray-500 mt-1 text-sm">سيصلك رمز التحقق على تيليجرام</p>
        </div>
        <div class="space-y-3 flex-1">
            <button @click="showCountry=!showCountry"
                class="w-full bg-white/8 border border-white/12 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                <span class="text-2xl">{{ selectedCountry.flag }}</span>
                <div class="flex-1 text-right">
                    <div class="text-white text-sm font-medium">{{ selectedCountry.name }}</div>
                    <div class="text-gray-500 text-xs">{{ selectedCountry.code }}</div>
                </div>
                <span class="text-gray-600 text-xs">{{ showCountry ? '▲' : '▼' }}</span>
            </button>
            <div v-if="showCountry" class="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                <button v-for="c in countries" :key="c.code" @click="selectedCountry=c; showCountry=false"
                    class="w-full px-4 py-3 flex items-center gap-3 active:bg-white/8 border-b border-white/5 last:border-0">
                    <span class="text-xl">{{ c.flag }}</span>
                    <span class="flex-1 text-sm text-right text-white">{{ c.name }}</span>
                    <span class="text-gray-500 text-xs font-mono">{{ c.code }}</span>
                </button>
            </div>
            <div class="bg-white/8 border border-white/12 rounded-2xl flex overflow-hidden focus-within:border-blue-500/50 transition-colors">
                <span class="px-4 flex items-center text-gray-400 text-sm font-mono border-l border-white/10">{{ selectedCountry.code }}</span>
                <input v-model="phone" type="tel" inputmode="numeric" placeholder="5XXXXXXXX"
                    class="flex-1 bg-transparent text-white px-4 py-4 outline-none placeholder-gray-700 text-base"
                    @keyup.enter="startLogin" />
            </div>
            <p v-if="error" class="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-2.5 text-red-400 text-sm">{{ error }}</p>
        </div>
        <div class="pb-14 pt-6">
            <button @click="startLogin" :disabled="!phone.trim() || loading"
                class="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-40"
                :class="phone.trim() ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 text-gray-600'">
                {{ loading ? 'جاري الاتصال...' : 'التالي ←' }}
            </button>
        </div>
    </div>

    <!-- Code -->
    <div v-else-if="step === 'code'" class="flex flex-col flex-1 px-6">
        <div class="pt-12 pb-8">
            <h2 class="text-3xl font-black">رمز تيليجرام</h2>
            <p class="text-gray-500 mt-1 text-sm">أدخل الرمز الذي وصلك على تيليجرام</p>
        </div>
        <div class="flex gap-3 justify-center mb-6" dir="ltr">
            <input v-for="(_, i) in 5" :key="i" :ref="el => codeInputs[i] = el"
                v-model="code[i]" type="tel" inputmode="numeric" maxlength="1"
                @input="onCodeInput(i, $event)" @keydown="onCodeKeydown(i, $event)"
                class="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 bg-white/8 outline-none transition-colors"
                :class="code[i] ? 'border-blue-500 text-white' : 'border-white/15 text-white'" />
        </div>
        <p v-if="error" class="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-2.5 text-red-400 text-sm text-center mb-4">{{ error }}</p>
        <button @click="submitCode" :disabled="code.join('').length !== 5 || loading"
            class="w-full py-4 rounded-2xl font-bold bg-blue-500 text-white active:scale-95 transition-all disabled:opacity-40">
            {{ loading ? 'جاري التحقق...' : 'تأكيد ←' }}
        </button>
    </div>

    <!-- 2FA -->
    <div v-else-if="step === 'password'" class="flex flex-col flex-1 px-6">
        <div class="pt-12 pb-8">
            <h2 class="text-3xl font-black">التحقق بخطوتين</h2>
            <p class="text-gray-500 mt-1 text-sm">أدخل كلمة مرور التحقق بخطوتين</p>
        </div>
        <div class="space-y-4 flex-1">
            <input v-model="password" type="password" placeholder="كلمة المرور"
                class="w-full bg-white/8 border border-white/12 rounded-2xl px-4 py-4 text-white outline-none focus:border-blue-500/50 placeholder-gray-700"
                @keyup.enter="submitPassword" />
            <p v-if="error" class="bg-red-900/30 border border-red-800/50 rounded-xl px-4 py-2.5 text-red-400 text-sm">{{ error }}</p>
        </div>
        <div class="pb-14 pt-6">
            <button @click="submitPassword" :disabled="!password.trim() || loading"
                class="w-full py-4 rounded-2xl font-bold bg-blue-500 text-white active:scale-95 transition-all disabled:opacity-40">
                {{ loading ? 'جاري الدخول...' : 'دخول ←' }}
            </button>
        </div>
    </div>

</div>
</template>