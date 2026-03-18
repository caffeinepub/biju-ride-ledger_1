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
    syncing: string;
    synced: string;
    syncingShort: string;
    offline: string;
    startOdometerKM: string;
    currentOdometerKM: string;
    confirmStart: string;
    confirmEnd: string;
    shiftCompleted: string;
    startKM: string;
    endKM: string;
    editShift: string;
    deleteShift: string;
    viewSummary: string;
    autoCalcHint: string;
    profitAnalyzer: string;
    todayProfit: string;
    profitPerRide: string;
    profitPerKM: string;
    deadKM: string;
    bestPlatform: string;
    bestArea: string;
    avg: string;
    needMoreRides: string;
    thisWeek: string;
    weekRides: string;
    weekIncome: string;
    weekProfit: string;
    weekBestDay: string;
    allTimeTotals: string;
    allTimeRides: string;
    allTimeIncome: string;
    allTimeFuel: string;
    allTimeRideKM: string;
    keepGoingTitle: string;
    earnedToday: string;
    remaining: string;
    deleteShiftConfirm: string;
    deleteShiftDesc: string;
    driverComparison: string;
    yourProfitPerKM: string;
    cityAvgComingSoon: string;
    moreRidesNeeded: string;
    cancelBtn: string;
    confirmBtn: string;
    deleteBtn: string;
    fuelLog: string;
    saveBtn: string;
    dashboardTips: string[];
    dailyProgress: string;
    progressLabel: string;
    targetAchieved: string;
    done: string;
    bestEarningTime: string;
    motivational: string[];
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
    quickRideBtn: string;
    stop: string;
    paymentType: string;
    customerPaid: string;
    rideDate: string;
    rideTime: string;
    updateRide: string;
    kmWarningTitle: string;
    kmWarningDesc: string;
    duplicateTitle: string;
    duplicateDesc: string;
    cashUPI: string;
    appOnline: string;
    customerPaidHelper: string;
    saveAnyway: string;
  };
  history: {
    title: string;
    search: string;
    filter: string;
    noRides: string;
    editRide: string;
    deleteRide: string;
    confirmDelete: string;
    platform: string;
    allPlatforms: string;
    from: string;
    to: string;
    minFare: string;
    maxFare: string;
    ridesCount: string;
    total: string;
    fare: string;
    comm: string;
    tips: string;
    deleteTitle: string;
    deleteDesc: string;
    runKM: string;
    blankKM: string;
    rides: string;
    rideKM: string;
    noRidesRecorded: string;
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
    income: string;
    fuelCost: string;
    runKM: string;
    blankKM: string;
    netProfit: string;
    profitPerRide: string;
    profitPerKM: string;
    bestPlatform: string;
    bestArea: string;
    exportPeriod: string;
    export: string;
    downloadAgain: string;
    share: string;
    newExport: string;
    preparing: string;
    downloadComplete: string;
    runKMHistory: string;
    fuelHistory: string;
    addMoreRides: string;
    avgPerRide: string;
    rides: string;
    today: string;
    daily: string;
    todayReport: string;
    dailyReport: string;
    insightsTitle: string;
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
    fuelType: string;
    language: string;
    currency: string;
    save: string;
    commissionType: string;
    commissionValue: string;
    appPreferences: string;
    appTheme: string;
    appSound: string;
    notifications: string;
    notificationsDesc: string;
    about: string;
    noCommission: string;
    percentage: string;
    fixed: string;
    dailyFee: string;
    lightTheme: string;
    darkTheme: string;
    soundOn: string;
    soundOff: string;
    appVersion: string;
  };
  fuel: {
    title: string;
    date: string;
    odometer: string;
    litres: string;
    cost: string;
    save: string;
    type: string;
    petrol: string;
    diesel: string;
    cng: string;
    electric: string;
    hybrid: string;
    selectType: string;
    toastError: string;
    toastSuccess: string;
    electricNote: string;
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
    save: string;
    saving: string;
    exitConfirmTitle: string;
    exitConfirmMsg: string;
  };
  shift: {
    control: string;
    shiftDate: string;
    startShift: string;
    endShift: string;
    activeSince: string;
    markOffDay: string;
    unmarkOffDay: string;
    markPersonalRun: string;
    clearPersonalRun: string;
    personalRun: string;
    offDay: string;
    viewSummary: string;
    stillActive: string;
    startKmLabel: string;
    endKmLabel: string;
    enterStartKm: string;
    enterEndKm: string;
    confirmDeleteShift: string;
    shiftUpdated: string;
    shiftStarted: string;
    profitAnalyzer: string;
    todayProfit: string;
    bestPlatform: string;
    bestArea: string;
    thisWeek: string;
    allTimeTotals: string;
    driverComparison: string;
    cityAvgSoon: string;
    weekRides: string;
    weekProfit: string;
    bestDay: string;
    shiftActive: string;
    shiftKm: string;
  };
  shift_summary: {
    title: string;
    totalRides: string;
    rideKM: string;
    runKM: string;
    deadKM: string;
    totalIncome: string;
    fuelCost: string;
    tips: string;
    netProfit: string;
    close: string;
  };
  quickRide: {
    title: string;
    platform: string;
    fare: string;
    rideKM: string;
    paymentType: string;
    cashUPI: string;
    appOnline: string;
    tipOptional: string;
    areaOptional: string;
    netIncome: string;
    cancel: string;
    saveRide: string;
    toastError: string;
    toastSuccess: string;
    commission: string;
  };
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    hello: string;
  };
  profile: {
    title: string;
    edit: string;
    editProfile: string;
    saveChanges: string;
    name: string;
    vehicleType: string;
    city: string;
    dailyTarget: string;
    yourStats: string;
    totalRides: string;
    totalKmDriven: string;
    bestDayEarnings: string;
    dayStreak: string;
    achievement: string;
    drivingSince: string;
    drivingSincePlaceholder: string;
    todayMotivation: string;
    changePhoto: string;
    takePhoto: string;
    chooseGallery: string;
    notSet: string;
    newDriver: string;
  };
  motivations: string[];
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
      syncing: "Syncing...",
      synced: "Synced",
      syncingShort: "Syncing",
      offline: "Offline",
      startOdometerKM: "Start Odometer (KM)",
      currentOdometerKM: "Current Odometer (KM)",
      confirmStart: "Confirm Start",
      confirmEnd: "Confirm End",
      shiftCompleted: "✅ Shift Completed",
      startKM: "Start KM:",
      endKM: "End KM:",
      editShift: "✏️ Edit",
      deleteShift: "🗑️ Delete",
      viewSummary: "📈 View Summary",
      autoCalcHint:
        "Auto-calculated from odometer (End KM − Start KM). You can edit if needed.",
      profitAnalyzer: "Profit Analyzer",
      todayProfit: "Today's Profit",
      profitPerRide: "Profit/Ride",
      profitPerKM: "Profit/KM",
      deadKM: "Dead KM",
      bestPlatform: "Best Platform",
      bestArea: "Best Area",
      avg: "Avg",
      needMoreRides: "Need more rides",
      thisWeek: "This Week",
      weekRides: "Rides",
      weekIncome: "Income",
      weekProfit: "Profit",
      weekBestDay: "Best Day",
      allTimeTotals: "All Time Totals",
      allTimeRides: "Rides",
      allTimeIncome: "Income",
      allTimeFuel: "Fuel",
      allTimeRideKM: "Ride KM",
      keepGoingTitle: "Keep Going!",
      earnedToday: "Earned Today",
      remaining: "Remaining",
      deleteShiftConfirm: "Delete Shift?",
      deleteShiftDesc:
        "This will permanently delete the shift and all associated odometer data.",
      driverComparison: "Driver Comparison",
      yourProfitPerKM: "Your Profit per KM",
      cityAvgComingSoon: "City average data coming soon.",
      moreRidesNeeded: "More ride data needed for insights (need 5+ rides)",
      cancelBtn: "Cancel",
      confirmBtn: "Confirm",
      deleteBtn: "Delete",
      fuelLog: "Fuel Log",
      saveBtn: "Save",
      dashboardTips: [
        "Reduce blank KM to boost profit",
        "Cash rides earn more tips",
        "Peak hours: 7-9AM & 5-8PM",
      ],
      dailyProgress: "Daily Progress",
      progressLabel: "Progress",
      targetAchieved: "Target Achieved",
      done: "Done!",
      bestEarningTime: "Best earning time",
      motivational: [
        "Every ride counts! You've got this!",
        "Good start! Keep the momentum going!",
        "Great progress! Halfway to your goal!",
        "Almost there! Just a few more rides!",
        "Fantastic! You have hit your target today!",
      ],
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
      quickRideBtn: "QUICK RIDE",
      stop: "Stop",
      paymentType: "Payment Type",
      customerPaid: "Customer Paid (₹)",
      rideDate: "Ride Date",
      rideTime: "Ride Time (optional)",
      updateRide: "Update Ride",
      kmWarningTitle: "Ride KM Exceeds Run KM",
      kmWarningDesc:
        "Today's total Ride KM exceeds the Run KM recorded from the odometer. This may indicate unrealistic data. Save anyway?",
      duplicateTitle: "Possible Duplicate Ride",
      duplicateDesc:
        "A ride with the same fare, distance, platform, and date already exists. Save anyway?",
      cashUPI: "Cash / UPI",
      appOnline: "App Online",
      customerPaidHelper: "Enter amount customer handed you",
      saveAnyway: "Save Anyway",
    },
    history: {
      title: "Ride History",
      search: "Search rides...",
      filter: "Filters",
      noRides: "No rides found",
      editRide: "Edit Ride",
      deleteRide: "Delete Ride",
      confirmDelete: "Are you sure you want to delete this ride?",
      platform: "Platform",
      allPlatforms: "All Platforms",
      from: "From",
      to: "To",
      minFare: "Min Fare",
      maxFare: "Max Fare",
      ridesCount: "rides",
      total: "Total:",
      fare: "Fare:",
      comm: "Comm:",
      tips: "Tips: ₹",
      deleteTitle: "Delete Ride?",
      deleteDesc:
        "Are you sure you want to delete this ride? This cannot be undone.",
      runKM: "Run KM",
      blankKM: "Blank KM",
      rides: "Rides",
      rideKM: "Ride KM",
      noRidesRecorded: "No rides recorded",
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
      income: "Income",
      fuelCost: "Fuel Cost",
      runKM: "Run KM",
      blankKM: "Blank KM",
      netProfit: "Net Profit",
      profitPerRide: "Profit/Ride",
      profitPerKM: "Profit/KM",
      bestPlatform: "Best Platform",
      bestArea: "Best Area",
      exportPeriod: "Export period:",
      export: "Export",
      downloadAgain: "Download Again",
      share: "Share",
      newExport: "New Export",
      preparing: "Preparing report...",
      downloadComplete: "✓ Download complete",
      runKMHistory: "Run KM History",
      fuelHistory: "Fuel History",
      addMoreRides: "Add more rides to get smart insights.",
      avgPerRide: "Avg",
      rides: "Rides",
      today: "Today",
      daily: "Daily",
      todayReport: "Today",
      dailyReport: "Daily Report",
      insightsTitle: "Detailed Insights",
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
      fuelType: "Default Fuel Type",
      language: "Language",
      currency: "Currency",
      save: "Save Settings",
      commissionType: "Commission Type",
      commissionValue: "Commission Value",
      appPreferences: "App Preferences",
      appTheme: "App Theme",
      appSound: "App Sound",
      notifications: "In-App Notifications",
      notificationsDesc: "Low earnings, fuel, blank KM alerts",
      about: "About",
      noCommission: "No Commission",
      percentage: "Percentage (%)",
      fixed: "Fixed Amount (₹)",
      dailyFee: "Daily Platform Fee (₹)",
      lightTheme: "☀️ Light",
      darkTheme: "🌙 Dark",
      soundOn: "🔊 ON",
      soundOff: "🔇 OFF",
      appVersion: "Smart Earnings Tracker for Ride Drivers",
    },
    fuel: {
      title: "Add Fuel",
      date: "Date",
      odometer: "Odometer (km)",
      litres: "Litres",
      cost: "Cost (₹)",
      save: "Save Fuel",
      type: "Fuel Type",
      petrol: "Petrol",
      diesel: "Diesel",
      cng: "CNG",
      electric: "Electric",
      hybrid: "Hybrid",
      selectType: "Select fuel type",
      toastError: "Please fill all fields correctly",
      toastSuccess: "Fuel entry saved!",
      electricNote: "Electric vehicles don't require fuel cost",
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
      save: "Save",
      saving: "Saving...",
      exitConfirmTitle: "Exit App?",
      exitConfirmMsg: "Are you sure you want to exit Biju's RideBook?",
    },
    shift: {
      control: "Shift Control",
      shiftDate: "Shift Date",
      startShift: "▶ Start Shift",
      endShift: "■ End Shift",
      activeSince: "⚡ Shift Active since",
      markOffDay: "🛌 Off Day",
      unmarkOffDay: "Unmark Off Day",
      markPersonalRun: "🚗 Personal Run",
      clearPersonalRun: "Clear Personal Run",
      personalRun: "PERSONAL RUN",
      offDay: "OFF DAY",
      viewSummary: "View Today Summary",
      stillActive: "Shift still active — End Shift to see final profit summary",
      startKmLabel: "Start KM",
      endKmLabel: "End KM",
      enterStartKm: "Enter Start KM",
      enterEndKm: "Enter End KM",
      confirmDeleteShift: "Are you sure you want to delete this shift?",
      shiftUpdated: "Shift updated",
      shiftStarted: "Shift started!",
      profitAnalyzer: "Profit Analyzer",
      todayProfit: "Today's Profit",
      bestPlatform: "Best Platform",
      bestArea: "Best Area",
      thisWeek: "This Week",
      allTimeTotals: "All Time Totals",
      driverComparison: "Driver Comparison",
      cityAvgSoon: "City average data coming soon.",
      weekRides: "Rides",
      weekProfit: "Profit",
      bestDay: "Best Day",
      shiftActive: "Shift Active",
      shiftKm: "Shift KM",
    },
    shift_summary: {
      title: "Today's Summary",
      totalRides: "Total Rides",
      rideKM: "Ride KM",
      runKM: "Run KM",
      deadKM: "Dead KM",
      totalIncome: "Total Income",
      fuelCost: "Fuel Cost",
      tips: "Tips",
      netProfit: "Net Profit",
      close: "Close",
    },
    quickRide: {
      title: "Quick Ride",
      platform: "Platform",
      fare: "Fare (₹)",
      rideKM: "Ride KM",
      paymentType: "Payment Type",
      cashUPI: "Cash / UPI",
      appOnline: "App Online",
      tipOptional: "Tip (optional)",
      areaOptional: "Area (optional)",
      netIncome: "Net Income",
      cancel: "Cancel",
      saveRide: "Save Ride",
      toastError: "Please fill all required fields",
      toastSuccess: "Ride saved!",
      commission: "Commission",
    },
    greeting: {
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening",
      night: "Good Night",
      hello: "Hello",
    },
    profile: {
      title: "Driver Profile",
      edit: "Edit",
      editProfile: "Edit Profile",
      saveChanges: "Save Changes",
      name: "Name",
      vehicleType: "Vehicle Type",
      city: "City",
      dailyTarget: "Daily Target (₹)",
      yourStats: "Your Stats",
      totalRides: "Total Rides",
      totalKmDriven: "Total KM Driven",
      bestDayEarnings: "Best Day Earnings",
      dayStreak: "Day Streak",
      achievement: "Achievement",
      drivingSince: "Driving Since (Year)",
      drivingSincePlaceholder: "e.g. 2020",
      todayMotivation: "Today's Motivation",
      changePhoto: "Change Profile Photo",
      takePhoto: "📷 Take Photo (Camera)",
      chooseGallery: "🖼️ Choose from Gallery",
      notSet: "Not set",
      newDriver: "🚗 New Driver",
    },
    motivations: [
      "Every kilometer brings you closer to your goal. Keep driving!",
      "Your consistency today builds tomorrow's success.",
      "Hard work on the road pays off. You're doing great!",
      "Each ride is a step forward. Stay focused!",
      "The best drivers aren't born — they're built ride by ride.",
      "Your dedication inspires others. Keep going!",
      "Small progress every day adds up to big results.",
      "Proud of your hustle. Today is another winning day!",
      "Stay safe, stay focused, and earn well today!",
      "Your road to financial freedom is one ride at a time.",
    ],
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
      syncing: "সিঙ্ক হচ্ছে...",
      synced: "সিঙ্ক হয়েছে",
      syncingShort: "সিঙ্ক",
      offline: "অফলাইন",
      startOdometerKM: "শুরুর ওডোমিটার (কিমি)",
      currentOdometerKM: "বর্তমান ওডোমিটার (কিমি)",
      confirmStart: "শুরু নিশ্চিত করুন",
      confirmEnd: "শেষ নিশ্চিত করুন",
      shiftCompleted: "✅ শিফট সম্পন্ন",
      startKM: "শুরু কিমি:",
      endKM: "শেষ কিমি:",
      editShift: "✏️ সম্পাদনা",
      deleteShift: "🗑️ মুছুন",
      viewSummary: "📈 সারসংক্ষেপ দেখুন",
      autoCalcHint: "ওডোমিটার থেকে স্বয়ংক্রিয়ভাবে গণনা। প্রয়োজনে সম্পাদনা করুন।",
      profitAnalyzer: "মুনাফা বিশ্লেষক",
      todayProfit: "আজকের লাভ",
      profitPerRide: "প্রতি রাইড লাভ",
      profitPerKM: "প্রতি কিমি লাভ",
      deadKM: "ডেড কিমি",
      bestPlatform: "সেরা প্ল্যাটফর্ম",
      bestArea: "সেরা এলাকা",
      avg: "গড়",
      needMoreRides: "আরও রাইড দরকার",
      thisWeek: "এই সপ্তাহ",
      weekRides: "রাইড",
      weekIncome: "আয়",
      weekProfit: "লাভ",
      weekBestDay: "সেরা দিন",
      allTimeTotals: "সর্বকালের মোট",
      allTimeRides: "রাইড",
      allTimeIncome: "আয়",
      allTimeFuel: "জ্বালানি",
      allTimeRideKM: "রাইড কিমি",
      keepGoingTitle: "চালিয়ে যাও!",
      earnedToday: "আজ উপার্জিত",
      remaining: "বাকি",
      deleteShiftConfirm: "শিফট মুছবেন?",
      deleteShiftDesc: "এটি শিফট এবং সংশ্লিষ্ট ওডোমিটার ডেটা স্থায়ীভাবে মুছে দেবে।",
      driverComparison: "ড্রাইভার তুলনা",
      yourProfitPerKM: "আপনার প্রতি কিমি লাভ",
      cityAvgComingSoon: "শহরের গড় ডেটা শীঘ্রই আসছে।",
      moreRidesNeeded: "অন্তর্দৃষ্টির জন্য আরও রাইড ডেটা দরকার (৫+ রাইড)",
      cancelBtn: "বাতিল",
      confirmBtn: "নিশ্চিত করুন",
      deleteBtn: "মুছুন",
      fuelLog: "জ্বালানি লগ",
      saveBtn: "সেভ",
      dashboardTips: [
        "খালি কিমি কমান, মুনাফা বাড়ান",
        "নগদ রাইডে বেশি টিপস পাওয়া যায়",
        "পিক আওয়ার: সকাল ৭-৯ ও সন্ধ্যা ৫-৮",
      ],
      dailyProgress: "দৈনিক অগ্রগতি",
      progressLabel: "অগ্রগতি",
      targetAchieved: "লক্ষ্য অর্জিত",
      done: "শেষ!",
      bestEarningTime: "সেরা উপার্জনের সময়",
      motivational: [
        "প্রতিটি রাইড গুরুত্বপূর্ণ! তুমি পারবে!",
        "ভালো শুরু! এগিয়ে চলো!",
        "দারুণ অগ্রগতি! লক্ষ্যের অর্ধেক পথ!",
        "প্রায় পৌঁছে গেছ! আর কয়েকটি রাইড!",
        "অসাধারণ! আজকের লক্ষ্য পূরণ হয়েছে!",
      ],
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
      quickRideBtn: "দ্রুত রাইড",
      stop: "বন্ধ",
      paymentType: "পেমেন্ট ধরন",
      customerPaid: "গ্রাহক পরিশোধ (₹)",
      rideDate: "রাইডের তারিখ",
      rideTime: "রাইডের সময় (ঐচ্ছিক)",
      updateRide: "রাইড আপডেট করুন",
      kmWarningTitle: "রাইড কিমি রান কিমি ছাড়িয়ে গেছে",
      kmWarningDesc:
        "মোট রাইড কিমি আজকের রান কিমি ছাড়িয়ে গেছে। এটি ভুল হতে পারে। তবুও সেভ করবেন?",
      duplicateTitle: "সম্ভাব্য ডুপ্লিকেট রাইড",
      duplicateDesc:
        "একই ভাড়া, দূরত্ব, প্ল্যাটফর্ম ও তারিখে রাইড আগে থেকে আছে। তবুও সেভ করবেন?",
      cashUPI: "নগদ / ইউপিআই",
      appOnline: "অ্যাপ অনলাইন",
      customerPaidHelper: "গ্রাহক যা দিয়েছেন তা লিখুন",
      saveAnyway: "তবুও সেভ করুন",
    },
    history: {
      title: "রাইড ইতিহাস",
      search: "রাইড খুঁজুন...",
      filter: "ফিল্টার",
      noRides: "কোনো রাইড পাওয়া যায়নি",
      editRide: "রাইড সম্পাদনা",
      deleteRide: "রাইড মুছুন",
      confirmDelete: "আপনি কি এই রাইডটি মুছতে চান?",
      platform: "প্ল্যাটফর্ম",
      allPlatforms: "সব প্ল্যাটফর্ম",
      from: "থেকে",
      to: "পর্যন্ত",
      minFare: "ন্যূনতম ভাড়া",
      maxFare: "সর্বোচ্চ ভাড়া",
      ridesCount: "রাইড",
      total: "মোট:",
      fare: "ভাড়া:",
      comm: "কমিশন:",
      tips: "টিপস: ₹",
      deleteTitle: "রাইড মুছবেন?",
      deleteDesc: "আপনি কি এই রাইডটি মুছতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।",
      runKM: "রান কিমি",
      blankKM: "ব্লাঙ্ক কিমি",
      rides: "রাইড",
      rideKM: "রাইড কিমি",
      noRidesRecorded: "কোনো রাইড রেকর্ড নেই",
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
      income: "আয়",
      fuelCost: "জ্বালানি খরচ",
      runKM: "রান কিমি",
      blankKM: "ব্লাঙ্ক কিমি",
      netProfit: "নিট লাভ",
      profitPerRide: "প্রতি রাইড লাভ",
      profitPerKM: "প্রতি কিমি লাভ",
      bestPlatform: "সেরা প্ল্যাটফর্ম",
      bestArea: "সেরা এলাকা",
      exportPeriod: "রপ্তানির সময়কাল:",
      export: "রপ্তানি",
      downloadAgain: "আবার ডাউনলোড করুন",
      share: "শেয়ার",
      newExport: "নতুন রপ্তানি",
      preparing: "রিপোর্ট প্রস্তুত হচ্ছে...",
      downloadComplete: "✓ ডাউনলোড সম্পন্ন",
      runKMHistory: "রান কিমি ইতিহাস",
      fuelHistory: "জ্বালানি ইতিহাস",
      addMoreRides: "স্মার্ট অন্তর্দৃষ্টির জন্য আরও রাইড যোগ করুন।",
      avgPerRide: "গড়",
      rides: "রাইড",
      today: "আজ",
      daily: "দৈনিক",
      todayReport: "আজকের রিপোর্ট",
      dailyReport: "দৈনিক রিপোর্ট",
      insightsTitle: "বিস্তারিত বিশ্লেষণ",
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
      fuelType: "ডিফল্ট জ্বালানির ধরন",
      language: "ভাষা",
      currency: "মুদ্রা",
      save: "সেভ করুন",
      commissionType: "কমিশনের ধরন",
      commissionValue: "কমিশনের মান",
      appPreferences: "অ্যাপ পছন্দ",
      appTheme: "অ্যাপ থিম",
      appSound: "অ্যাপ সাউন্ড",
      notifications: "ইন-অ্যাপ বিজ্ঞপ্তি",
      notificationsDesc: "কম উপার্জন, জ্বালানি, খালি KM সতর্কতা",
      about: "পরিচিতি",
      noCommission: "কোনো কমিশন নেই",
      percentage: "শতাংশ (%)",
      fixed: "নির্দিষ্ট পরিমাণ (₹)",
      dailyFee: "দৈনিক প্ল্যাটফর্ম ফি (₹)",
      lightTheme: "☀️ হালকা",
      darkTheme: "🌙 গাঢ়",
      soundOn: "🔊 চালু",
      soundOff: "🔇 বন্ধ",
      appVersion: "রাইড ড্রাইভারদের জন্য স্মার্ট আয় ট্র্যাকার",
    },
    fuel: {
      title: "জ্বালানি যোগ করুন",
      date: "তারিখ",
      odometer: "ওডোমিটার (km)",
      litres: "লিটার",
      cost: "খরচ (₹)",
      save: "সেভ করুন",
      type: "জ্বালানির ধরন",
      petrol: "পেট্রোল",
      diesel: "ডিজেল",
      cng: "সিএনজি",
      electric: "ইলেক্ট্রিক",
      hybrid: "হাইব্রিড",
      selectType: "জ্বালানির ধরন বেছে নিন",
      toastError: "সব তথ্য সঠিকভাবে পূরণ করুন",
      toastSuccess: "জ্বালানি এন্ট্রি সংরক্ষিত!",
      electricNote: "ইলেক্ট্রিক গাড়িতে জ্বালানি খরচ লাগে না",
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
      save: "সেভ",
      saving: "সেভ হচ্ছে...",
      exitConfirmTitle: "অ্যাপ বন্ধ করবেন?",
      exitConfirmMsg: "আপনি কি সত্যিই Biju's RideBook বন্ধ করতে চান?",
    },
    shift: {
      control: "শিফট নিয়ন্ত্রণ",
      shiftDate: "শিফটের তারিখ",
      startShift: "▶ শিফট শুরু",
      endShift: "■ শিফট শেষ",
      activeSince: "⚡ শিফট চালু",
      markOffDay: "🛌 ছুটির দিন",
      unmarkOffDay: "ছুটির দিন বাতিল",
      markPersonalRun: "🚗 ব্যক্তিগত রান",
      clearPersonalRun: "ব্যক্তিগত রান বাতিল",
      personalRun: "ব্যক্তিগত রান",
      offDay: "ছুটির দিন",
      viewSummary: "আজকের সারসংক্ষেপ দেখুন",
      stillActive: "শিফট এখনও চলছে — চূড়ান্ত মুনাফা দেখতে শিফট শেষ করুন",
      startKmLabel: "শুরু KM",
      endKmLabel: "শেষ KM",
      enterStartKm: "শুরু KM দিন",
      enterEndKm: "শেষ KM দিন",
      confirmDeleteShift: "আপনি কি এই শিফটটি মুছতে চান?",
      shiftUpdated: "শিফট আপডেট হয়েছে",
      shiftStarted: "শিফট শুরু হয়েছে!",
      profitAnalyzer: "মুনাফা বিশ্লেষণ",
      todayProfit: "আজকের মুনাফা",
      bestPlatform: "সেরা প্ল্যাটফর্ম",
      bestArea: "সেরা এলাকা",
      thisWeek: "এই সপ্তাহ",
      allTimeTotals: "সর্বকালের মোট",
      driverComparison: "ড্রাইভার তুলনা",
      cityAvgSoon: "শহরের গড় তথ্য শীঘ্রই আসছে।",
      weekRides: "রাইড",
      weekProfit: "মুনাফা",
      bestDay: "সেরা দিন",
      shiftActive: "শিফট চলছে",
      shiftKm: "শিফট কিমি",
    },
    shift_summary: {
      title: "আজকের সারসংক্ষেপ",
      totalRides: "মোট রাইড",
      rideKM: "রাইড কিমি",
      runKM: "রান কিমি",
      deadKM: "ডেড কিমি",
      totalIncome: "মোট আয়",
      fuelCost: "জ্বালানি খরচ",
      tips: "টিপস",
      netProfit: "নিট লাভ",
      close: "বন্ধ করুন",
    },
    quickRide: {
      title: "দ্রুত রাইড",
      platform: "প্ল্যাটফর্ম",
      fare: "ভাড়া (₹)",
      rideKM: "রাইড কিমি",
      paymentType: "পেমেন্ট ধরন",
      cashUPI: "নগদ / ইউপিআই",
      appOnline: "অ্যাপ অনলাইন",
      tipOptional: "টিপ (ঐচ্ছিক)",
      areaOptional: "এলাকা (ঐচ্ছিক)",
      netIncome: "নিট আয়",
      cancel: "বাতিল",
      saveRide: "রাইড সংরক্ষণ",
      toastError: "সব প্রয়োজনীয় তথ্য পূরণ করুন",
      toastSuccess: "রাইড সংরক্ষিত!",
      commission: "কমিশন",
    },
    greeting: {
      morning: "শুভ সকাল",
      afternoon: "শুভ অপরাহ্ন",
      evening: "শুভ সন্ধ্যা",
      night: "শুভ রাত্রি",
      hello: "নমস্কার",
    },
    profile: {
      title: "ড্রাইভার প্রোফাইল",
      edit: "সম্পাদনা",
      editProfile: "প্রোফাইল সম্পাদনা",
      saveChanges: "পরিবর্তন সেভ করুন",
      name: "নাম",
      vehicleType: "গাড়ির ধরন",
      city: "শহর",
      dailyTarget: "দৈনিক লক্ষ্য (₹)",
      yourStats: "আপনার পরিসংখ্যান",
      totalRides: "মোট রাইড",
      totalKmDriven: "মোট KM চালানো",
      bestDayEarnings: "সেরা দিনের উপার্জন",
      dayStreak: "দিনের ধারা",
      achievement: "অর্জন",
      drivingSince: "যখন থেকে চালাচ্ছেন (বছর)",
      drivingSincePlaceholder: "যেমন: ২০২০",
      todayMotivation: "আজকের অনুপ্রেরণা",
      changePhoto: "প্রোফাইল ছবি পরিবর্তন",
      takePhoto: "📷 ছবি তুলুন (ক্যামেরা)",
      chooseGallery: "🖼️ গ্যালারি থেকে বেছে নিন",
      notSet: "সেট করা হয়নি",
      newDriver: "🚗 নতুন ড্রাইভার",
    },
    motivations: [
      "প্রতিটি কিলোমিটার আপনাকে আপনার লক্ষ্যের কাছে নিয়ে যায়। চালিয়ে যান!",
      "আজকের ধারাবাহিকতা আগামীকালের সাফল্য গড়ে তোলে।",
      "রাস্তায় পরিশ্রম ফল দেয়। আপনি দারুণ করছেন!",
      "প্রতিটি রাইড একটি এগিয়ে যাওয়ার পদক্ষেপ। মনোযোগ রাখুন!",
      "সেরা চালকরা জন্মগ্রহণ করেন না — তারা রাইডের পর রাইডে গড়ে ওঠেন।",
      "আপনার নিষ্ঠা অন্যদের অনুপ্রাণিত করে। চালিয়ে যান!",
      "প্রতিদিনের ছোট অগ্রগতি বড় ফলাফলে পরিণত হয়।",
      "আপনার পরিশ্রমে গর্বিত। আজও একটি জয়ের দিন!",
      "নিরাপদ থাকুন, মনোযোগ রাখুন, এবং আজ ভালো উপার্জন করুন!",
      "আর্থিক স্বাধীনতার পথ একটি রাইড থেকে শুরু।",
    ],
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
      syncing: "सिंक हो रहा है...",
      synced: "सिंक हो गया",
      syncingShort: "सिंक",
      offline: "ऑफ़लाइन",
      startOdometerKM: "शुरुआती ओडोमीटर (किमी)",
      currentOdometerKM: "वर्तमान ओडोमीटर (किमी)",
      confirmStart: "शुरू की पुष्टि करें",
      confirmEnd: "समाप्ति की पुष्टि करें",
      shiftCompleted: "✅ शिफ्ट पूर्ण",
      startKM: "शुरू किमी:",
      endKM: "अंत किमी:",
      editShift: "✏️ संपादित करें",
      deleteShift: "🗑️ हटाएं",
      viewSummary: "📈 सारांश देखें",
      autoCalcHint: "ओडोमीटर से स्वतः गणना। जरूरत हो तो बदलें।",
      profitAnalyzer: "लाभ विश्लेषक",
      todayProfit: "आज का लाभ",
      profitPerRide: "प्रति सवारी लाभ",
      profitPerKM: "प्रति किमी लाभ",
      deadKM: "डेड किमी",
      bestPlatform: "सर्वश्रेष्ठ प्लेटफ़ॉर्म",
      bestArea: "सर्वश्रेष्ठ क्षेत्र",
      avg: "औसत",
      needMoreRides: "अधिक सवारी चाहिए",
      thisWeek: "इस सप्ताह",
      weekRides: "सवारी",
      weekIncome: "आमदनी",
      weekProfit: "लाभ",
      weekBestDay: "सर्वश्रेष्ठ दिन",
      allTimeTotals: "सर्वकालिक कुल",
      allTimeRides: "सवारी",
      allTimeIncome: "आमदनी",
      allTimeFuel: "ईंधन",
      allTimeRideKM: "सवारी किमी",
      keepGoingTitle: "जारी रखो!",
      earnedToday: "आज की कमाई",
      remaining: "शेष",
      deleteShiftConfirm: "शिफ्ट हटाएं?",
      deleteShiftDesc: "यह शिफ्ट और संबंधित ओडोमीटर डेटा को स्थायी रूप से हटा देगा।",
      driverComparison: "ड्राइवर तुलना",
      yourProfitPerKM: "आपका प्रति किमी लाभ",
      cityAvgComingSoon: "शहर का औसत डेटा जल्द आ रहा है।",
      moreRidesNeeded: "अंतर्दृष्टि के लिए अधिक सवारी डेटा चाहिए (5+ सवारी)",
      cancelBtn: "रद्द करें",
      confirmBtn: "पुष्टि करें",
      deleteBtn: "हटाएं",
      fuelLog: "ईंधन लॉग",
      saveBtn: "सेव",
      dashboardTips: [
        "खाली KM घटाएं, मुनाफा बढ़ाएं",
        "नकद सवारी में ज्यादा टिप्स मिलते हैं",
        "पीक समय: सुबह 7-9 और शाम 5-8",
      ],
      dailyProgress: "दैनिक प्रगति",
      progressLabel: "प्रगति",
      targetAchieved: "लक्ष्य प्राप्त",
      done: "हो गया!",
      bestEarningTime: "सबसे अच्छा कमाई का समय",
      motivational: [
        "हर सवारी मायने रखती है! आप कर सकते हैं!",
        "अच्छी शुरुआत! गति बनाए रखें!",
        "शानदार प्रगति! लक्ष्य के आधे रास्ते!",
        "लगभग पहुंच गए! बस कुछ और सवारियां!",
        "शानदार! आपने आज का लक्ष्य पूरा किया!",
      ],
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
      quickRideBtn: "त्वरित सवारी",
      stop: "रोकें",
      paymentType: "भुगतान प्रकार",
      customerPaid: "ग्राहक द्वारा भुगतान (₹)",
      rideDate: "सवारी की तारीख",
      rideTime: "सवारी का समय (वैकल्पिक)",
      updateRide: "सवारी अपडेट करें",
      kmWarningTitle: "सवारी किमी रन किमी से अधिक है",
      kmWarningDesc:
        "कुल सवारी किमी आज के रन किमी से अधिक है। यह गलत हो सकता है। फिर भी सेव करें?",
      duplicateTitle: "संभावित डुप्लीकेट सवारी",
      duplicateDesc:
        "इस तारीख के लिए पहले से एक समान सवारी मौजूद है। क्या आप सहेजना चाहते हैं?",
      cashUPI: "नकद / यूपीआई",
      appOnline: "ऐप ऑनलाइन",
      customerPaidHelper: "ग्राहक ने जो दिया वह दर्ज करें",
      saveAnyway: "फिर भी सेव करें",
    },
    history: {
      title: "राइड इतिहास",
      search: "राइड खोजें...",
      filter: "फ़िल्टर",
      noRides: "कोई राइड नहीं मिली",
      editRide: "राइड संपादित करें",
      deleteRide: "राइड हटाएं",
      confirmDelete: "क्या आप इस राइड को हटाना चाहते हैं?",
      platform: "प्लेटफ़ॉर्म",
      allPlatforms: "सभी प्लेटफ़ॉर्म",
      from: "से",
      to: "तक",
      minFare: "न्यूनतम किराया",
      maxFare: "अधिकतम किराया",
      ridesCount: "सवारी",
      total: "कुल:",
      fare: "किराया:",
      comm: "कमीशन:",
      tips: "टिप्स: ₹",
      deleteTitle: "सवारी हटाएं?",
      deleteDesc: "क्या आप इस सवारी को हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।",
      runKM: "रन किमी",
      blankKM: "ब्लैंक किमी",
      rides: "सवारी",
      rideKM: "सवारी किमी",
      noRidesRecorded: "कोई सवारी दर्ज नहीं",
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
      income: "आमदनी",
      fuelCost: "ईंधन खर्च",
      runKM: "रन किमी",
      blankKM: "ब्लैंक किमी",
      netProfit: "शुद्ध लाभ",
      profitPerRide: "प्रति सवारी लाभ",
      profitPerKM: "प्रति किमी लाभ",
      bestPlatform: "सर्वश्रेष्ठ प्लेटफ़ॉर्म",
      bestArea: "सर्वश्रेष्ठ क्षेत्र",
      exportPeriod: "निर्यात अवधि:",
      export: "निर्यात",
      downloadAgain: "फिर से डाउनलोड करें",
      share: "शेयर करें",
      newExport: "नया निर्यात",
      preparing: "रिपोर्ट तैयार हो रही है...",
      downloadComplete: "✓ डाउनलोड पूर्ण",
      runKMHistory: "रन किमी इतिहास",
      fuelHistory: "ईंधन इतिहास",
      addMoreRides: "स्मार्ट अंतर्दृष्टि के लिए अधिक सवारी जोड़ें।",
      avgPerRide: "औसत",
      rides: "सवारी",
      today: "आज",
      daily: "दैनिक",
      todayReport: "आज की रिपोर्ट",
      dailyReport: "दैनिक रिपोर्ट",
      insightsTitle: "विस्तृत विश्लेषण",
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
      fuelType: "डिफ़ॉल्ट ईंधन प्रकार",
      language: "भाषा",
      currency: "मुद्रा",
      save: "सेव करें",
      commissionType: "कमीशन प्रकार",
      commissionValue: "कमीशन मूल्य",
      appPreferences: "ऐप प्राथमिकताएं",
      appTheme: "ऐप थीम",
      appSound: "ऐप साउंड",
      notifications: "इन-ऐप सूचनाएं",
      notificationsDesc: "कम कमाई, ईंधन, खाली KM अलर्ट",
      about: "परिचय",
      noCommission: "कोई कमीशन नहीं",
      percentage: "प्रतिशत (%)",
      fixed: "निश्चित राशि (₹)",
      dailyFee: "दैनिक प्लेटफ़ॉर्म शुल्क (₹)",
      lightTheme: "☀️ हल्का",
      darkTheme: "🌙 गहरा",
      soundOn: "🔊 चालू",
      soundOff: "🔇 बंद",
      appVersion: "राइड ड्राइवरों के लिए स्मार्ट कमाई ट्रैकर",
    },
    fuel: {
      title: "ईंधन जोड़ें",
      date: "तारीख",
      odometer: "ओडोमीटर (km)",
      litres: "लीटर",
      cost: "लागत (₹)",
      save: "सेव करें",
      type: "ईंधन प्रकार",
      petrol: "पेट्रोल",
      diesel: "डीज़ल",
      cng: "सीएनजी",
      electric: "इलेक्ट्रिक",
      hybrid: "हाइब्रिड",
      selectType: "ईंधन प्रकार चुनें",
      toastError: "सभी फ़ील्ड सही से भरें",
      toastSuccess: "ईंधन एंट्री सहेजी गई!",
      electricNote: "इलेक्ट्रिक वाहनों को ईंधन खर्च की जरूरत नहीं",
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
      save: "सेव",
      saving: "सेव हो रहा है...",
      exitConfirmTitle: "ऐप बंद करें?",
      exitConfirmMsg: "क्या आप सच में Biju's RideBook बंद करना चाहते हैं?",
    },
    shift: {
      control: "शिफ्ट नियंत्रण",
      shiftDate: "शिफ्ट तारीख",
      startShift: "▶ शिफ्ट शुरू करें",
      endShift: "■ शिफ्ट समाप्त करें",
      activeSince: "⚡ शिफ्ट चालू",
      markOffDay: "🛌 छुट्टी का दिन",
      unmarkOffDay: "छुट्टी हटाएं",
      markPersonalRun: "🚗 व्यक्तिगत रन",
      clearPersonalRun: "व्यक्तिगत रन हटाएं",
      personalRun: "व्यक्तिगत रन",
      offDay: "छुट्टी का दिन",
      viewSummary: "आज की समरी देखें",
      stillActive: "शिफ्ट अभी चालू है — अंतिम मुनाफा देखने के लिए शिफ्ट समाप्त करें",
      startKmLabel: "शुरू KM",
      endKmLabel: "अंत KM",
      enterStartKm: "शुरू KM दर्ज करें",
      enterEndKm: "अंत KM दर्ज करें",
      confirmDeleteShift: "क्या आप इस शिफ्ट को हटाना चाहते हैं?",
      shiftUpdated: "शिफ्ट अपडेट हो गई",
      shiftStarted: "शिफ्ट शुरू हो गई!",
      profitAnalyzer: "मुनाफा विश्लेषक",
      todayProfit: "आज का मुनाफा",
      bestPlatform: "सबसे अच्छा प्लेटफॉर्म",
      bestArea: "सबसे अच्छा क्षेत्र",
      thisWeek: "इस सप्ताह",
      allTimeTotals: "सर्वकालीन कुल",
      driverComparison: "ड्राइवर तुलना",
      cityAvgSoon: "शहर का औसत डेटा जल्द आएगा।",
      weekRides: "राइड",
      weekProfit: "मुनाफा",
      bestDay: "सबसे अच्छा दिन",
      shiftActive: "शिफ्ट सक्रिय",
      shiftKm: "शिफ्ट KM",
    },
    shift_summary: {
      title: "आज का सारांश",
      totalRides: "कुल सवारी",
      rideKM: "सवारी किमी",
      runKM: "रन किमी",
      deadKM: "डेड किमी",
      totalIncome: "कुल आमदनी",
      fuelCost: "ईंधन खर्च",
      tips: "टिप्स",
      netProfit: "शुद्ध लाभ",
      close: "बंद करें",
    },
    quickRide: {
      title: "त्वरित सवारी",
      platform: "प्लेटफ़ॉर्म",
      fare: "किराया (₹)",
      rideKM: "सवारी किमी",
      paymentType: "भुगतान प्रकार",
      cashUPI: "नकद / यूपीआई",
      appOnline: "ऐप ऑनलाइन",
      tipOptional: "टिप (वैकल्पिक)",
      areaOptional: "क्षेत्र (वैकल्पिक)",
      netIncome: "शुद्ध आमदनी",
      cancel: "रद्द करें",
      saveRide: "सवारी सहेजें",
      toastError: "सभी आवश्यक फ़ील्ड भरें",
      toastSuccess: "सवारी सहेजी गई!",
      commission: "कमीशन",
    },
    greeting: {
      morning: "शुभ प्रभात",
      afternoon: "शुभ दोपहर",
      evening: "शुभ संध्या",
      night: "शुभ रात्रि",
      hello: "नमस्ते",
    },
    profile: {
      title: "ड्राइवर प्रोफाइल",
      edit: "संपादित",
      editProfile: "प्रोफाइल संपादित करें",
      saveChanges: "बदलाव सेव करें",
      name: "नाम",
      vehicleType: "वाहन प्रकार",
      city: "शहर",
      dailyTarget: "दैनिक लक्ष्य (₹)",
      yourStats: "आपके आंकड़े",
      totalRides: "कुल राइड",
      totalKmDriven: "कुल KM चलाया",
      bestDayEarnings: "सबसे अच्छे दिन की कमाई",
      dayStreak: "दिन की लकीर",
      achievement: "उपलब्धि",
      drivingSince: "कब से चला रहे हैं (वर्ष)",
      drivingSincePlaceholder: "जैसे: 2020",
      todayMotivation: "आज की प्रेरणा",
      changePhoto: "प्रोफाइल फोटो बदलें",
      takePhoto: "📷 फोटो लें (कैमरा)",
      chooseGallery: "🖼️ गैलरी से चुनें",
      notSet: "सेट नहीं है",
      newDriver: "🚗 नया ड्राइवर",
    },
    motivations: [
      "हर किलोमीटर आपको आपके लक्ष्य के करीब ले जाता है। चलते रहिए!",
      "आज की निरंतरता कल की सफलता बनाती है।",
      "सड़क पर मेहनत रंग लाती है। आप बहुत अच्छा कर रहे हैं!",
      "हर राइड एक कदम आगे है। ध्यान केंद्रित रखें!",
      "सर्वश्रेष्ठ ड्राइवर पैदा नहीं होते — वे राइड दर राइड बनते हैं।",
      "आपकी लगन दूसरों को प्रेरित करती है। चलते रहो!",
      "हर दिन की छोटी प्रगति बड़े नतीजों में जुड़ती है।",
      "आपकी मेहनत पर गर्व है। आज भी एक जीत का दिन है!",
      "सुरक्षित रहें, ध्यान रखें, और आज अच्छी कमाई करें!",
      "आर्थिक स्वतंत्रता का रास्ता एक राइड से शुरू होता है।",
    ],
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.en;
}

export default translations;
