/**
 * AlertHub - Core Application Javascript
 * Handles state, views, events, calendar math, and AI insights.
 */

// ==========================================================================
// 1. Data Structure Definitions & Categories
// ==========================================================================

const MODULE_CATEGORIES = {
    business: [
        { value: "gst", label: "GST" },
        { value: "vendor_payment", label: "Vendor Payments" },
        { value: "customer_invoice", label: "Customer Invoice Follow-up" },
        { value: "employee_salary", label: "Employee Salary" },
        { value: "office_rent", label: "Office Rent" },
        { value: "professional_tax", label: "Professional Tax" },
        { value: "tds", label: "TDS" },
        { value: "license_renewal", label: "License Renewal" },
        { value: "amc_renewal", label: "AMC Renewal" }
    ],
    family: [
        { value: "electricity", label: "Electricity Bill" },
        { value: "water", label: "Water Bill" },
        { value: "gas", label: "Gas Booking" },
        { value: "mobile", label: "Mobile Recharge" },
        { value: "broadband", label: "Broadband" },
        { value: "ott", label: "OTT Subscription" },
        { value: "school_fees", label: "School Fees" },
        { value: "property_tax", label: "Property Tax" },
        { value: "passport", label: "Passport Renewal" },
        { value: "vehicle_service", label: "Vehicle Service" }
    ],
    finance: [
        { value: "credit_card", label: "Credit Card" },
        { value: "emi", label: "EMI" },
        { value: "home_loan", label: "Home Loan" },
        { value: "personal_loan", label: "Personal Loan" },
        { value: "lic", label: "LIC Premium" },
        { value: "health_insurance", label: "Health Insurance" },
        { value: "car_insurance", label: "Car Insurance" },
        { value: "sip", label: "SIP" },
        { value: "fixed_deposit", label: "Fixed Deposit" },
        { value: "income_tax", label: "Income Tax" }
    ]
};

// Map values to displayable text
const CATEGORY_LABEL_MAP = {};
Object.keys(MODULE_CATEGORIES).forEach(moduleKey => {
    MODULE_CATEGORIES[moduleKey].forEach(cat => {
        CATEGORY_LABEL_MAP[cat.value] = cat.label;
    });
});

const COUNTRY_CURRENCY_MAP = {
    "Afghanistan": { symbol: "؋", code: "AFN", locale: "ps-AF" },
    "Albania": { symbol: "Lek", code: "ALL", locale: "sq-AL" },
    "Algeria": { symbol: "DA", code: "DZD", locale: "ar-DZ" },
    "Andorra": { symbol: "€", code: "EUR", locale: "ca-AD" },
    "Angola": { symbol: "Kz", code: "AOA", locale: "pt-AO" },
    "Argentina": { symbol: "$", code: "ARS", locale: "es-AR" },
    "Armenia": { symbol: "֏", code: "AMD", locale: "hy-AM" },
    "Australia": { symbol: "A$", code: "AUD", locale: "en-AU" },
    "Austria": { symbol: "€", code: "EUR", locale: "de-AT" },
    "Azerbaijan": { symbol: "₼", code: "AZN", locale: "az-AZ" },
    "Bahamas": { symbol: "B$", code: "BSD", locale: "en-BS" },
    "Bahrain": { symbol: "BD", code: "BHD", locale: "ar-BH" },
    "Bangladesh": { symbol: "৳", code: "BDT", locale: "bn-BD" },
    "Barbados": { symbol: "Bds$", code: "BBD", locale: "en-BB" },
    "Belarus": { symbol: "Br", code: "BYN", locale: "be-BY" },
    "Belgium": { symbol: "€", code: "EUR", locale: "nl-BE" },
    "Belize": { symbol: "BZ$", code: "BZD", locale: "en-BZ" },
    "Benin": { symbol: "CFA", code: "XOF", locale: "fr-BJ" },
    "Bermuda": { symbol: "$", code: "BMD", locale: "en-BM" },
    "Bhutan": { symbol: "Nu.", code: "BTN", locale: "dz-BT" },
    "Bolivia": { symbol: "Bs.", code: "BOB", locale: "es-BO" },
    "Bosnia and Herzegovina": { symbol: "KM", code: "BAM", locale: "bs-BA" },
    "Botswana": { symbol: "P", code: "BWP", locale: "en-BW" },
    "Brazil": { symbol: "R$", code: "BRL", locale: "pt-BR" },
    "Brunei": { symbol: "B$", code: "BND", locale: "ms-BN" },
    "Bulgaria": { symbol: "лв", code: "BGN", locale: "bg-BG" },
    "Cambodia": { symbol: "៛", code: "KHR", locale: "km-KH" },
    "Cameroon": { symbol: "FCFA", code: "XAF", locale: "fr-CM" },
    "Canada": { symbol: "C$", code: "CAD", locale: "en-CA" },
    "Chile": { symbol: "$", code: "CLP", locale: "es-CL" },
    "China": { symbol: "¥", code: "CNY", locale: "zh-CN" },
    "Colombia": { symbol: "$", code: "COP", locale: "es-CO" },
    "Costa Rica": { symbol: "₡", code: "CRC", locale: "es-CR" },
    "Croatia": { symbol: "€", code: "EUR", locale: "hr-HR" },
    "Cuba": { symbol: "$", code: "CUP", locale: "es-CU" },
    "Cyprus": { symbol: "€", code: "EUR", locale: "el-CY" },
    "Czech Republic": { symbol: "Kč", code: "CZK", locale: "cs-CZ" },
    "Denmark": { symbol: "kr.", code: "DKK", locale: "da-DK" },
    "Dominican Republic": { symbol: "RD$", code: "DOP", locale: "es-DO" },
    "Ecuador": { symbol: "$", code: "USD", locale: "es-EC" },
    "Egypt": { symbol: "E£", code: "EGP", locale: "ar-EG" },
    "El Salvador": { symbol: "$", code: "USD", locale: "es-SV" },
    "Estonia": { symbol: "€", code: "EUR", locale: "et-EE" },
    "Ethiopia": { symbol: "Br", code: "ETB", locale: "am-ET" },
    "Europe": { symbol: "€", code: "EUR", locale: "de-DE" },
    "Fiji": { symbol: "FJ$", code: "FJD", locale: "en-FJ" },
    "Finland": { symbol: "€", code: "EUR", locale: "fi-FI" },
    "France": { symbol: "€", code: "EUR", locale: "fr-FR" },
    "Georgia": { symbol: "₾", code: "GEL", locale: "ka-GE" },
    "Germany": { symbol: "€", code: "EUR", locale: "de-DE" },
    "Ghana": { symbol: "GH₵", code: "GHS", locale: "ak-GH" },
    "Greece": { symbol: "€", code: "EUR", locale: "el-GR" },
    "Guatemala": { symbol: "Q", code: "GTQ", locale: "es-GT" },
    "Honduras": { symbol: "L", code: "HNL", locale: "es-HN" },
    "Hong Kong": { symbol: "HK$", code: "HKD", locale: "zh-HK" },
    "Hungary": { symbol: "Ft", code: "HUF", locale: "hu-HU" },
    "Iceland": { symbol: "kr", code: "ISK", locale: "is-IS" },
    "India": { symbol: "₹", code: "INR", locale: "en-IN" },
    "Indonesia": { symbol: "Rp", code: "IDR", locale: "id-ID" },
    "Iran": { symbol: "﷼", code: "IRR", locale: "fa-IR" },
    "Iraq": { symbol: "ID", code: "IQD", locale: "ar-IQ" },
    "Ireland": { symbol: "€", code: "EUR", locale: "en-IE" },
    "Israel": { symbol: "₪", code: "ILS", locale: "he-IL" },
    "Italy": { symbol: "€", code: "EUR", locale: "it-IT" },
    "Jamaica": { symbol: "J$", code: "JMD", locale: "en-JM" },
    "Japan": { symbol: "¥", code: "JPY", locale: "ja-JP" },
    "Jordan": { symbol: "JD", code: "JOD", locale: "ar-JO" },
    "Kazakhstan": { symbol: "₸", code: "KZT", locale: "kk-KZ" },
    "Kenya": { symbol: "KSh", code: "KES", locale: "sw-KE" },
    "Kuwait": { symbol: "KD", code: "KWD", locale: "ar-KW" },
    "Lebanon": { symbol: "L£", code: "LBP", locale: "ar-LB" },
    "Libya": { symbol: "LD", code: "LYD", locale: "ar-LY" },
    "Luxembourg": { symbol: "€", code: "EUR", locale: "lb-LU" },
    "Macau": { symbol: "MOP$", code: "MOP", locale: "zh-MO" },
    "Madagascar": { symbol: "Ar", code: "MGA", locale: "mg-MG" },
    "Malaysia": { symbol: "RM", code: "MYR", locale: "ms-MY" },
    "Maldives": { symbol: "Rf", code: "MVR", locale: "dv-MV" },
    "Malta": { symbol: "€", code: "EUR", locale: "mt-MT" },
    "Mauritius": { symbol: "₨", code: "MUR", locale: "en-MU" },
    "Mexico": { symbol: "Mex$", code: "MXN", locale: "es-MX" },
    "Monaco": { symbol: "€", code: "EUR", locale: "fr-MC" },
    "Mongolia": { symbol: "₮", code: "MNT", locale: "mn-MN" },
    "Montenegro": { symbol: "€", code: "EUR", locale: "cnr-ME" },
    "Morocco": { symbol: "DH", code: "MAD", locale: "ar-MA" },
    "Myanmar": { symbol: "K", code: "MMK", locale: "my-MM" },
    "Nepal": { symbol: "₨", code: "NPR", locale: "ne-NP" },
    "Netherlands": { symbol: "€", code: "EUR", locale: "nl-NL" },
    "New Zealand": { symbol: "NZ$", code: "NZD", locale: "en-NZ" },
    "Nicaragua": { symbol: "C$", code: "NIO", locale: "es-NI" },
    "Nigeria": { symbol: "₦", code: "NGN", locale: "en-NG" },
    "Norway": { symbol: "kr", code: "NOK", locale: "no-NO" },
    "Oman": { symbol: "RO", code: "OMR", locale: "ar-OM" },
    "Pakistan": { symbol: "₨", code: "PKR", locale: "ur-PK" },
    "Panama": { symbol: "B/.", code: "PAB", locale: "es-PA" },
    "Paraguay": { symbol: "₲", code: "PYG", locale: "es-PY" },
    "Peru": { symbol: "S/.", code: "PEN", locale: "es-PE" },
    "Philippines": { symbol: "₱", code: "PHP", locale: "fil-PH" },
    "Poland": { symbol: "zł", code: "PLN", locale: "pl-PL" },
    "Portugal": { symbol: "€", code: "EUR", locale: "pt-PT" },
    "Qatar": { symbol: "QR", code: "QAR", locale: "ar-QA" },
    "Romania": { symbol: "L", code: "RON", locale: "ro-RO" },
    "Russia": { symbol: "₽", code: "RUB", locale: "ru-RU" },
    "Saudi Arabia": { symbol: "SR", code: "SAR", locale: "ar-SA" },
    "Serbia": { symbol: "din.", code: "RSD", locale: "sr-RS" },
    "Singapore": { symbol: "S$", code: "SGD", locale: "en-SG" },
    "Slovakia": { symbol: "€", code: "EUR", locale: "sk-SK" },
    "Slovenia": { symbol: "€", code: "EUR", locale: "sl-SI" },
    "South Africa": { symbol: "R", code: "ZAR", locale: "en-ZA" },
    "South Korea": { symbol: "₩", code: "KRW", locale: "ko-KR" },
    "Spain": { symbol: "€", code: "EUR", locale: "es-ES" },
    "Sri Lanka": { symbol: "₨", code: "LKR", locale: "si-LK" },
    "Sweden": { symbol: "kr", code: "SEK", locale: "sv-SE" },
    "Switzerland": { symbol: "CHF", code: "CHF", locale: "de-CH" },
    "Taiwan": { symbol: "NT$", code: "TWD", locale: "zh-TW" },
    "Thailand": { symbol: "฿", code: "THB", locale: "th-TH" },
    "Tunisia": { symbol: "DT", code: "TND", locale: "ar-TN" },
    "Turkey": { symbol: "₺", code: "TRY", locale: "tr-TR" },
    "Ukraine": { symbol: "₴", code: "UAH", locale: "uk-UA" },
    "United Arab Emirates": { symbol: "AED", code: "AED", locale: "ar-AE" },
    "United Kingdom": { symbol: "£", code: "GBP", locale: "en-GB" },
    "United States": { symbol: "$", code: "USD", locale: "en-US" },
    "Uruguay": { symbol: "$U", code: "UYU", locale: "es-UY" },
    "Uzbekistan": { symbol: "so'm", code: "UZS", locale: "uz-UZ" },
    "Venezuela": { symbol: "Bs.S", code: "VES", locale: "es-VE" },
    "Vietnam": { symbol: "₫", code: "VND", locale: "vi-VN" },
    "Yemen": { symbol: "﷼", code: "YER", locale: "ar-YE" },
    "Zambia": { symbol: "ZK", code: "ZMW", locale: "en-ZM" },
    "Zimbabwe": { symbol: "Z$", code: "ZWL", locale: "en-ZW" }
};

