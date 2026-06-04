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
const searchCountry = ref('');
const codeInputs = ref([]);

let client = null;
let resolveCode = null;
let resolvePassword = null;

// All Telegram countries
const allCountries = [
    { code: '+93',  name: 'أفغانستان', flag: '🇦🇫' },
    { code: '+355', name: 'ألبانيا', flag: '🇦🇱' },
    { code: '+213', name: 'الجزائر', flag: '🇩🇿' },
    { code: '+376', name: 'أندورا', flag: '🇦🇩' },
    { code: '+244', name: 'أنغولا', flag: '🇦🇴' },
    { code: '+54',  name: 'الأرجنتين', flag: '🇦🇷' },
    { code: '+374', name: 'أرمينيا', flag: '🇦🇲' },
    { code: '+61',  name: 'أستراليا', flag: '🇦🇺' },
    { code: '+43',  name: 'النمسا', flag: '🇦🇹' },
    { code: '+994', name: 'أذربيجان', flag: '🇦🇿' },
    { code: '+973', name: 'البحرين', flag: '🇧🇭' },
    { code: '+880', name: 'بنغلاديش', flag: '🇧🇩' },
    { code: '+375', name: 'بيلاروسيا', flag: '🇧🇾' },
    { code: '+32',  name: 'بلجيكا', flag: '🇧🇪' },
    { code: '+501', name: 'بليز', flag: '🇧🇿' },
    { code: '+229', name: 'بنين', flag: '🇧🇯' },
    { code: '+975', name: 'بوتان', flag: '🇧🇹' },
    { code: '+591', name: 'بوليفيا', flag: '🇧🇴' },
    { code: '+387', name: 'البوسنة', flag: '🇧🇦' },
    { code: '+267', name: 'بوتسوانا', flag: '🇧🇼' },
    { code: '+55',  name: 'البرازيل', flag: '🇧🇷' },
    { code: '+673', name: 'بروناي', flag: '🇧🇳' },
    { code: '+359', name: 'بلغاريا', flag: '🇧🇬' },
    { code: '+226', name: 'بوركينا فاسو', flag: '🇧🇫' },
    { code: '+257', name: 'بوروندي', flag: '🇧🇮' },
    { code: '+855', name: 'كمبوديا', flag: '🇰🇭' },
    { code: '+237', name: 'الكاميرون', flag: '🇨🇲' },
    { code: '+1',   name: 'كندا', flag: '🇨🇦' },
    { code: '+238', name: 'الرأس الأخضر', flag: '🇨🇻' },
    { code: '+236', name: 'أفريقيا الوسطى', flag: '🇨🇫' },
    { code: '+235', name: 'تشاد', flag: '🇹🇩' },
    { code: '+56',  name: 'تشيلي', flag: '🇨🇱' },
    { code: '+86',  name: 'الصين', flag: '🇨🇳' },
    { code: '+57',  name: 'كولومبيا', flag: '🇨🇴' },
    { code: '+269', name: 'جزر القمر', flag: '🇰🇲' },
    { code: '+242', name: 'الكونغو', flag: '🇨🇬' },
    { code: '+506', name: 'كوستاريكا', flag: '🇨🇷' },
    { code: '+385', name: 'كرواتيا', flag: '🇭🇷' },
    { code: '+53',  name: 'كوبا', flag: '🇨🇺' },
    { code: '+357', name: 'قبرص', flag: '🇨🇾' },
    { code: '+420', name: 'التشيك', flag: '🇨🇿' },
    { code: '+45',  name: 'الدنمارك', flag: '🇩🇰' },
    { code: '+253', name: 'جيبوتي', flag: '🇩🇯' },
    { code: '+593', name: 'الإكوادور', flag: '🇪🇨' },
    { code: '+20',  name: 'مصر', flag: '🇪🇬' },
    { code: '+503', name: 'السلفادور', flag: '🇸🇻' },
    { code: '+240', name: 'غينيا الاستوائية', flag: '🇬🇶' },
    { code: '+291', name: 'إريتريا', flag: '🇪🇷' },
    { code: '+372', name: 'إستونيا', flag: '🇪🇪' },
    { code: '+251', name: 'إثيوبيا', flag: '🇪🇹' },
    { code: '+679', name: 'فيجي', flag: '🇫🇯' },
    { code: '+358', name: 'فنلندا', flag: '🇫🇮' },
    { code: '+33',  name: 'فرنسا', flag: '🇫🇷' },
    { code: '+241', name: 'الغابون', flag: '🇬🇦' },
    { code: '+220', name: 'غامبيا', flag: '🇬🇲' },
    { code: '+995', name: 'جورجيا', flag: '🇬🇪' },
    { code: '+49',  name: 'ألمانيا', flag: '🇩🇪' },
    { code: '+233', name: 'غانا', flag: '🇬🇭' },
    { code: '+30',  name: 'اليونان', flag: '🇬🇷' },
    { code: '+502', name: 'غواتيمالا', flag: '🇬🇹' },
    { code: '+224', name: 'غينيا', flag: '🇬🇳' },
    { code: '+245', name: 'غينيا بيساو', flag: '🇬🇼' },
    { code: '+592', name: 'غيانا', flag: '🇬🇾' },
    { code: '+509', name: 'هايتي', flag: '🇭🇹' },
    { code: '+504', name: 'هندوراس', flag: '🇭🇳' },
    { code: '+36',  name: 'المجر', flag: '🇭🇺' },
    { code: '+354', name: 'آيسلندا', flag: '🇮🇸' },
    { code: '+91',  name: 'الهند', flag: '🇮🇳' },
    { code: '+62',  name: 'إندونيسيا', flag: '🇮🇩' },
    { code: '+98',  name: 'إيران', flag: '🇮🇷' },
    { code: '+964', name: 'العراق', flag: '🇮🇶' },
    { code: '+353', name: 'أيرلندا', flag: '🇮🇪' },
    { code: '+972', name: 'إسرائيل', flag: '🇮🇱' },
    { code: '+39',  name: 'إيطاليا', flag: '🇮🇹' },
    { code: '+1876',name: 'جامايكا', flag: '🇯🇲' },
    { code: '+81',  name: 'اليابان', flag: '🇯🇵' },
    { code: '+962', name: 'الأردن', flag: '🇯🇴' },
    { code: '+7',   name: 'كازاخستان', flag: '🇰🇿' },
    { code: '+254', name: 'كينيا', flag: '🇰🇪' },
    { code: '+965', name: 'الكويت', flag: '🇰🇼' },
    { code: '+996', name: 'قيرغيزستان', flag: '🇰🇬' },
    { code: '+856', name: 'لاوس', flag: '🇱🇦' },
    { code: '+371', name: 'لاتفيا', flag: '🇱🇻' },
    { code: '+961', name: 'لبنان', flag: '🇱🇧' },
    { code: '+266', name: 'ليسوتو', flag: '🇱🇸' },
    { code: '+231', name: 'ليبيريا', flag: '🇱🇷' },
    { code: '+218', name: 'ليبيا', flag: '🇱🇾' },
    { code: '+423', name: 'ليختنشتاين', flag: '🇱🇮' },
    { code: '+370', name: 'ليتوانيا', flag: '🇱🇹' },
    { code: '+352', name: 'لوكسمبورغ', flag: '🇱🇺' },
    { code: '+261', name: 'مدغشقر', flag: '🇲🇬' },
    { code: '+265', name: 'مالاوي', flag: '🇲🇼' },
    { code: '+60',  name: 'ماليزيا', flag: '🇲🇾' },
    { code: '+960', name: 'المالديف', flag: '🇲🇻' },
    { code: '+223', name: 'مالي', flag: '🇲🇱' },
    { code: '+356', name: 'مالطا', flag: '🇲🇹' },
    { code: '+222', name: 'موريتانيا', flag: '🇲🇷' },
    { code: '+230', name: 'موريشيوس', flag: '🇲🇺' },
    { code: '+52',  name: 'المكسيك', flag: '🇲🇽' },
    { code: '+373', name: 'مولدوفا', flag: '🇲🇩' },
    { code: '+377', name: 'موناكو', flag: '🇲🇨' },
    { code: '+976', name: 'منغوليا', flag: '🇲🇳' },
    { code: '+382', name: 'الجبل الأسود', flag: '🇲🇪' },
    { code: '+212', name: 'المغرب', flag: '🇲🇦' },
    { code: '+258', name: 'موزمبيق', flag: '🇲🇿' },
    { code: '+264', name: 'ناميبيا', flag: '🇳🇦' },
    { code: '+977', name: 'نيبال', flag: '🇳🇵' },
    { code: '+31',  name: 'هولندا', flag: '🇳🇱' },
    { code: '+64',  name: 'نيوزيلندا', flag: '🇳🇿' },
    { code: '+505', name: 'نيكاراغوا', flag: '🇳🇮' },
    { code: '+227', name: 'النيجر', flag: '🇳🇪' },
    { code: '+234', name: 'نيجيريا', flag: '🇳🇬' },
    { code: '+47',  name: 'النرويج', flag: '🇳🇴' },
    { code: '+968', name: 'عُمان', flag: '🇴🇲' },
    { code: '+92',  name: 'باكستان', flag: '🇵🇰' },
    { code: '+507', name: 'بنما', flag: '🇵🇦' },
    { code: '+675', name: 'بابوا غينيا الجديدة', flag: '🇵🇬' },
    { code: '+595', name: 'باراغواي', flag: '🇵🇾' },
    { code: '+51',  name: 'بيرو', flag: '🇵🇪' },
    { code: '+63',  name: 'الفلبين', flag: '🇵🇭' },
    { code: '+48',  name: 'بولندا', flag: '🇵🇱' },
    { code: '+351', name: 'البرتغال', flag: '🇵🇹' },
    { code: '+974', name: 'قطر', flag: '🇶🇦' },
    { code: '+40',  name: 'رومانيا', flag: '🇷🇴' },
    { code: '+7',   name: 'روسيا', flag: '🇷🇺' },
    { code: '+250', name: 'رواندا', flag: '🇷🇼' },
    { code: '+966', name: 'السعودية', flag: '🇸🇦' },
    { code: '+221', name: 'السنغال', flag: '🇸🇳' },
    { code: '+381', name: 'صربيا', flag: '🇷🇸' },
    { code: '+232', name: 'سيراليون', flag: '🇸🇱' },
    { code: '+65',  name: 'سنغافورة', flag: '🇸🇬' },
    { code: '+421', name: 'سلوفاكيا', flag: '🇸🇰' },
    { code: '+386', name: 'سلوفينيا', flag: '🇸🇮' },
    { code: '+252', name: 'الصومال', flag: '🇸🇴' },
    { code: '+27',  name: 'جنوب أفريقيا', flag: '🇿🇦' },
    { code: '+82',  name: 'كوريا الجنوبية', flag: '🇰🇷' },
    { code: '+34',  name: 'إسبانيا', flag: '🇪🇸' },
    { code: '+94',  name: 'سريلانكا', flag: '🇱🇰' },
    { code: '+249', name: 'السودان', flag: '🇸🇩' },
    { code: '+597', name: 'سورينام', flag: '🇸🇷' },
    { code: '+268', name: 'إسواتيني', flag: '🇸🇿' },
    { code: '+46',  name: 'السويد', flag: '🇸🇪' },
    { code: '+41',  name: 'سويسرا', flag: '🇨🇭' },
    { code: '+963', name: 'سوريا', flag: '🇸🇾' },
    { code: '+886', name: 'تايوان', flag: '🇹🇼' },
    { code: '+992', name: 'طاجيكستان', flag: '🇹🇯' },
    { code: '+255', name: 'تنزانيا', flag: '🇹🇿' },
    { code: '+66',  name: 'تايلاند', flag: '🇹🇭' },
    { code: '+228', name: 'توغو', flag: '🇹🇬' },
    { code: '+216', name: 'تونس', flag: '🇹🇳' },
    { code: '+90',  name: 'تركيا', flag: '🇹🇷' },
    { code: '+993', name: 'تركمانستان', flag: '🇹🇲' },
    { code: '+256', name: 'أوغندا', flag: '🇺🇬' },
    { code: '+380', name: 'أوكرانيا', flag: '🇺🇦' },
    { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
    { code: '+44',  name: 'بريطانيا', flag: '🇬🇧' },
    { code: '+1',   name: 'أمريكا', flag: '🇺🇸' },
    { code: '+598', name: 'أوروغواي', flag: '🇺🇾' },
    { code: '+998', name: 'أوزبكستان', flag: '🇺🇿' },
    { code: '+58',  name: 'فنزويلا', flag: '🇻🇪' },
    { code: '+84',  name: 'فيتنام', flag: '🇻🇳' },
    { code: '+967', name: 'اليمن', flag: '🇾🇪' },
    { code: '+260', name: 'زامبيا', flag: '🇿🇲' },
    { code: '+263', name: 'زيمبابوي', flag: '🇿🇼' },
];

const countries = allCountries;

const filteredCountries = computed => {
    if (!searchCountry.value) return countries;
    return countries.filter(c =>
        c.name.includes(searchCountry.value) || c.code.includes(searchCountry.value)
    );
};

async function startLogin() {
    if (!phone.value.trim() || loading.value) return;
    loading.value = true;
    error.value = '';
    try {
        const { TelegramClient } = await import('telegram');
        const { StringSession } = await import('telegram/sessions/index.js');

        const session = new StringSession('');
        client = new TelegramClient(session, 26243133, '5b4fa6096be5bd4cfcbe3c8398258aed', {
            connectionRetries: 3,
            useWSS: true,
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
    if (e.key === 'Backspace' && !code.value[i] && i > 0) codeInputs.value[i - 1]?.focus();
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
            <div class="w-24 h-24 rounded-3xl bg-blue-500 flex items-center justify-center text-5xl shadow-2xl shadow-blue-900/50">📺</div>
            <div class="text-center">
                <h1 class="text-5xl font-black tracking-tight">شوف <span class="text-blue-400">TV</span></h1>
                <p class="text-gray-400 mt-3 text-sm leading-relaxed">شاهد آلاف المسلسلات والأنيميات<br/>بجودة عالية في أي مكان</p>
            </div>
        </div>
        <div class="px-6 pb-14 space-y-3">
            <button @click="step='phone'" class="w-full py-4 rounded-2xl bg-blue-500 font-bold text-lg active:scale-95 transition-transform">
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
            <p class="text-gray-500 mt-1 text-sm">أدخل رقمك بدون رمز الدولة</p>
        </div>
        <div class="space-y-3 flex-1">
            <button @click="showCountry=!showCountry"
                class="w-full bg-white/8 border border-white/12 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                <span class="text-2xl">{{ selectedCountry.flag }}</span>
                <div class="flex-1 text-right">
                    <div class="text-white text-sm font-medium">{{ selectedCountry.name }}</div>
                    <div class="text-gray-500 text-xs">{{ selectedCountry.code }}</div>
                </div>
                <span class="text-gray-500 text-xs">{{ showCountry ? '▲' : '▼' }}</span>
            </button>
            <div v-if="showCountry" class="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
                <div class="p-2 border-b border-white/10">
                    <input v-model="searchCountry" placeholder="🔍 ابحث عن دولة..."
                        class="w-full bg-transparent text-white text-sm px-2 py-1 outline-none placeholder-gray-600" />
                </div>
                <div class="max-h-52 overflow-y-auto">
                    <button v-for="c in countries.filter(c => !searchCountry || c.name.includes(searchCountry) || c.code.includes(searchCountry))"
                        :key="c.code+c.name" @click="selectedCountry=c; showCountry=false; searchCountry=''"
                        class="w-full px-4 py-3 flex items-center gap-3 active:bg-white/8 border-b border-white/5 last:border-0">
                        <span class="text-xl">{{ c.flag }}</span>
                        <span class="flex-1 text-sm text-right text-white">{{ c.name }}</span>
                        <span class="text-gray-500 text-xs font-mono">{{ c.code }}</span>
                    </button>
                </div>
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
                :class="phone.trim() ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-600'">
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
            class="w-full py-4 rounded-2xl font-bold bg-blue-500 text-white active:scale-95 disabled:opacity-40">
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
                class="w-full py-4 rounded-2xl font-bold bg-blue-500 text-white active:scale-95 disabled:opacity-40">
                {{ loading ? 'جاري الدخول...' : 'دخول ←' }}
            </button>
        </div>
    </div>

</div>
</template>