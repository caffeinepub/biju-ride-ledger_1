export type Language = "en" | "bn" | "hi";

type Translations = {
  nav: {
    home: string;
    addRide: string;
    history: string;
    reports: string;
    settings: string;
  };
  home: {
    title: string;
    totalIncome: string;
    totalDistance: string;
    totalRides: string;
    fuelCost: string;
    netProfit: string;
    startKm: string;
    endKm: string;
    dayDistance: string;
    blankKm: string;
    dailyTarget: string;
    goodDay: string;
    keepGoing: string;
    addFuel: string;
    insights: string;
    progress: string;
  };
  addRide: {
    title: string;
    platform: string;
    fare: string;
    commission: string;
    tips: string;
    distance: string;
    pickup: string;
    drop: string;
    date: string;
    netIncome: string;
    saveRide: string;
    voice: string;
    listening: string;
  };
  history: {
    title: string;
    search: string;
    filter: string;
    noRides: string;
    editRide: string;
    deleteRide: string;
    confirmDelete: string;
  };
  reports: {
    title: string;
    weekly: string;
    monthly: string;
    incomeTrend: string;
    fuelTrend: string;
    rideCounts: string;
    summary: string;
    goldmine: string;
    peakHours: string;
    recommendations: string;
  };
  settings: {
    title: string;
    profile: string;
    driverName: string;
    vehicleType: string;
    city: string;
    dailyTarget: string;
    platformCommissions: string;
    fuelSettings: string;
    fuelPrice: string;
    language: string;
    currency: string;
    save: string;
    commissionType: string;
    commissionValue: string;
  };
  fuel: {
    title: string;
    date: string;
    odometer: string;
    litres: string;
    cost: string;
    save: string;
  };
  common: {
    km: string;
    rs: string;
    rides: string;
    edit: string;
    delete: string;
    cancel: string;
    confirm: string;
    today: string;
    fare: string;
    net: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      addRide: "Add Ride",
      history: "History",
      reports: "Reports",
      settings: "Settings",
    },
    home: {
      title: "Dashboard",
      totalIncome: "Total Income",
      totalDistance: "Distance",
      totalRides: "Total Rides",
      fuelCost: "Fuel Cost",
      netProfit: "Net Profit",
      startKm: "Start KM",
      endKm: "End KM",
      dayDistance: "Day Distance",
      blankKm: "Blank KM",
      dailyTarget: "Daily Target",
      goodDay: "Good Day 🎉",
      keepGoing: "Keep Going 💪",
      addFuel: "Add Fuel",
      insights: "Smart Insights",
      progress: "Progress",
    },
    addRide: {
      title: "Add Ride",
      platform: "Platform",
      fare: "Fare (₹)",
      commission: "Commission (₹)",
      tips: "Tips (₹)",
      distance: "Distance (km)",
      pickup: "Pickup Area",
      drop: "Drop Area",
      date: "Date",
      netIncome: "Net Income",
      saveRide: "Save Ride",
      voice: "Voice Entry",
      listening: "Listening...",
    },
    history: {
      title: "Ride History",
      search: "Search rides...",
      filter: "Filters",
      noRides: "No rides found",
      editRide: "Edit Ride",
      deleteRide: "Delete Ride",
      confirmDelete: "Are you sure you want to delete this ride?",
    },
    reports: {
      title: "Reports",
      weekly: "Weekly",
      monthly: "Monthly",
      incomeTrend: "Income Trend",
      fuelTrend: "Fuel Expense",
      rideCounts: "Ride Count",
      summary: "Period Summary",
      goldmine: "Goldmine Areas",
      peakHours: "Peak Hours",
      recommendations: "Smart Tips",
    },
    settings: {
      title: "Settings",
      profile: "Driver Profile",
      driverName: "Driver Name",
      vehicleType: "Vehicle Type",
      city: "City",
      dailyTarget: "Daily Target (₹)",
      platformCommissions: "Platform Commissions",
      fuelSettings: "Fuel Settings",
      fuelPrice: "Fuel Price per Litre (₹)",
      language: "Language",
      currency: "Currency",
      save: "Save Settings",
      commissionType: "Commission Type",
      commissionValue: "Commission Value",
    },
    fuel: {
      title: "Add Fuel",
      date: "Date",
      odometer: "Odometer (km)",
      litres: "Litres",
      cost: "Cost (₹)",
      save: "Save Fuel",
    },
    common: {
      km: "km",
      rs: "₹",
      rides: "rides",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      confirm: "Confirm",
      today: "Today",
      fare: "Fare",
      net: "Net",
    },
  },
  bn: {
    nav: {
      home: "হোম",
      addRide: "রাইড যোগ",
      history: "ইতিহাস",
      reports: "রিপোর্ট",
      settings: "সেটিংস",
    },
    home: {
      title: "ড্যাশবোর্ড",
      totalIncome: "মোট আয়",
      totalDistance: "দূরত্ব",
      totalRides: "মোট রাইড",
      fuelCost: "জ্বালানি খরচ",
      netProfit: "নিট লাভ",
      startKm: "শুরু KM",
      endKm: "শেষ KM",
      dayDistance: "দিনের দূরত্ব",
      blankKm: "খালি KM",
      dailyTarget: "দৈনিক লক্ষ্য",
      goodDay: "ভালো দিন 🎉",
      keepGoing: "চালিয়ে যাও 💪",
      addFuel: "জ্বালানি যোগ",
      insights: "স্মার্ট পরামর্শ",
      progress: "অগ্রগতি",
    },
    addRide: {
      title: "রাইড যোগ করুন",
      platform: "প্ল্যাটফর্ম",
      fare: "ভাড়া (₹)",
      commission: "কমিশন (₹)",
      tips: "টিপস (₹)",
      distance: "দূরত্ব (km)",
      pickup: "পিকআপ এলাকা",
      drop: "ড্রপ এলাকা",
      date: "তারিখ",
      netIncome: "নিট আয়",
      saveRide: "রাইড সেভ করুন",
      voice: "ভয়েস এন্ট্রি",
      listening: "শুনছি...",
    },
    history: {
      title: "রাইড ইতিহাস",
      search: "রাইড খুঁজুন...",
      filter: "ফিল্টার",
      noRides: "কোনো রাইড পাওয়া যায়নি",
      editRide: "রাইড সম্পাদনা",
      deleteRide: "রাইড মুছুন",
      confirmDelete: "আপনি কি এই রাইডটি মুছতে চান?",
    },
    reports: {
      title: "রিপোর্ট",
      weekly: "সাপ্তাহিক",
      monthly: "মাসিক",
      incomeTrend: "আয় ট্রেন্ড",
      fuelTrend: "জ্বালানি খরচ",
      rideCounts: "রাইড সংখ্যা",
      summary: "সারসংক্ষেপ",
      goldmine: "সেরা এলাকা",
      peakHours: "পিক সময়",
      recommendations: "স্মার্ট টিপস",
    },
    settings: {
      title: "সেটিংস",
      profile: "ড্রাইভার প্রোফাইল",
      driverName: "নাম",
      vehicleType: "গাড়ির ধরন",
      city: "শহর",
      dailyTarget: "দৈনিক লক্ষ্য (₹)",
      platformCommissions: "কমিশন সেটিংস",
      fuelSettings: "জ্বালানি সেটিংস",
      fuelPrice: "প্রতি লিটার মূল্য (₹)",
      language: "ভাষা",
      currency: "মুদ্রা",
      save: "সেভ করুন",
      commissionType: "কমিশনের ধরন",
      commissionValue: "কমিশনের মান",
    },
    fuel: {
      title: "জ্বালানি যোগ করুন",
      date: "তারিখ",
      odometer: "ওডোমিটার (km)",
      litres: "লিটার",
      cost: "খরচ (₹)",
      save: "সেভ করুন",
    },
    common: {
      km: "কি.মি.",
      rs: "₹",
      rides: "রাইড",
      edit: "সম্পাদনা",
      delete: "মুছুন",
      cancel: "বাতিল",
      confirm: "নিশ্চিত",
      today: "আজ",
      fare: "ভাড়া",
      net: "নিট",
    },
  },
  hi: {
    nav: {
      home: "होम",
      addRide: "राइड जोड़ें",
      history: "इतिहास",
      reports: "रिपोर्ट",
      settings: "सेटिंग्स",
    },
    home: {
      title: "डैशबोर्ड",
      totalIncome: "कुल आय",
      totalDistance: "दूरी",
      totalRides: "कुल राइड",
      fuelCost: "ईंधन लागत",
      netProfit: "शुद्ध लाभ",
      startKm: "शुरू KM",
      endKm: "अंत KM",
      dayDistance: "दिन की दूरी",
      blankKm: "खाली KM",
      dailyTarget: "दैनिक लक्ष्य",
      goodDay: "अच्छा दिन 🎉",
      keepGoing: "चलते रहो 💪",
      addFuel: "ईंधन जोड़ें",
      insights: "स्मार्ट सुझाव",
      progress: "प्रगति",
    },
    addRide: {
      title: "राइड जोड़ें",
      platform: "प्लेटफॉर्म",
      fare: "किराया (₹)",
      commission: "कमीशन (₹)",
      tips: "टिप्स (₹)",
      distance: "दूरी (km)",
      pickup: "पिकअप क्षेत्र",
      drop: "ड्रॉप क्षेत्र",
      date: "तारीख",
      netIncome: "शुद्ध आय",
      saveRide: "राइड सेव करें",
      voice: "वॉइस एंट्री",
      listening: "सुन रहा हूँ...",
    },
    history: {
      title: "राइड इतिहास",
      search: "राइड खोजें...",
      filter: "फ़िल्टर",
      noRides: "कोई राइड नहीं मिली",
      editRide: "राइड संपादित करें",
      deleteRide: "राइड हटाएं",
      confirmDelete: "क्या आप इस राइड को हटाना चाहते हैं?",
    },
    reports: {
      title: "रिपोर्ट",
      weekly: "साप्ताहिक",
      monthly: "मासिक",
      incomeTrend: "आय ट्रेंड",
      fuelTrend: "ईंधन खर्च",
      rideCounts: "राइड संख्या",
      summary: "सारांश",
      goldmine: "सोने की खान",
      peakHours: "पीक समय",
      recommendations: "स्मार्ट टिप्स",
    },
    settings: {
      title: "सेटिंग्स",
      profile: "ड्राइवर प्रोफाइल",
      driverName: "नाम",
      vehicleType: "वाहन प्रकार",
      city: "शहर",
      dailyTarget: "दैनिक लक्ष्य (₹)",
      platformCommissions: "कमीशन सेटिंग्स",
      fuelSettings: "ईंधन सेटिंग्स",
      fuelPrice: "प्रति लीटर मूल्य (₹)",
      language: "भाषा",
      currency: "मुद्रा",
      save: "सेव करें",
      commissionType: "कमीशन प्रकार",
      commissionValue: "कमीशन मूल्य",
    },
    fuel: {
      title: "ईंधन जोड़ें",
      date: "तारीख",
      odometer: "ओडोमीटर (km)",
      litres: "लीटर",
      cost: "लागत (₹)",
      save: "सेव करें",
    },
    common: {
      km: "km",
      rs: "₹",
      rides: "राइड",
      edit: "संपादित",
      delete: "हटाएं",
      cancel: "रद्द करें",
      confirm: "पुष्टि करें",
      today: "आज",
      fare: "किराया",
      net: "शुद्ध",
    },
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export default translations;