function getActiveCurrency() {
    const defaultCurrency = { symbol: "₹", code: "INR", locale: "en-IN" };
    if (!state.user || !state.user.country) {
        return defaultCurrency;
    }
    return COUNTRY_CURRENCY_MAP[state.user.country] || defaultCurrency;
}

function updateCurrencyLabels() {
    const symbol = getActiveCurrency().symbol;
    const amountLabel = document.getElementById("form-amount-label");
    if (amountLabel) {
        amountLabel.textContent = `Amount (${symbol}) *`;
    }
    const simLabel = document.getElementById("sim-weekly-cash-label");
    if (simLabel) {
        simLabel.textContent = `Simulate Weekly Account Balance (${symbol})`;
    }
    
    // Set the dropdown in header to active country
    const headerCountrySelect = document.getElementById("header-country-select");
    if (headerCountrySelect) {
        headerCountrySelect.value = state.user && state.user.country ? state.user.country : "India";
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Format currency
function formatINR(amount) {
    const currencyInfo = getActiveCurrency();
    const formattedNumber = new Intl.NumberFormat(currencyInfo.locale, {
        maximumFractionDigits: 0
    }).format(amount);
    
    const suffixCountries = ["Europe", "Germany", "France", "Spain", "Italy", "Portugal", "Sweden", "Norway", "Denmark", "Vietnam", "Uzbekistan"];
    const country = state.user && state.user.country ? state.user.country : "India";
    
    if (suffixCountries.includes(country)) {
        return `${formattedNumber} ${currencyInfo.symbol}`;
    } else {
        return `${currencyInfo.symbol}${formattedNumber}`;
    }
}

// Helper: Format Date
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ==========================================================================
// 2. Application State & Storage
// ==========================================================================

const LOCAL_STORAGE_KEY = "alerthub_state_db";

let state = {
    plan: "free", // "free" | "personal" | "family" | "business"
    simAccountBalance: 75000,
    reminders: [],
    currentView: "dashboard",
    user: null, // { name: "Dr. Balaji", email: "dr.balaji@alerthub.com" }
    registeredUsers: [
        { name: "Dr. Balaji", email: "dr.balaji@alerthub.com", password: "password123", country: "India" } // Pre-loaded default account
    ]
};

// Initial Sample Data (based on prompt requirements)
function getInitialReminders() {
    const todayStr = getOffsetDateStr(0);
    const tomorrowStr = getOffsetDateStr(1);
    const twoDaysLaterStr = getOffsetDateStr(2);
    
    return [
        {
            id: "rem-1",
            title: "HDFC Credit Card Bill",
            module: "finance",
            category: "credit_card",
            amount: 15300,
            dueDate: todayStr,
            recurrence: "monthly",
            schedule: [0, 1, 3, 7], // Days in advance
            channels: ["push"],
            completed: false
        },
        {
            id: "rem-2",
            title: "GST Q1 Filing Due",
            module: "business",
            category: "gst",
            amount: 28400,
            dueDate: tomorrowStr,
            recurrence: "yearly",
            schedule: [0, 1, 7, 15, 30],
            channels: ["push", "email"],
            completed: false
        },
        {
            id: "rem-3",
            title: "Netflix Premium Renewal",
            module: "family",
            category: "ott",
            amount: 649,
            dueDate: twoDaysLaterStr,
            recurrence: "monthly",
            schedule: [0, 1, 3],
            channels: ["push"],
            completed: false
        },
        {
            id: "rem-4",
            title: "LIC Jeevan Anand Policy",
            module: "finance",
            category: "lic",
            amount: 8500,
            dueDate: tomorrowStr,
            recurrence: "yearly",
            schedule: [0, 1, 7, 15, 30],
            channels: ["push", "email"],
            completed: false
        },
        {
            id: "rem-5",
            title: "Car loan HDFC EMI",
            module: "finance",
            category: "emi",
            amount: 12500,
            dueDate: getOffsetDateStr(6),
            recurrence: "monthly",
            schedule: [0, 1, 3, 7],
            channels: ["push"],
            completed: true
        },
        {
            id: "rem-6",
            title: "BESCOM Electricity Bill",
            module: "family",
            category: "electricity",
            amount: 3200,
            dueDate: getOffsetDateStr(8),
            recurrence: "monthly",
            schedule: [0, 1, 3, 7],
            channels: ["push"],
            completed: true
        },
        {
            id: "rem-7",
            title: "Vendor Invoice: Acma Corp",
            module: "business",
            category: "vendor_payment",
            amount: 45000,
            dueDate: getOffsetDateStr(14),
            recurrence: "none",
            schedule: [0, 1, 7, 15],
            channels: ["push"],
            completed: true
        },
        {
            id: "rem-8",
            title: "Quarterly School Fees",
            module: "family",
            category: "school_fees",
            amount: 35000,
            dueDate: getOffsetDateStr(20),
            recurrence: "monthly",
            schedule: [0, 1, 7, 15, 30],
            channels: ["push"],
            completed: true
        }
    ];
}

// Date offset helper
function getOffsetDateStr(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

function loadState() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        try {
            state = JSON.parse(stored);
            // Ensure registeredUsers exists
            if (!state.registeredUsers) {
                state.registeredUsers = [
                    { name: "Dr. Balaji", email: "dr.balaji@alerthub.com", password: "password123", country: "India" }
                ];
            }
        } catch (e) {
            console.error("Failed to parse local storage state, using defaults.", e);
            state.reminders = getInitialReminders();
        }
    } else {
        state.reminders = getInitialReminders();
        state.plan = "free";
        state.simAccountBalance = 75000;
        state.user = null;
        state.registeredUsers = [
            { name: "Dr. Balaji", email: "dr.balaji@alerthub.com", password: "password123", country: "India" }
        ];
        saveState();
    }
}

function saveState() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

// ==========================================================================
// 3. View Management (Routing)
// ==========================================================================

function initNavigation() {
    const navItems = document.querySelectorAll(".nav-menu .nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = item.getAttribute("data-view");
            switchView(targetView);
            
            // Highlight active side menu
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            
            // Close mobile sidebar on menu click
            const sidebar = document.querySelector(".sidebar");
            if (sidebar.classList.contains("open")) {
                sidebar.classList.remove("open");
            }
        });
    });

    // Mobile Sidebar toggle
    const toggleBtn = document.getElementById("sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // Inside-dashboard AI Teaser redirect button
    const jumpBtn = document.getElementById("jump-to-insights-btn");
    if (jumpBtn) {
        jumpBtn.addEventListener("click", () => {
            switchView("insights");
            const navInsight = document.querySelector('[data-view="insights"]');
            if (navInsight) {
                navItems.forEach(n => n.classList.remove("active"));
                navInsight.classList.add("active");
            }
        });
    }
}

function switchView(viewName) {
    state.currentView = viewName;
    
    // Hide all view sections
    const views = document.querySelectorAll(".app-view");
    views.forEach(v => v.classList.remove("active"));
    
    // Show selected view
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
        target.classList.add("active");
    }

    // Update Header Text
    const title = document.getElementById("view-title");
    const subtitle = document.getElementById("view-subtitle");
    
    switch (viewName) {
        case "dashboard":
            title.textContent = "Dashboard";
            subtitle.textContent = "Welcome back, Dr. Balaji. Here is your overview.";
            renderDashboard();
            break;
        case "reminders":
            title.textContent = "All Reminders";
            subtitle.textContent = "Create, edit, search, and track schedules.";
            renderRemindersTable();
            break;
        case "calendar":
            title.textContent = "Calendar View";
            subtitle.textContent = "Visual monthly calendar mapping all payment deadlines.";
            renderCalendar();
            break;
        case "insights":
            title.textContent = "AI Smart Insights";
            subtitle.textContent = "Liquidity forecasts, due-date overlaps, and cash flow analysis.";
            renderAIInsightsPage();
            break;
        case "pricing":
            title.textContent = "Plans & Pricing";
            subtitle.textContent = "Upgrade your alert levels, unlock premium channels, and sync with family.";
            renderPricingPage();
            break;
    }
}

// ==========================================================================
// 4. Toast Notification Simulator
// ==========================================================================

function showToast(title, desc, type = "info") {
    const container = document.getElementById("global-toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconSvg = "";
    switch (type) {
        case "danger":
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="toast-icon red"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
            break;
        case "warning":
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="toast-icon orange"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            break;
        case "success":
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="toast-icon green"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            break;
        case "info":
        default:
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="toast-icon blue"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            break;
    }
    
    toast.innerHTML = `
        ${iconSvg}
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Wire up close button
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn.addEventListener("click", () => {
        toast.remove();
    });
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = "slideIn 0.3s ease-out reverse forwards";
            setTimeout(() => toast.remove(), 300);
        }
    }, 6000);
}

// Trigger startup sample alerts to welcome user
function triggerWelcomeAlerts() {
    const symbol = getActiveCurrency().symbol;
    setTimeout(() => {
        showToast("🔴 Card Bill Due Today!", `Your HDFC Credit Card bill (${symbol}15,300) is due today. Ensure sufficient bank balance.`, "danger");
    }, 1000);
    
    setTimeout(() => {
        showToast("🟠 GST Filing Reminder", `Your quarterly GST filing (${symbol}28,400) is due tomorrow. Complete vendor tallies.`, "warning");
    }, 3500);
}

// ==========================================================================
// 5. Dashboard Implementation
// ==========================================================================

let activeDashboardFilter = "all";

function initDashboardEvents() {
    const filters = document.querySelectorAll(".module-filters .filter-tab");
    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            filters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeDashboardFilter = btn.getAttribute("data-module");
            renderDashboard();
        });
    });
}

function getDaysDifference(dueDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function renderDashboard() {
    // 1. Calculate KPI Metrics
    let totalOutflow = 0;
    let dueTodayCount = 0;
    let upcomingCount = 0;
    
    const todayDateStr = getOffsetDateStr(0);
    
    state.reminders.forEach(rem => {
        // Only count unpaid reminders towards outflows
        if (!rem.completed) {
            totalOutflow += Number(rem.amount);
        }
        
        const daysLeft = getDaysDifference(rem.dueDate);
        if (daysLeft === 0) {
            dueTodayCount++;
        } else if (daysLeft > 0 && daysLeft <= 7) {
            upcomingCount++;
        }
    });
    
    document.getElementById("stat-total-outflow").textContent = formatINR(totalOutflow);
    document.getElementById("stat-due-today").textContent = dueTodayCount;
    document.getElementById("stat-upcoming").textContent = upcomingCount;
    
    const todayBadge = document.getElementById("today-alerts-count");
    todayBadge.textContent = `${dueTodayCount} due today`;
    if (dueTodayCount > 0) {
        todayBadge.className = "reminder-days-left due-danger";
    } else {
        todayBadge.className = "reminder-days-left";
        todayBadge.style.color = "var(--text-muted)";
    }
    
    // 2. Filter Reminders List
    let filteredReminders = state.reminders;
    if (activeDashboardFilter !== "all") {
        filteredReminders = state.reminders.filter(r => r.module === activeDashboardFilter);
    }
    
    // Sort reminders: due soonest first, then alphabetical
    filteredReminders.sort((a, b) => {
        const diffA = getDaysDifference(a.dueDate);
        const diffB = getDaysDifference(b.dueDate);
        if (diffA !== diffB) return diffA - diffB;
        return a.title.localeCompare(b.title);
    });
    
    // Group into Today vs. Upcoming
    const todayList = document.getElementById("today-alerts-list");
    const upcomingList = document.getElementById("upcoming-alerts-list");
    
    todayList.innerHTML = "";
    upcomingList.innerHTML = "";
    
    const todayItems = filteredReminders.filter(r => getDaysDifference(r.dueDate) === 0);
    const upcomingItems = filteredReminders.filter(r => getDaysDifference(r.dueDate) > 0);
    
    if (todayItems.length === 0) {
        todayList.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p>No reminders due today. You are all caught up!</p>
            </div>
        `;
    } else {
        todayItems.forEach(rem => {
            todayList.appendChild(createReminderCard(rem));
        });
    }
    
    if (upcomingItems.length === 0) {
        upcomingList.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <p>No upcoming reminders scheduled.</p>
            </div>
        `;
    } else {
        upcomingItems.forEach(rem => {
            upcomingList.appendChild(createReminderCard(rem));
        });
    }
    
    // 3. Render Dashboard Notification Channel Settings
    renderChannelsPanel();
    
    // 4. Update the mini AI insights teaser
    updateMiniAITeaser();
}

function createReminderCard(rem) {
    const card = document.createElement("div");
    card.className = "reminder-card";
    
    const daysLeft = getDaysDifference(rem.dueDate);
    let dayText = "";
    let dayClass = "";
    
    if (daysLeft === 0) {
        dayText = "🔴 Due Today";
        dayClass = "due-danger";
    } else if (daysLeft === 1) {
        dayText = "🟠 Due Tomorrow";
        dayClass = "due-warn";
    } else if (daysLeft < 0) {
        dayText = `🔴 Overdue by ${Math.abs(daysLeft)} days`;
        dayClass = "due-danger";
    } else {
        dayText = `🟢 In ${daysLeft} days`;
        dayClass = "";
    }
    
    let categoryLabel = CATEGORY_LABEL_MAP[rem.category] || rem.category;
    
    // Build channels string
    const channelsString = rem.channels.map(c => {
        if (c === "push") return "Push";
        if (c === "email") return "Email";
        if (c === "whatsapp") return "WA";
        if (c === "sms") return "SMS";
        return c;
    }).join(", ");
    
    card.innerHTML = `
        <div class="reminder-main">
            <span class="status-dot ${daysLeft === 0 ? 'red' : (daysLeft === 1 ? 'orange' : (daysLeft > 1 ? 'green' : 'red'))}"></span>
            <div class="reminder-meta">
                <h4>${rem.title}</h4>
                <div class="reminder-details">
                    <span class="tag-module ${rem.module}">${rem.module}</span>
                    <span>•</span>
                    <span>${categoryLabel}</span>
                    <span>•</span>
                    <span style="font-weight: 500;">Ch: ${channelsString}</span>
                </div>
            </div>
        </div>
        <div class="reminder-financial">
            <div class="reminder-amount">${formatINR(rem.amount)}</div>
            <div class="reminder-days-left ${dayClass}">${dayText}</div>
        </div>
        <div class="reminder-actions">
            <!-- Test Notification Sim -->
            <button class="action-btn sim-trigger" title="Simulate Alert Trigger" aria-label="Simulate alert trigger">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            <button class="action-btn edit-trigger" title="Edit Reminder" aria-label="Edit reminder">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button class="action-btn delete-btn" title="Delete Reminder" aria-label="Delete reminder">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    `;
    
    // Bind actions
    card.querySelector(".sim-trigger").addEventListener("click", () => {
        let type = "info";
        if (daysLeft === 0) type = "danger";
        else if (daysLeft === 1) type = "warning";
        
        showToast(
            `${rem.title} Alert!`,
            `This is a mock alert for ${rem.title}. Amount: ${formatINR(rem.amount)}. Due date: ${formatDate(rem.dueDate)} (${dayText.replace('🔴 ', '').replace('🟠 ', '').replace('🟢 ', '')}). Sent via Push Notification.`,
            type
        );
    });
    
    card.querySelector(".edit-trigger").addEventListener("click", () => {
        openReminderModal(rem);
    });
    
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete "${rem.title}"?`)) {
            deleteReminder(rem.id);
        }
    });
    
    return card;
}

function renderChannelsPanel() {
    const emailStatus = document.getElementById("email-channel-status");
    const waStatus = document.getElementById("whatsapp-channel-status");
    const smsStatus = document.getElementById("sms-channel-status");
    
    // Reset classes
    emailStatus.className = "channel-status";
    waStatus.className = "channel-status";
    smsStatus.className = "channel-status";
    
    if (state.plan === "free") {
        emailStatus.textContent = "Premium Only";
        emailStatus.style.backgroundColor = "var(--border-color)";
        emailStatus.style.color = "var(--text-secondary)";
        
        waStatus.textContent = "Premium Only";
        waStatus.style.backgroundColor = "var(--border-color)";
        waStatus.style.color = "var(--text-secondary)";
        
        smsStatus.textContent = "Premium Only";
        smsStatus.style.backgroundColor = "var(--border-color)";
        smsStatus.style.color = "var(--text-secondary)";
    } else if (state.plan === "personal") {
        emailStatus.textContent = "Unlocked";
        emailStatus.classList.add("active");
        
        waStatus.textContent = "Unlocked";
        waStatus.classList.add("active");
        
        smsStatus.textContent = "Premium Only";
        smsStatus.style.backgroundColor = "var(--border-color)";
        smsStatus.style.color = "var(--text-secondary)";
    } else {
        // Family or Business
        emailStatus.textContent = "Unlocked";
        emailStatus.classList.add("active");
        
        waStatus.textContent = "Unlocked";
        waStatus.classList.add("active");
        
        smsStatus.textContent = "Unlocked";
        smsStatus.classList.add("active");
    }
}

// ==========================================================================
// 6. AI Smart Insights Engine
// ==========================================================================

function updateMiniAITeaser() {
    const teaserBox = document.getElementById("ai-teaser-box");
    if (!teaserBox) return;
    
    const insights = generateAIInsights();
    if (insights.length > 0) {
        teaserBox.innerHTML = `<p>"${insights[0].summary}"</p>`;
    } else {
        teaserBox.innerHTML = `<p>"No critical cashflow alerts this week. Keep tracking your reminders!"</p>`;
    }
}

// core engine that generates text alerts by looking at schedule overlaps
function generateAIInsights() {
    const insights = [];
    const activeReminders = state.reminders.filter(r => !r.completed);
    
    // Sort active reminders by date
    activeReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // 1. Total Outflow checks
    let total7DayOutflow = 0;
    const items7Days = [];
    
    activeReminders.forEach(r => {
        const days = getDaysDifference(r.dueDate);
        if (days >= 0 && days <= 7) {
            total7DayOutflow += Number(r.amount);
            items7Days.push(r);
        }
    });
    
    // Insight 1: 7-Day Outflow sum
    if (items7Days.length > 1) {
        insights.push({
            type: "info",
            title: `Weekly Outflow Summary`,
            summary: `You have ${items7Days.length} payments due this week. Total expected outflow: ${formatINR(total7DayOutflow)}.`,
            description: `Items include: ${items7Days.map(i => i.title).join(", ")}. Ensure you have sufficient balance ready.`
        });
        
        // Liquidity Alert: Compare with simulated account balance
        if (total7DayOutflow > state.simAccountBalance) {
            insights.push({
                type: "danger",
                title: "Liquidity Alert: Low Cash Balance",
                summary: `Expected 7-day payments (${formatINR(total7DayOutflow)}) exceed your simulated bank balance of ${formatINR(state.simAccountBalance)}!`,
                description: `Consider delaying non-urgent outflows or transferring funds to prevent bounced EMIs or fees.`
            });
        }
    }
    
    // 2. Overlap Conflicts (e.g. Credit Card + EMI on same day)
    const dateGroups = {};
    activeReminders.forEach(r => {
        if (!dateGroups[r.dueDate]) {
            dateGroups[r.dueDate] = [];
        }
        dateGroups[r.dueDate].push(r);
    });
    
    Object.keys(dateGroups).forEach(dateStr => {
        const list = dateGroups[dateStr];
        if (list.length > 1) {
            const sum = list.reduce((acc, r) => acc + Number(r.amount), 0);
            insights.push({
                type: "warning",
                title: `Overlap Alert: ${formatDate(dateStr)}`,
                summary: `You have ${list.length} payments falling on the same day (${formatDate(dateStr)}). Combined total: ${formatINR(sum)}.`,
                description: `Reminders due: ${list.map(r => `"${r.title}" (${formatINR(r.amount)})`).join(" and ")}. Ensure your account balance covers the aggregate total to avoid late payment risks.`
            });
        }
    });
    
    // 3. Subscription Audit (OTT renewals etc)
    const ottReminders = activeReminders.filter(r => r.category === "ott");
    if (ottReminders.length > 2) {
        const sum = ottReminders.reduce((acc, r) => acc + Number(r.amount), 0);
        insights.push({
            type: "success",
            title: "Subscription Auditing",
            summary: `You are tracking ${ottReminders.length} active digital subscriptions costing ${formatINR(sum)}/cycle.`,
            description: `Verify that you are actively using ${ottReminders.map(r => r.title).join(", ")} to avoid paying for idle memberships.`
        });
    }
    
    // Default fallback if no warnings
    if (insights.length === 0) {
        insights.push({
            type: "success",
            title: "All Clear",
            summary: "No payment overlaps or high weekly outflow clusters detected.",
            description: "Your financial calendar looks balanced. Continue adding your Business, Family, and Finance category reminders to stay organized."
        });
    }
    
    return insights;
}

function renderAIInsightsPage() {
    const cashInput = document.getElementById("sim-weekly-cash");
    if (cashInput) {
        state.simAccountBalance = Number(cashInput.value) || 0;
    }
    
    // Re-calc outflow stat
    let total7DayOutflow = 0;
    state.reminders.forEach(r => {
        if (!r.completed) {
            const days = getDaysDifference(r.dueDate);
            if (days >= 0 && days <= 7) {
                total7DayOutflow += Number(r.amount);
            }
        }
    });
    
    document.getElementById("ai-est-outflow").textContent = formatINR(total7DayOutflow);
    
    const container = document.getElementById("insights-card-container");
    if (!container) return;
    
    container.innerHTML = "";
    const insights = generateAIInsights();
    
    insights.forEach(ins => {
        const item = document.createElement("div");
        item.className = `insight-item-card insight-${ins.type}`;
        
        let iconClass = "primary";
        let iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        
        if (ins.type === "danger") {
            iconClass = "danger";
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
        } else if (ins.type === "warning") {
            iconClass = "warning";
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
        } else if (ins.type === "success") {
            iconClass = "success";
            iconSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        }
        
        item.innerHTML = `
            <div class="insight-item-icon ${iconClass}">
                ${iconSvg}
            </div>
            <div class="insight-item-content">
                <h4>${ins.title}</h4>
                <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">${ins.summary}</p>
                <p>${ins.description}</p>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Render the Cash Flow Chart
    renderInsightsChart();
}

/**
 * Renders a premium, dynamic SVG-based Cash Flow & Outflow Chart.
 * Compares a 7-day timeline of daily outflows against cumulative account balance depletion.
 */
function renderInsightsChart() {
    const svg = document.getElementById("insights-flow-chart");
    if (!svg) return;
    
    // Clear previous SVG contents
    svg.innerHTML = "";
    
    // Prepare 7-day forecast data
    const daysCount = 7;
    const dates = [];
    const outflows = [];
    const balances = [];
    
    let currentProjBalance = state.simAccountBalance;
    
    for (let i = 0; i < daysCount; i++) {
        const dateStr = getOffsetDateStr(i);
        dates.push(dateStr);
        
        // Sum all unpaid reminders due on this date
        let dailyOutflow = 0;
        state.reminders.forEach(rem => {
            if (!rem.completed && rem.dueDate === dateStr) {
                dailyOutflow += Number(rem.amount);
            }
        });
        outflows.push(dailyOutflow);
        
        // Projected balance is depleted at the end of the day by daily outflows
        currentProjBalance -= dailyOutflow;
        balances.push(currentProjBalance);
    }
    
    // Chart dimensions and margins
    const margin = { top: 30, right: 40, bottom: 40, left: 75 };
    const width = 800;
    const height = 250;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Find limits for Y axis scaling
    const maxBalance = Math.max(state.simAccountBalance, ...balances);
    const maxOutflow = Math.max(...outflows);
    const minBalance = Math.min(...balances, 0); // Include 0 to capture deficit
    
    const maxYVal = Math.max(10000, maxBalance, maxOutflow * 1.25); // Set min upper limit of 10K
    const minYVal = Math.min(0, minBalance); // Allow Y axis to drop negative
    const valueRange = maxYVal - minYVal;
    
    // Scaling helpers
    function getX(index) {
        return margin.left + index * (chartWidth / (daysCount - 1));
    }
    
    function getY(value) {
        return margin.top + chartHeight - ((value - minYVal) / valueRange) * chartHeight;
    }
    
    // 1. Create defs for premium gradients
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <!-- Area Fill Gradients -->
        <linearGradient id="area-normal-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
        </linearGradient>
        
        <linearGradient id="area-danger-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--danger)" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="var(--danger)" stop-opacity="0.0"/>
        </linearGradient>
        
        <!-- Bar Fill Gradients -->
        <linearGradient id="bar-normal-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--info)" stop-opacity="1"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.75"/>
        </linearGradient>
        
        <linearGradient id="bar-danger-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--danger)" stop-opacity="1"/>
            <stop offset="100%" stop-color="#f87171" stop-opacity="0.75"/>
        </linearGradient>
    `;
    svg.appendChild(defs);
    
    // 2. Draw Y-axis grid lines and labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
        const tickValue = minYVal + (i * valueRange / yTicks);
        const yPos = getY(tickValue);
        
        // Grid line
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("x1", margin.left);
        gridLine.setAttribute("y1", yPos);
        gridLine.setAttribute("x2", width - margin.right);
        gridLine.setAttribute("y2", yPos);
        gridLine.setAttribute("class", "chart-grid-line");
        svg.appendChild(gridLine);
        
        // Label text
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", margin.left - 12);
        label.setAttribute("y", yPos + 4);
        label.setAttribute("class", "chart-label y-axis");
        
        // Formatter (Short numbers for labels e.g. ₹20K, ₹1.5L)
        let formatted = "";
        const absVal = Math.abs(tickValue);
        if (absVal >= 100000) {
            formatted = (tickValue / 100000).toFixed(1).replace(".0", "") + "L";
        } else if (absVal >= 1000) {
            formatted = (tickValue / 1000).toFixed(0) + "K";
        } else {
            formatted = Math.round(tickValue);
        }
        label.textContent = (tickValue < 0 ? "-" : "") + getActiveCurrency().symbol + formatted.replace("-", "");
        svg.appendChild(label);
    }
    
    // Draw Zero line (red dashed) if balance goes below 0
    if (minYVal < 0) {
        const zeroY = getY(0);
        const zeroLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        zeroLine.setAttribute("x1", margin.left);
        zeroLine.setAttribute("y1", zeroY);
        zeroLine.setAttribute("x2", width - margin.right);
        zeroLine.setAttribute("y2", zeroY);
        zeroLine.setAttribute("class", "chart-zero-line");
        svg.appendChild(zeroLine);
        
        const zeroLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        zeroLabel.setAttribute("x", width - margin.right);
        zeroLabel.setAttribute("y", zeroY - 6);
        zeroLabel.setAttribute("class", "chart-label");
        zeroLabel.setAttribute("style", "text-anchor: end; fill: var(--danger); font-weight: 700; font-size: 0.65rem;");
        zeroLabel.textContent = `Deficit Limit (${getActiveCurrency().symbol}0)`;
        svg.appendChild(zeroLabel);
    }
    
    // Draw Main Axis lines
    const bottomAxisY = getY(minYVal);
    const leftAxisX = margin.left;
    
    const axisX = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axisX.setAttribute("x1", leftAxisX);
    axisX.setAttribute("y1", bottomAxisY);
    axisX.setAttribute("x2", width - margin.right);
    axisX.setAttribute("y2", bottomAxisY);
    axisX.setAttribute("class", "chart-axis-line");
    svg.appendChild(axisX);
    
    const axisY = document.createElementNS("http://www.w3.org/2000/svg", "line");
    axisY.setAttribute("x1", leftAxisX);
    axisY.setAttribute("y1", margin.top);
    axisY.setAttribute("x2", leftAxisX);
    axisY.setAttribute("y2", bottomAxisY);
    axisY.setAttribute("class", "chart-axis-line");
    svg.appendChild(axisY);
    
    // 3. Draw Daily Outflow Bars
    const barWidth = 26;
    for (let i = 0; i < daysCount; i++) {
        const outflow = outflows[i];
        if (outflow === 0) continue;
        
        const xPos = getX(i) - barWidth / 2;
        const zeroY = getY(Math.max(0, minYVal));
        const barY = getY(outflow);
        const barHeight = Math.max(4, zeroY - barY); // Min height of 4px
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", xPos);
        rect.setAttribute("y", barY);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        
        // Deficit check (color bar red if projected balance on that day goes negative)
        const isDanger = balances[i] < 0;
        rect.setAttribute("class", isDanger ? "chart-bar danger" : "chart-bar");
        
        // Hook mouse interactive hover tooltips
        rect.addEventListener("mouseenter", (e) => showChartTooltip(e, dates[i], outflow, balances[i], "outflow"));
        rect.addEventListener("mousemove", (e) => showChartTooltip(e, dates[i], outflow, balances[i], "outflow"));
        rect.addEventListener("mouseleave", hideChartTooltip);
        
        svg.appendChild(rect);
    }
    
    // 4. Draw Projected Balance Area & Line
    const points = [];
    for (let i = 0; i < daysCount; i++) {
        points.push({ x: getX(i), y: getY(balances[i]) });
    }
    
    // Closed Area path down to zero level base
    const zeroBaseY = getY(Math.max(0, minYVal));
    let areaD = `M ${points[0].x} ${zeroBaseY} `;
    points.forEach(p => {
        areaD += `L ${p.x} ${p.y} `;
    });
    areaD += `L ${points[points.length - 1].x} ${zeroBaseY} Z`;
    
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaD);
    
    const hasDeficit = balances.some(b => b < 0);
    area.setAttribute("class", hasDeficit ? "chart-area danger" : "chart-area");
    svg.appendChild(area);
    
    // Connected line path
    let lineD = `M ${points[0].x} ${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
        lineD += `L ${points[i].x} ${points[i].y} `;
    }
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", lineD);
    line.setAttribute("class", hasDeficit ? "chart-line danger" : "chart-line");
    
    // Animate path draw-in effect
    svg.appendChild(line);
    setTimeout(() => {
        const length = line.getTotalLength();
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
        line.getBoundingClientRect(); // trigger reflow
        line.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        line.style.strokeDashoffset = "0";
    }, 40);
    
    // 5. Draw Projected Balance Dot Markers
    for (let i = 0; i < daysCount; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", points[i].x);
        circle.setAttribute("cy", points[i].y);
        circle.setAttribute("r", "5");
        
        const isDeficit = balances[i] < 0;
        circle.setAttribute("class", isDeficit ? "chart-dot danger" : "chart-dot");
        
        circle.addEventListener("mouseenter", (e) => showChartTooltip(e, dates[i], outflows[i], balances[i], "balance"));
        circle.addEventListener("mousemove", (e) => showChartTooltip(e, dates[i], outflows[i], balances[i], "balance"));
        circle.addEventListener("mouseleave", hideChartTooltip);
        
        svg.appendChild(circle);
    }
    
    // 6. Draw X-axis Date Labels
    for (let i = 0; i < daysCount; i++) {
        const xPos = getX(i);
        const yPos = bottomAxisY + 22;
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", xPos);
        text.setAttribute("y", yPos);
        text.setAttribute("class", "chart-label x-axis");
        
        let displayStr = "";
        if (i === 0) displayStr = "Today";
        else if (i === 1) displayStr = "Tomorrow";
        else {
            const d = new Date(dates[i]);
            displayStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }
        text.textContent = displayStr;
        svg.appendChild(text);
    }
}

/**
 * Handles chart hovering tooltip overlays.
 */
function showChartTooltip(e, dateStr, outflow, balance, activeType) {
    const tooltip = document.getElementById("chart-tooltip");
    if (!tooltip) return;
    
    const wrapper = tooltip.parentNode;
    const rect = wrapper.getBoundingClientRect();
    
    // relative click coords
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const formattedDate = new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    
    const outflowClass = balance < 0 ? "tooltip-value outflow-val danger" : "tooltip-value outflow-val";
    const balanceClass = balance < 0 ? "tooltip-value balance-val danger" : "tooltip-value balance-val";
    
    tooltip.innerHTML = `
        <div class="tooltip-date">${formattedDate}</div>
        <div class="tooltip-row" style="${activeType === 'outflow' ? 'font-weight: 700;' : ''}">
            <span class="tooltip-label">Daily Outflow:</span>
            <span class="${outflowClass}">${formatINR(outflow)}</span>
        </div>
        <div class="tooltip-row" style="${activeType === 'balance' ? 'font-weight: 700;' : ''}">
            <span class="tooltip-label">Projected Balance:</span>
            <span class="${balanceClass}">${formatINR(balance)}</span>
        </div>
    `;
    
    tooltip.style.left = `${mouseX}px`;
    tooltip.style.top = `${mouseY}px`;
    tooltip.classList.add("active");
}

function hideChartTooltip() {
    const tooltip = document.getElementById("chart-tooltip");
    if (tooltip) {
        tooltip.classList.remove("active");
    }
}

function initAIInsightsPage() {
    const recalcBtn = document.getElementById("btn-recalc-ai-insights");
    if (recalcBtn) {
        recalcBtn.addEventListener("click", () => {
            renderAIInsightsPage();
            showToast("AI Audit Complete", "Recalculated payment alerts with simulated account balance.", "success");
        });
    }
}

// ==========================================================================
// 7. Reminders Management View
// ==========================================================================

function renderRemindersTable() {
    const filterModule = document.getElementById("reminder-filter-module").value;
    const filterSchedule = document.getElementById("reminder-filter-schedule").value;
    const searchQuery = document.getElementById("global-search").value.toLowerCase();
    
    let list = state.reminders;
    
    // 1. Module filter
    if (filterModule !== "all") {
        list = list.filter(r => r.module === filterModule);
    }
    
    // 2. Schedule timeframe filter
    if (filterSchedule === "today") {
        list = list.filter(r => getDaysDifference(r.dueDate) === 0);
    } else if (filterSchedule === "soon") {
        list = list.filter(r => {
            const diff = getDaysDifference(r.dueDate);
            return diff >= 0 && diff <= 7;
        });
    } else if (filterSchedule === "month") {
        const today = new Date();
        list = list.filter(r => {
            const d = new Date(r.dueDate);
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });
    }
    
    // 3. Search query filter (fuzzy search on title, category, module)
    if (searchQuery.trim() !== "") {
        list = list.filter(r => {
            const catLabel = CATEGORY_LABEL_MAP[r.category] || "";
            return r.title.toLowerCase().includes(searchQuery) ||
                   catLabel.toLowerCase().includes(searchQuery) ||
                   r.module.toLowerCase().includes(searchQuery);
        });
    }
    
    // Render list
    const tbody = document.getElementById("reminders-table-body");
    tbody.innerHTML = "";
    
    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state" style="text-align:center;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:36px;height:36px;margin-bottom:0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p>No reminders match the selected criteria.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort reminders
    list.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    list.forEach(rem => {
        const tr = document.createElement("tr");
        const daysLeft = getDaysDifference(rem.dueDate);
        
        let statusLight = "green";
        let statusText = "Upcoming";
        if (daysLeft < 0) {
            statusLight = "red";
            statusText = "Overdue";
        } else if (daysLeft === 0) {
            statusLight = "red";
            statusText = "Due Today";
        } else if (daysLeft === 1) {
            statusLight = "orange";
            statusText = "Due Tomorrow";
        }
        
        const catLabel = CATEGORY_LABEL_MAP[rem.category] || rem.category;
        
        const channelLabels = rem.channels.map(c => {
            return `<span style="font-size:0.75rem; background-color:var(--bg-tertiary); padding: 0.15rem 0.4rem; border-radius:4px; border:1px solid var(--border-color); text-transform:capitalize;">${c}</span>`;
        }).join(" ");
        
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="status-dot ${statusLight}"></span>
                    <span style="font-size:0.8rem; font-weight:600;">${statusText}</span>
                </div>
            </td>
            <td>
                <div style="font-weight:600;">${rem.title}</div>
            </td>
            <td>
                <div style="display:flex; flex-direction:column; gap:0.2rem; align-items:flex-start;">
                    <span class="tag-module ${rem.module}" style="font-size:0.6rem;">${rem.module}</span>
                    <span style="font-size:0.8rem; color:var(--text-secondary);">${catLabel}</span>
                </div>
            </td>
            <td>
                <div style="font-size:0.9rem;">${formatDate(rem.dueDate)}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${daysLeft === 0 ? 'Due Today' : (daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`)}</div>
            </td>
            <td>
                <div style="font-weight:700; color:var(--text-primary);">${formatINR(rem.amount)}</div>
            </td>
            <td>
                <div style="display:flex; gap:0.25rem; flex-wrap:wrap;">
                    ${channelLabels}
                </div>
            </td>
            <td>
                <div style="display:flex; gap:0.25rem;">
                    <button class="action-btn sim-trigger" title="Simulate alert delivery" aria-label="Simulate alert delivery">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    </button>
                    <button class="action-btn edit-trigger" title="Edit reminder" aria-label="Edit reminder">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button class="action-btn delete-btn" title="Delete reminder" aria-label="Delete reminder">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </td>
        `;
        
        tr.querySelector(".sim-trigger").addEventListener("click", () => {
            let toastType = "info";
            if (daysLeft === 0) toastType = "danger";
            else if (daysLeft === 1) toastType = "warning";
            showToast(`${rem.title} Reminder`, `Mock notification sent: ${rem.title} of ${formatINR(rem.amount)} is due on ${formatDate(rem.dueDate)}. Channels active: ${rem.channels.join(', ')}.`, toastType);
        });
        
        tr.querySelector(".edit-trigger").addEventListener("click", () => {
            openReminderModal(rem);
        });
        
        tr.querySelector(".delete-btn").addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete "${rem.title}"?`)) {
                deleteReminder(rem.id);
            }
        });
        
        tbody.appendChild(tr);
    });
}

function initRemindersPageEvents() {
    document.getElementById("reminder-filter-module").addEventListener("change", renderRemindersTable);
    document.getElementById("reminder-filter-schedule").addEventListener("change", renderRemindersTable);
    document.getElementById("global-search").addEventListener("input", () => {
        // Switch to appropriate page if search is type
        if (state.currentView !== "reminders" && state.currentView !== "dashboard") {
            switchView("reminders");
            const navRem = document.querySelector('[data-view="reminders"]');
            if (navRem) {
                document.querySelectorAll(".nav-menu .nav-item").forEach(n => n.classList.remove("active"));
                navRem.classList.add("active");
            }
        }
        if (state.currentView === "reminders") {
            renderRemindersTable();
        } else {
            renderDashboard();
        }
    });
    
    document.getElementById("btn-add-reminder-toolbar").addEventListener("click", () => {
        openReminderModal();
    });
}

// ==========================================================================
// 8. Calendar Logic
// ==========================================================================

let calendarCurrentDate = new Date(2026, 5, 12); // Default to June 2026 (matching prompt timelines)
let calendarSelectedDate = new Date(2026, 5, 12);

function renderCalendar() {
    const grid = document.getElementById("calendar-days-grid");
    const title = document.getElementById("calendar-title");
    if (!grid || !title) return;
    
    grid.innerHTML = "";
    
    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();
    
    // Set title e.g. "June 2026"
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    title.textContent = `${monthNames[month]} ${year}`;
    
    // First day of the month
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Total days in previous month
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    // Fill days from previous month
    for (let i = firstDayIndex; i > 0; i--) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day inactive";
        dayDiv.innerHTML = `<span class="calendar-day-number">${prevMonthTotalDays - i + 1}</span>`;
        grid.appendChild(dayDiv);
    }
    
    // Fill days of current month
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        
        // Date match check
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Check if selected
        const currDateObject = new Date(year, month, day);
        if (currDateObject.toDateString() === calendarSelectedDate.toDateString()) {
            dayDiv.classList.add("today"); // use today class for selection highlight
        }
        
        // Find due alerts on this date
        const dueReminders = state.reminders.filter(r => r.dueDate === dateStr);
        
        let dotsHtml = "";
        if (dueReminders.length > 0) {
            dotsHtml = `<div class="calendar-day-events">`;
            dueReminders.forEach(r => {
                let dotColor = "var(--success)";
                if (r.module === "finance") dotColor = "var(--warning)";
                else if (r.module === "business") dotColor = "var(--primary)";
                dotsHtml += `<span class="calendar-event-dot" style="background-color: ${dotColor};" title="${r.title}"></span>`;
            });
            dotsHtml += `</div>`;
        }
        
        dayDiv.innerHTML = `
            <span class="calendar-day-number">${day}</span>
            ${dotsHtml}
        `;
        
        // Select day click
        dayDiv.addEventListener("click", () => {
            calendarSelectedDate = new Date(year, month, day);
            renderCalendar();
            renderSelectedDateEvents(dateStr);
        });
        
        grid.appendChild(dayDiv);
    }
    
    // Total cells drawn so far
    const totalCells = firstDayIndex + totalDays;
    const remainingCells = 42 - totalCells; // Draw 6 full rows
    
    // Fill next month days
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day inactive";
        dayDiv.innerHTML = `<span class="calendar-day-number">${i}</span>`;
        grid.appendChild(dayDiv);
    }
    
    // Render events list in side panel for selected date
    const selectedDateStr = calendarSelectedDate.toISOString().split('T')[0];
    renderSelectedDateEvents(selectedDateStr);
}

function renderSelectedDateEvents(dateStr) {
    const label = document.getElementById("calendar-selected-date-label");
    const list = document.getElementById("calendar-day-alerts-list");
    if (!label || !list) return;
    
    const parsedDate = new Date(dateStr);
    label.textContent = parsedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    
    list.innerHTML = "";
    
    const dues = state.reminders.filter(r => r.dueDate === dateStr);
    
    if (dues.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding:1.5rem 0.5rem;">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px;margin-bottom:0.5rem;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p style="font-size:0.8rem;">No reminders due on this date.</p>
            </div>
            <button class="btn-primary" id="calendar-quick-add-btn" style="width:100%; justify-content:center; font-size:0.8rem; padding:0.4rem 1rem;">
                Add Dues for this Day
            </button>
        `;
        
        document.getElementById("calendar-quick-add-btn").addEventListener("click", () => {
            openReminderModal({ dueDate: dateStr });
        });
        
    } else {
        dues.forEach(rem => {
            const card = document.createElement("div");
            card.className = "reminder-card";
            card.style.padding = "0.75rem";
            
            let catLabel = CATEGORY_LABEL_MAP[rem.category] || rem.category;
            
            card.innerHTML = `
                <div class="reminder-main">
                    <div class="reminder-meta">
                        <h4 style="font-size:0.85rem;">${rem.title}</h4>
                        <div class="reminder-details">
                            <span class="tag-module ${rem.module}" style="font-size:0.6rem; padding:0 0.2rem;">${rem.module}</span>
                            <span>${catLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="reminder-financial" style="margin-right: 0.5rem;">
                    <div class="reminder-amount" style="font-size:0.85rem;">${formatINR(rem.amount)}</div>
                </div>
            `;
            list.appendChild(card);
        });
        
        const btn = document.createElement("button");
        btn.className = "btn-primary";
        btn.id = "calendar-quick-add-btn";
        btn.style.width = "100%";
        btn.style.justifyContent = "center";
        btn.style.fontSize = "0.8rem";
        btn.style.padding = "0.4rem 1rem";
        btn.style.marginTop = "0.75rem";
        btn.textContent = "+ Add Another Reminder";
        btn.addEventListener("click", () => {
            openReminderModal({ dueDate: dateStr });
        });
        list.appendChild(btn);
    }
}

function initCalendarEvents() {
    const prev = document.getElementById("calendar-prev-btn");
    const next = document.getElementById("calendar-next-btn");
    const today = document.getElementById("calendar-today-btn");
    
    if (prev) {
        prev.addEventListener("click", () => {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (next) {
        next.addEventListener("click", () => {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    if (today) {
        today.addEventListener("click", () => {
            calendarCurrentDate = new Date();
            calendarSelectedDate = new Date();
            renderCalendar();
        });
    }
}

// ==========================================================================
// 9. Modal Management (Add / Edit Form)
// ==========================================================================

function openReminderModal(reminderToEdit = null) {
    const modal = document.getElementById("reminder-modal");
    const form = document.getElementById("reminder-form");
    const modalTitle = document.getElementById("modal-title-text");
    
    if (!modal || !form) return;
    
    // Reset Form
    form.reset();
    document.getElementById("form-reminder-id").value = "";
    
    // Populate Categories initially based on module default ('family')
    populateCategories("family");
    
    // Check pricing restrictions on channels
    applyPricingLocksToForm();
    
    if (reminderToEdit) {
        // If it's a pre-fill for a specific date from calendar
        if (reminderToEdit.dueDate && !reminderToEdit.id) {
            document.getElementById("form-due-date").value = reminderToEdit.dueDate;
            modalTitle.textContent = "Create New Reminder";
        } else {
            // Edit Mode
            modalTitle.textContent = "Edit Reminder";
            document.getElementById("form-reminder-id").value = reminderToEdit.id;
            document.getElementById("form-title").value = reminderToEdit.title;
            document.getElementById("form-module").value = reminderToEdit.module;
            
            // Populate category select list and select value
            populateCategories(reminderToEdit.module);
            document.getElementById("form-category").value = reminderToEdit.category;
            
            document.getElementById("form-amount").value = reminderToEdit.amount;
            document.getElementById("form-due-date").value = reminderToEdit.dueDate;
            document.getElementById("form-recurrence").value = reminderToEdit.recurrence;
            
            // Days in advance checkboxes
            const daysInAdvance = [30, 15, 7, 3, 1, 0];
            daysInAdvance.forEach(d => {
                const box = document.getElementById(`sched-${d}`);
                if (box) {
                    box.checked = reminderToEdit.schedule.includes(d);
                }
            });
            
            // Channels checkboxes
            const channels = ["push", "email", "whatsapp", "sms"];
            channels.forEach(ch => {
                const box = document.getElementById(`chan-${ch}`);
                if (box && !box.disabled) {
                    box.checked = reminderToEdit.channels.includes(ch);
                }
            });
        }
    } else {
        modalTitle.textContent = "Create New Reminder";
        // Default values
        document.getElementById("form-due-date").value = getOffsetDateStr(3);
    }
    
    modal.classList.add("active");
}

function closeReminderModal() {
    const modal = document.getElementById("reminder-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

function populateCategories(moduleValue) {
    const select = document.getElementById("form-category");
    if (!select) return;
    
    select.innerHTML = "";
    
    const categories = MODULE_CATEGORIES[moduleValue] || [];
    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.value;
        opt.textContent = cat.label;
        select.appendChild(opt);
    });
}

function applyPricingLocksToForm() {
    const waBox = document.getElementById("chan-whatsapp");
    const smsBox = document.getElementById("chan-sms");
    const emailBox = document.getElementById("chan-email");
    
    const waLabel = document.getElementById("lbl-chan-whatsapp");
    const smsLabel = document.getElementById("lbl-chan-sms");
    const emailLabel = document.getElementById("lbl-chan-email");
    
    // Reset defaults
    waBox.disabled = true;
    smsBox.disabled = true;
    emailBox.disabled = false;
    
    waLabel.className = "checkbox-label locked";
    smsLabel.className = "checkbox-label locked";
    emailLabel.className = "checkbox-label";
    
    if (state.plan === "personal") {
        emailBox.disabled = false;
        waBox.disabled = false;
        waLabel.className = "checkbox-label";
    } else if (state.plan === "family" || state.plan === "business") {
        emailBox.disabled = false;
        waBox.disabled = false;
        smsBox.disabled = false;
        
        waLabel.className = "checkbox-label";
        smsLabel.className = "checkbox-label";
    } else {
        // Free
        // Lock email in free tier as well (per user requirement email is phase 2)
        emailBox.disabled = true;
        emailLabel.className = "checkbox-label locked";
        emailLabel.innerHTML = `<input type="checkbox" id="chan-email" value="email" disabled> Email <span class="lock-badge">Prem</span>`;
    }
}

function initModalEvents() {
    const addBtn = document.getElementById("add-reminder-btn");
    const cancelBtn = document.getElementById("modal-cancel-btn");
    const closeBtn = document.getElementById("modal-close-btn");
    const form = document.getElementById("reminder-form");
    const moduleSelect = document.getElementById("form-module");
    
    if (addBtn) {
        addBtn.addEventListener("click", () => openReminderModal());
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeReminderModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", closeReminderModal);
    }
    
    // Close modal on escape or clicking backdrop
    window.addEventListener("click", (e) => {
        const overlay = document.getElementById("reminder-modal");
        if (e.target === overlay) {
            closeReminderModal();
        }
    });
    
    if (moduleSelect) {
        moduleSelect.addEventListener("change", (e) => {
            populateCategories(e.target.value);
        });
    }
    
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            saveReminderFromForm();
        });
    }
}

function saveReminderFromForm() {
    const id = document.getElementById("form-reminder-id").value;
    const title = document.getElementById("form-title").value;
    const module = document.getElementById("form-module").value;
    const category = document.getElementById("form-category").value;
    const amount = Number(document.getElementById("form-amount").value);
    const dueDate = document.getElementById("form-due-date").value;
    const recurrence = document.getElementById("form-recurrence").value;
    
    // Collect Schedule Checkboxes
    const schedule = [];
    const days = [30, 15, 7, 3, 1, 0];
    days.forEach(d => {
        if (document.getElementById(`sched-${d}`).checked) {
            schedule.push(d);
        }
    });
    
    // Collect Channels Checkboxes
    const channels = [];
    if (document.getElementById("chan-push").checked) channels.push("push");
    
    const emailBox = document.getElementById("chan-email");
    if (emailBox && !emailBox.disabled && emailBox.checked) channels.push("email");
    
    const waBox = document.getElementById("chan-whatsapp");
    if (waBox && !waBox.disabled && waBox.checked) channels.push("whatsapp");
    
    const smsBox = document.getElementById("chan-sms");
    if (smsBox && !smsBox.disabled && smsBox.checked) channels.push("sms");
    
    if (id) {
        // Edit Mode
        const idx = state.reminders.findIndex(r => r.id === id);
        if (idx !== -1) {
            state.reminders[idx] = {
                ...state.reminders[idx],
                title, module, category, amount, dueDate, recurrence, schedule, channels
            };
            showToast("Reminder Saved", `Successfully updated "${title}"`, "success");
        }
    } else {
        // Create Mode
        // Business restriction: Check if they are trying to create Business module on Free tier
        if (module === "business" && state.plan === "free") {
            alert("Business module reminders (GST, Employee, Vendors) require a Personal, Family or Business subscription. Please upgrade to create this reminder.");
            switchView("pricing");
            closeReminderModal();
            return;
        }
        
        // Free tier reminder count restriction
        const activeCount = state.reminders.length;
        if (state.plan === "free" && activeCount >= 30) {
            alert("You have reached the limit of 30 reminders on the Free tier. Upgrade your account for unlimited alerts.");
            switchView("pricing");
            closeReminderModal();
            return;
        }
        
        const newReminder = {
            id: "rem-" + Date.now(),
            title, module, category, amount, dueDate, recurrence, schedule, channels,
            completed: false
        };
        state.reminders.push(newReminder);
        showToast("Reminder Created", `Successfully scheduled alert for "${title}"`, "success");
    }
    
    saveState();
    closeReminderModal();
    
    // Refresh Current View
    switchView(state.currentView);
}

function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    saveState();
    showToast("Reminder Deleted", "The selected reminder has been removed from schedules.", "info");
    switchView(state.currentView);
}

// ==========================================================================
// 10. Pricing & Billing Model Logic
// ==========================================================================

function initPricingEvents() {
    const freeBtn = document.getElementById("btn-select-free");
    const personalBtn = document.getElementById("btn-select-personal");
    const familyBtn = document.getElementById("btn-select-family");
    const businessBtn = document.getElementById("btn-select-business");
    
    if (freeBtn) {
        freeBtn.addEventListener("click", () => selectPricingPlan("free"));
    }
    if (personalBtn) {
        personalBtn.addEventListener("click", () => selectPricingPlan("personal"));
    }
    if (familyBtn) {
        familyBtn.addEventListener("click", () => selectPricingPlan("family"));
    }
    if (businessBtn) {
        businessBtn.addEventListener("click", () => selectPricingPlan("business"));
    }
}

function selectPricingPlan(planName) {
    state.plan = planName;
    saveState();
    
    // Update Badge & Profile Panel
    updatePlanUI();
    
    // Render current view
    renderPricingPage();
    
    // Toast alert on tier shift
    let planLabel = "Free Tier";
    let message = "You are now on the basic account.";
    if (planName === "personal") {
        planLabel = "Personal Account";
        message = "Premium Email alerts & WhatsApp reminders (100/mo) are now unlocked!";
    } else if (planName === "family") {
        planLabel = "Family Portal";
        message = "SMS channels & Shared household reminders are now active.";
    } else if (planName === "business") {
        planLabel = "Business Professional";
        message = "Vendor payment lists, full GST tracking tools, and custom exports are unlocked!";
    }
    
    showToast(`Account Upgraded: ${planLabel}`, message, "success");
}

function updatePlanUI() {
    const planBadge = document.getElementById("sidebar-plan-tag");
    const tierLabel = document.getElementById("user-tier-label");
    
    if (planBadge && tierLabel) {
        if (state.plan === "free") {
            planBadge.textContent = "Free Plan";
            planBadge.style.background = "linear-gradient(135deg, var(--text-muted), var(--text-secondary))";
            tierLabel.textContent = "Free Account";
        } else if (state.plan === "personal") {
            planBadge.textContent = "Personal";
            planBadge.style.background = "linear-gradient(135deg, var(--primary), #818cf8)";
            tierLabel.textContent = `Personal (${getActiveCurrency().symbol}99/mo)`;
        } else if (state.plan === "family") {
            planBadge.textContent = "Family";
            planBadge.style.background = "linear-gradient(135deg, var(--success), #34d399)";
            tierLabel.textContent = `Family Portal (${getActiveCurrency().symbol}199/mo)`;
        } else if (state.plan === "business") {
            planBadge.textContent = "Business";
            planBadge.style.background = "linear-gradient(135deg, var(--warning), #fbbf24)";
            tierLabel.textContent = `Business Pro (${getActiveCurrency().symbol}499/mo)`;
        }
    }
}

function renderPricingPage() {
    const tiers = ["free", "personal", "family", "business"];
    const priceMap = {
        free: 0,
        personal: 99,
        family: 199,
        business: 499
    };
    const currencyInfo = getActiveCurrency();
    
    tiers.forEach(t => {
        const card = document.getElementById(`pricing-tier-${t}`);
        const btn = document.getElementById(`btn-select-${t}`);
        if (!card || !btn) return;
        
        // Update price label dynamically
        const priceDiv = card.querySelector(".price");
        if (priceDiv) {
            priceDiv.innerHTML = `${currencyInfo.symbol}${priceMap[t]} <span>/ month</span>`;
        }
        
        // Reset classes
        card.classList.remove("featured");
        btn.className = "btn-secondary btn-pricing";
        btn.textContent = "Upgrade";
        
        if (state.plan === t) {
            btn.className = "btn-primary btn-pricing";
            btn.textContent = "Current Plan";
            card.classList.add("featured");
            
            // Tweak text color if it's active
            if (t === "free") {
                btn.style.background = "linear-gradient(135deg, var(--text-secondary), var(--text-primary))";
            } else {
                btn.style.background = "";
            }
        } else {
            btn.style.background = "";
        }
    });
}

// ==========================================================================
// 11. Custom System Polishes (Theme switching, Load triggers)
// ==========================================================================

function initThemeSwitcher() {
    const themeBtn = document.getElementById("theme-toggle");
    if (!themeBtn) return;
    
    // Check user preference
    const currentTheme = localStorage.getItem("alerthub_theme");
    if (currentTheme === "dark") {
        document.body.classList.add("dark-theme");
    }
    
    themeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        localStorage.setItem("alerthub_theme", isDark ? "dark" : "light");
        showToast(
            `Theme Changed`,
            `Switched to ${isDark ? 'Dark Mode' : 'Light Mode'} interface.`,
            "info"
        );
    });
}

// ==========================================================================
// 12. Authentication Controller & Views Logic
// ==========================================================================

function initAuth() {
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    
    const skipBtn = document.getElementById("auth-skip-btn");
    const logoutBtn = document.getElementById("sidebar-logout-btn");
    
    const socialGoogle = document.getElementById("social-btn-google");
    const socialGithub = document.getElementById("social-btn-github");
    
    // Tab Switching logic
    if (tabLogin && tabSignup && loginForm && signupForm) {
        tabLogin.addEventListener("click", () => {
            tabLogin.classList.add("active");
            tabSignup.classList.remove("active");
            loginForm.classList.add("active");
            signupForm.classList.remove("active");
        });
        
        tabSignup.addEventListener("click", () => {
            tabSignup.classList.add("active");
            tabLogin.classList.remove("active");
            signupForm.classList.add("active");
            loginForm.classList.remove("active");
        });
    }
    
    // Login Form Submit logic
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const pass = document.getElementById("login-password").value;
            
            const userObj = state.registeredUsers.find(u => u.email === email && u.password === pass);
            if (userObj) {
                logInUser(userObj);
            } else {
                alert("Invalid email or password. You can use default 'dr.balaji@alerthub.com' with password 'password123' or sign up.");
            }
        });
    }
    
    // Signup Form Submit logic
    if (signupForm) {
        const signupCountry = document.getElementById("signup-country");
        const signupCountrySymbol = document.getElementById("signup-country-symbol");
        
        if (signupCountry && signupCountrySymbol) {
            // Populate country dropdown dynamically
            signupCountry.innerHTML = '<option value="" disabled selected>Select a country</option>';
            Object.keys(COUNTRY_CURRENCY_MAP).sort().forEach(country => {
                const opt = document.createElement("option");
                opt.value = country;
                opt.textContent = `${country} (${COUNTRY_CURRENCY_MAP[country].symbol})`;
                signupCountry.appendChild(opt);
            });

            signupCountry.addEventListener("change", () => {
                const country = signupCountry.value;
                const currencyInfo = COUNTRY_CURRENCY_MAP[country];
                if (currencyInfo) {
                    signupCountrySymbol.textContent = currencyInfo.symbol;
                } else {
                    signupCountrySymbol.textContent = "--";
                }
            });
        }

        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name").value.trim();
            const country = document.getElementById("signup-country").value;
            const email = document.getElementById("signup-email").value.trim().toLowerCase();
            const pass = document.getElementById("signup-password").value;
            
            if (!country) {
                alert("Please select your country.");
                return;
            }
            
            // Check if user already exists
            if (state.registeredUsers.some(u => u.email === email)) {
                alert("This email is already registered. Please log in.");
                return;
            }
            
            const newUser = { name, country, email, password: pass };
            state.registeredUsers.push(newUser);
            logInUser(newUser);
        });
    }
    
    // Skip Button Logic (Sandbox Bypass)
    if (skipBtn) {
        skipBtn.addEventListener("click", () => {
            logInUser({ name: "Guest User", email: "guest@sandbox.com", country: "Europe" }, true);
        });
    }
    
    // Social login simulate clicks
    if (socialGoogle) {
        socialGoogle.addEventListener("click", () => {
            logInUser({ name: "Google User", email: "google.user@gmail.com", country: "United States" });
        });
    }
    if (socialGithub) {
        socialGithub.addEventListener("click", () => {
            logInUser({ name: "GitHub User", email: "github.user@github.com", country: "United Kingdom" });
        });
    }
    
    // Logout Button Logic
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logOutUser();
        });
    }
}

function logInUser(user, isSandbox = false) {
    state.user = user;
    saveState();
    
    // Update Sidebar Info
    updateUserPanel();
    
    // Transition display screens
    const authContainer = document.getElementById("auth-container");
    if (authContainer) {
        authContainer.classList.add("hidden");
    }
    
    showToast(
        isSandbox ? "Logged in Sandbox Mode" : `Welcome back, ${user.name}!`,
        isSandbox ? "Feel free to try out features. Note that mock Business alerts are locked on the Free plan." : "AlertHub is connected and tracking your active schedules.",
        "success"
    );
    
    // Normal application rendering boot
    updatePlanUI();
    updateCurrencyLabels();
    switchView("dashboard");
    triggerWelcomeAlerts();
}

function logOutUser() {
    const username = state.user ? state.user.name : "User";
    state.user = null;
    saveState();
    
    const authContainer = document.getElementById("auth-container");
    if (authContainer) {
        authContainer.classList.remove("hidden");
    }
    
    // Clear forms
    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const passInput = document.getElementById("signup-password");
    const countrySelect = document.getElementById("signup-country");
    const countrySymbol = document.getElementById("signup-country-symbol");
    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
    if (countrySelect) countrySelect.selectedIndex = 0;
    if (countrySymbol) countrySymbol.textContent = "--";
    
    showToast("Logged Out Successfully", `Goodbye, ${username}. See you soon!`, "info");
}

function updateUserPanel() {
    const nameHeader = document.getElementById("user-display-name");
    const avatarDiv = document.getElementById("user-avatar");
    const subtitle = document.getElementById("view-subtitle");
    
    if (state.user) {
        if (nameHeader) nameHeader.textContent = state.user.name;
        
        if (avatarDiv) {
            // Get initials
            avatarDiv.textContent = state.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        
        if (state.currentView === "dashboard" && subtitle) {
            subtitle.textContent = `Welcome back, ${state.user.name}. Here is your overview.`;
        }
    }
}

// ==========================================================================
// 13. AI Chat Advisor Logic (Phases 1, 2, & 3)
// ==========================================================================

let voiceOutputActive = false;
let recognitionInstance = null;

function initAIChat() {
    const toggleBtn = document.getElementById("chat-toggle-btn");
    const panel = document.getElementById("chat-panel");
    const closeBtn = document.getElementById("chat-close-btn");
    const voiceToggle = document.getElementById("chat-voice-toggle");
    const sendBtn = document.getElementById("chat-send-btn");
    const micBtn = document.getElementById("chat-mic-btn");
    const micStopBtn = document.getElementById("chat-mic-stop");
    const chatInput = document.getElementById("chat-input");
    const messagesContainer = document.getElementById("chat-messages");
    
    // Toggle Chat Window Open/Close
    if (toggleBtn && panel) {
        toggleBtn.addEventListener("click", () => {
            panel.classList.toggle("active");
            if (panel.classList.contains("active")) {
                chatInput.focus();
                // If no messages yet, load initial greeting
                if (messagesContainer.children.length === 0) {
                    addAssistantMessage("Hello! I am your AlertHub AI Advisor. I have read-only access to your active payment schedules and financial profile. Ask me questions like: 'What is due today?', 'Search my EMIs', or 'Analyze payment risks'. You can also use voice interaction!");
                }
            }
        });
    }
    
    if (closeBtn && panel) {
        closeBtn.addEventListener("click", () => {
            panel.classList.remove("active");
        });
    }
    
    // Voice Output Toggle
    if (voiceToggle) {
        voiceToggle.addEventListener("click", () => {
            voiceOutputActive = !voiceOutputActive;
            if (voiceOutputActive) {
                voiceToggle.style.color = "var(--primary)";
                voiceToggle.title = "Voice Output: Enabled";
                showToast("Voice Output Enabled", "AI answers will now be read aloud using Speech Synthesis.", "info");
                speakText("Voice response enabled.");
            } else {
                voiceToggle.style.color = "var(--text-muted)";
                voiceToggle.title = "Voice Output: Disabled";
                showToast("Voice Output Disabled", "Speech synthesis has been turned off.", "info");
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
            }
        });
    }
    
    // Text submission
    if (sendBtn && chatInput) {
        sendBtn.addEventListener("click", () => submitChatQuery());
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitChatQuery();
            }
        });
    }
    
    // Quick suggestion chips
    const chips = document.querySelectorAll(".chat-chip");
    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            const query = chip.getAttribute("data-query");
            if (chatInput) {
                chatInput.value = query;
                submitChatQuery();
            }
        });
    });
    
    // Voice Recognition Input (Speech-to-Text)
    if (micBtn) {
        micBtn.addEventListener("click", () => {
            startSpeechRecognition();
        });
    }
    
    if (micStopBtn) {
        micStopBtn.addEventListener("click", () => {
            stopSpeechRecognition();
        });
    }
}

function submitChatQuery() {
    const input = document.getElementById("chat-input");
    if (!input || input.value.trim() === "") return;
    
    const text = input.value.trim();
    input.value = "";
    
    // Add User Bubble
    addUserMessage(text);
    
    // Process response after brief simulation delay
    setTimeout(() => {
        const reply = processAIQuery(text);
        addAssistantMessage(reply);
        if (voiceOutputActive) {
            speakText(reply);
        }
    }, 450);
}

function addUserMessage(text) {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    
    const msg = document.createElement("div");
    msg.className = "chat-msg user";
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    msg.innerHTML = `
        <div class="msg-bubble">${escapeHTML(text)}</div>
        <span class="msg-time">${timeStr}</span>
    `;
    
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function addAssistantMessage(text) {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    
    const msg = document.createElement("div");
    msg.className = "chat-msg assistant";
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    // Simple text-to-HTML formatter (replaces \n with <br>)
    const formattedText = text.replace(/\n/g, "<br>");
    
    msg.innerHTML = `
        <div class="msg-bubble">${formattedText}</div>
        <span class="msg-time">${timeStr}</span>
    `;
    
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// core client-side NLP processor to query reminders and generate scoring advice
function processAIQuery(query) {
    const text = query.toLowerCase().trim();
    const activeDues = state.reminders.filter(r => !r.completed);
    
    // 1. Dues today checking
    if (text.includes("due today") || text.includes("today's alerts") || text.includes("today alerts")) {
        const todayStr = getOffsetDateStr(0);
        const list = state.reminders.filter(r => r.dueDate === todayStr);
        
        if (list.length === 0) {
            return "Good news, Dr. Balaji! You have no payment dues scheduled for today.";
        }
        
        const sum = list.reduce((acc, r) => acc + Number(r.amount), 0);
        let resp = `You have ${list.length} reminder(s) due today totaling ${formatINR(sum)}:\n`;
        list.forEach(r => {
            resp += `• **${r.title}**: ${formatINR(r.amount)} (${r.category.toUpperCase()})\n`;
        });
        return resp;
    }
    
    // 2. Weekly Outflow / total outflow
    if (text.includes("outflow") || text.includes("expense") || text.includes("weekly") || text.includes("spend")) {
        let total7DayOutflow = 0;
        const items7Days = [];
        
        activeDues.forEach(r => {
            const days = getDaysDifference(r.dueDate);
            if (days >= 0 && days <= 7) {
                total7DayOutflow += Number(r.amount);
                items7Days.push(r);
            }
        });
        
        let totalAll = activeDues.reduce((acc, r) => acc + Number(r.amount), 0);
        
        if (items7Days.length === 0) {
            return `You have no active dues scheduled within the next 7 days. Your total global outflow pending is ${formatINR(totalAll)}.`;
        }
        
        let resp = `Your expected cash outflow for the next 7 days is **${formatINR(total7DayOutflow)}** across ${items7Days.length} items:\n`;
        items7Days.forEach(r => {
            const diff = getDaysDifference(r.dueDate);
            const daysLabel = diff === 0 ? "today" : (diff === 1 ? "tomorrow" : `in ${diff} days`);
            resp += `• **${r.title}**: ${formatINR(r.amount)} due ${daysLabel}\n`;
        });
        resp += `\nYour total active pending commitments equal ${formatINR(totalAll)}.`;
        return resp;
    }
    
    // 3. Search EMIs & Loans (Phase 2 feature)
    if (text.includes("emi") || text.includes("loan") || text.includes("emis")) {
        const list = state.reminders.filter(r => 
            r.category === "emi" || r.category === "home_loan" || r.category === "personal_loan"
        );
        
        if (list.length === 0) {
            return "I couldn't find any active EMIs or loan reminders configured in your profile.";
        }
        
        let resp = `Found ${list.length} EMI and Loan reminder(s):\n`;
        list.forEach(r => {
            const diff = getDaysDifference(r.dueDate);
            const status = r.completed ? "✓ Paid" : `Pending (due in ${diff} days)`;
            resp += `• **${r.title}**: ${formatINR(r.amount)} - ${status} [${r.dueDate}]\n`;
        });
        return resp;
    }
    
    // 4. Search Subscriptions (Phase 2 feature)
    if (text.includes("subscription") || text.includes("subscriptions") || text.includes("ott") || text.includes("netflix")) {
        const list = state.reminders.filter(r => r.category === "ott");
        
        if (list.length === 0) {
            return "No OTT digital subscriptions found. You can add one under the 'Family' module.";
        }
        
        let resp = `Found ${list.length} subscription tracking(s):\n`;
        list.forEach(r => {
            resp += `• **${r.title}**: ${formatINR(r.amount)} due on ${formatDate(r.dueDate)} (Recurring ${r.recurrence})\n`;
        });
        return resp;
    }
    
    // 5. Search Policies & Insurance (Phase 2 feature)
    if (text.includes("policy") || text.includes("policies") || text.includes("lic") || text.includes("insurance")) {
        const list = state.reminders.filter(r => 
            r.category === "lic" || r.category === "health_insurance" || r.category === "car_insurance"
        );
        
        if (list.length === 0) {
            return "I couldn't find any LIC or insurance policies tracked under your account.";
        }
        
        let resp = `Found ${list.length} policy / insurance schedule(s):\n`;
        list.forEach(r => {
            const diff = getDaysDifference(r.dueDate);
            resp += `• **${r.title}**: ${formatINR(r.amount)} due in ${diff} days (${formatDate(r.dueDate)})\n`;
        });
        return resp;
    }
    
    // 6. Search GST & Business taxes
    if (text.includes("gst") || text.includes("tax") || text.includes("tds")) {
        const list = state.reminders.filter(r => 
            r.category === "gst" || r.category === "tds" || r.category === "professional_tax" || r.category === "income_tax"
        );
        
        if (list.length === 0) {
            return "No active tax or GST reminders found under your account profile.";
        }
        
        let resp = `Found ${list.length} tax compliance deadline(s):\n`;
        list.forEach(r => {
            resp += `• **${r.title}**: ${formatINR(r.amount)} due on ${formatDate(r.dueDate)}\n`;
        });
        return resp;
    }
    
    // 7. General Search filter
    if (text.startsWith("search ") || text.startsWith("find ")) {
        const searchTerm = text.replace("search ", "").replace("find ", "").trim();
        const results = state.reminders.filter(r => 
            r.title.toLowerCase().includes(searchTerm) || 
            r.category.toLowerCase().includes(searchTerm)
        );
        
        if (results.length === 0) {
            return `I couldn't find any reminders matching "${searchTerm}". Try searching for categories like 'electricity', 'EMI', or 'GST'.`;
        }
        
        let resp = `Search results for "${searchTerm}" (${results.length} found):\n`;
        results.forEach(r => {
            resp += `• **${r.title}**: ${formatINR(r.amount)} due ${formatDate(r.dueDate)}\n`;
        });
        return resp;
    }
    
    // 8. Risk analysis & advisory recommendations (Phase 2 feature)
    if (text.includes("risk") || text.includes("recom") || text.includes("advice") || text.includes("overlap") || text.includes("analyze")) {
        let total7DayOutflow = 0;
        activeDues.forEach(r => {
            const days = getDaysDifference(r.dueDate);
            if (days >= 0 && days <= 7) {
                total7DayOutflow += Number(r.amount);
            }
        });
        
        // Find overlaps
        const dateGroups = {};
        activeDues.forEach(r => {
            if (!dateGroups[r.dueDate]) dateGroups[r.dueDate] = [];
            dateGroups[r.dueDate].push(r);
        });
        
        let overlapDates = [];
        Object.keys(dateGroups).forEach(d => {
            if (dateGroups[d].length > 1) {
                overlapDates.push({ date: d, items: dateGroups[d] });
            }
        });
        
        let riskScore = "LOW";
        let riskColor = "🟢";
        let advisory = "All set. Your scheduled payments are spread out nicely and are covered by your funds.";
        
        if (total7DayOutflow > state.simAccountBalance) {
            riskScore = "CRITICAL / HIGH";
            riskColor = "🔴";
            advisory = `Advisory: Expected 7-day outflows (${formatINR(total7DayOutflow)}) exceed your account balance of ${formatINR(state.simAccountBalance)}. You risk late charges or bounced items. Recommendation: Postpone your Business/Vendor invoices or transfer at least ${formatINR(total7DayOutflow - state.simAccountBalance)} to cover upcoming dues.`;
        } else if (overlapDates.length > 0) {
            riskScore = "MEDIUM";
            riskColor = "🟠";
            advisory = `Advisory: You have multiple dues falling on the same day (e.g. ${formatDate(overlapDates[0].date)} has ${overlapDates[0].items.length} items). Combined total is ${formatINR(overlapDates[0].items.reduce((s, i) => s + Number(i.amount), 0))}. Recommendation: Ensure sufficient liquidity is maintained in the bank on overlap dates to prevent processing delays.`;
        }
        
        let resp = `### ⚖️ AI Risk & Liquidity Scoring\n`;
        resp += `• **Assessed Risk Level**: ${riskColor} **${riskScore}**\n`;
        resp += `• **7-Day Outflow**: ${formatINR(total7DayOutflow)} (vs. Simulated Balance of ${formatINR(state.simAccountBalance)})\n`;
        resp += `• **Payment Overlaps**: ${overlapDates.length > 0 ? `${overlapDates.length} group conflict(s) found` : 'None detected'}\n\n`;
        resp += `**AI Recommendation**:\n${advisory}`;
        
        return resp;
    }
    
    // 9. Calendar query
    if (text.includes("calendar") || text.includes("dates") || text.includes("schedule")) {
        const datesCount = {};
        activeDues.forEach(r => {
            datesCount[r.dueDate] = (datesCount[r.dueDate] || 0) + 1;
        });
        
        const count = Object.keys(datesCount).length;
        if (count === 0) {
            return "You have no active payment dates scheduled for this month.";
        }
        
        let resp = `You have payments scheduled across **${count} separate dates** this month. Key days include:\n`;
        Object.keys(datesCount).slice(0, 4).forEach(d => {
            const items = state.reminders.filter(r => r.dueDate === d).map(i => i.title).join(", ");
            resp += `• **${formatDate(d)}**: ${datesCount[d]} alert(s) ("${items}")\n`;
        });
        resp += "\nFor a complete monthly calendar grid mapping, click on the **Calendar View** tab in the sidebar navigation.";
        return resp;
    }
    
    // 10. Simulate alert dispatch instruction (Phase 3 feature)
    if (text.includes("notify") || text.includes("send alert") || text.includes("trigger test")) {
        // Find a due reminder
        const rem = state.reminders[0] || { title: "Custom Alert", amount: 5000, dueDate: getOffsetDateStr(0) };
        
        // Dispatch toast
        setTimeout(() => {
            showToast(
                `📢 Alert Dispatched!`, 
                `WhatsApp (Premium), Push, and Email alerts sent for "${rem.title}" (${getActiveCurrency().symbol}${rem.amount}).`, 
                "success"
            );
        }, 800);
        
        return `Simulating premium multi-channel dispatch... I've triggered a Push, Email, and WhatsApp integration test alert for **"${rem.title}"**. A notification popup will show shortly!`;
    }
    
    // 11. Voice helper instruction
    if (text.includes("voice") || text.includes("speak") || text.includes("microphone")) {
        return "You can use voice commands! Toggle the 🔊 speaker icon at the top of this panel to enable speech synthesis. Click the 🎤 microphone icon in the input bar, speak a query (e.g. 'What is due today?'), and I will answer you aloud.";
    }

    // Default Fallback
    return "I didn't quite catch that. I can search policies, subscriptions, EMIs, check dues today, analyze payment risks, or simulate notifications. Try clicking one of the quick suggestion chips below!";
}

// Speech Synthesis Engine
function speakText(text) {
    if (!window.speechSynthesis) return;
    
    // Cancel any active speech first
    window.speechSynthesis.cancel();
    
    // Strip markdown formatting for text speaking
    const activeCurr = getActiveCurrency();
    const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/###/g, "")
        .replace(/•/g, "")
        .replace(new RegExp(escapeRegExp(activeCurr.symbol), 'g'), activeCurr.code + " ");
        
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Slightly faster for natural flow
    utterance.pitch = 1.0;
    
    // Try to find a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.includes("en") || v.name.includes("Google"));
    if (engVoice) {
        utterance.voice = engVoice;
    }
    
    window.speechSynthesis.speak(utterance);
}

// Speech Recognition Engine (Speech-to-Text)
function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
        return;
    }
    
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    
    const overlay = document.getElementById("chat-listening-overlay");
    if (overlay) {
        overlay.classList.add("active");
    }
    
    recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = "en-IN"; // Good support for Indian accents / currencies
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;
    
    recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById("chat-input");
        if (input) {
            input.value = transcript;
        }
        
        if (overlay) {
            overlay.classList.remove("active");
        }
        
        // Auto-submit voice transcription
        submitChatQuery();
    };
    
    recognitionInstance.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (overlay) {
            overlay.classList.remove("active");
        }
    };
    
    recognitionInstance.onend = () => {
        if (overlay) {
            overlay.classList.remove("active");
        }
    };
    
    recognitionInstance.start();
}

function stopSpeechRecognition() {
    if (recognitionInstance) {
        recognitionInstance.stop();
    }
    const overlay = document.getElementById("chat-listening-overlay");
    if (overlay) {
        overlay.classList.remove("active");
    }
}

function initHeaderCountrySelector() {
    const select = document.getElementById("header-country-select");
    if (!select) return;
    
    // Populate dropdown with all countries
    select.innerHTML = "";
    Object.keys(COUNTRY_CURRENCY_MAP).sort().forEach(country => {
        const opt = document.createElement("option");
        opt.value = country;
        opt.textContent = `${country} (${COUNTRY_CURRENCY_MAP[country].symbol})`;
        select.appendChild(opt);
    });
    
    // Listen to changes
    select.addEventListener("change", () => {
        const country = select.value;
        if (state.user) {
            state.user.country = country;
            // Also update in registeredUsers array
            const registeredUser = state.registeredUsers.find(u => u.email === state.user.email);
            if (registeredUser) {
                registeredUser.country = country;
            }
            saveState();
        }
        
        // Refresh dynamic UI elements
        updateCurrencyLabels();
        
        // Refresh the current view
        switchView(state.currentView);
        
        showToast(
            "Country Updated",
            `AlertHub has switched currency formatting to match ${country}.`,
            "success"
        );
    });
}

// ==========================================================================
// 14. Application Bootstrapper
// ==========================================================================

window.addEventListener("DOMContentLoaded", () => {
    // Load state first
    loadState();
    
    // Initialize components
    initThemeSwitcher();
    initNavigation();
    initDashboardEvents();
    initRemindersPageEvents();
    initCalendarEvents();
    initModalEvents();
    initAIInsightsPage();
    initPricingEvents();
    
    // Init Header Country Selector
    initHeaderCountrySelector();
    
    // Init Authentication Elements
    initAuth();
    
    // Init Floating AI Chat panel
    initAIChat();
    
    // Check Authentication state
    const authContainer = document.getElementById("auth-container");
    if (state.user) {
        if (authContainer) {
            authContainer.classList.add("hidden");
        }
        updateUserPanel();
        updatePlanUI();
        updateCurrencyLabels();
        switchView("dashboard");
        triggerWelcomeAlerts();
    } else {
        if (authContainer) {
            // Keep auth container visible if no user logged in
            authContainer.classList.remove("hidden");
        }
    }
});
