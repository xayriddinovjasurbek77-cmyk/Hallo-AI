export type Language = 'uz' | 'en' | 'ru';

export const SUPPORTED_LANGUAGES: readonly Language[] = ['uz', 'en', 'ru'] as const;

export const LANGUAGE_META: Record<Language, { code: string; nativeName: string; htmlLang: string }> = {
  uz: { code: 'UZ', nativeName: 'O‘zbekcha', htmlLang: 'uz' },
  en: { code: 'EN', nativeName: 'English', htmlLang: 'en' },
  ru: { code: 'RU', nativeName: 'Русский', htmlLang: 'ru' },
};

export interface TranslationSchema {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    assistant: string;
    writer: string;
    translator: string;
    calculator: string;
    planner: string;
    languageLabel: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    imageAlt: string;
    imageCaption: string;
    highlights: {
      instantTitle: string;
      instantDesc: string;
      multilingualTitle: string;
      multilingualDesc: string;
      practicalTitle: string;
      practicalDesc: string;
    };
  };
  workspace: {
    sectionTitle: string;
    sectionSubtitle: string;
    tabs: {
      assistant: string;
      writer: string;
      translator: string;
      calculator: string;
      planner: string;
    };
  };
  assistant: {
    title: string;
    subtitle: string;
    inputLabel: string;
    placeholder: string;
    send: string;
    sending: string;
    clear: string;
    copy: string;
    copied: string;
    retry: string;
    emptyTitle: string;
    emptySubtitle: string;
    typingLabel: string;
    userLabel: string;
    assistantLabel: string;
    suggestions: [string, string, string, string];
    validationEmpty: string;
  };
  writer: {
    title: string;
    subtitle: string;
    modeLabel: string;
    modes: {
      formal_letter: string;
      application: string;
      announcement: string;
      rewrite: string;
    };
    toneLabel: string;
    tones: {
      formal: string;
      polite: string;
      concise: string;
    };
    recipientLabel: string;
    recipientPlaceholder: string;
    topicLabel: string;
    topicPlaceholder: string;
    rewritePlaceholder: string;
    generate: string;
    generating: string;
    clear: string;
    copy: string;
    copied: string;
    resultTitle: string;
    notesLabel: string;
    emptyResult: string;
    validationEmpty: string;
    sampleTopics: {
      formal_letter: string;
      application: string;
      announcement: string;
      rewrite: string;
    };
    loadExample: string;
  };
  translator: {
    title: string;
    subtitle: string;
    sourceLabel: string;
    targetLabel: string;
    autoDetect: string;
    swapLanguages: string;
    languages: {
      uz: string;
      en: string;
      ru: string;
    };
    inputLabel: string;
    inputPlaceholder: string;
    translate: string;
    translating: string;
    clear: string;
    copy: string;
    copied: string;
    detectedPrefix: string;
    resultLabel: string;
    nuanceLabel: string;
    emptyResult: string;
    charCount: string;
    validationEmpty: string;
    validationSameLang: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    modes: {
      percentage: string;
      discount: string;
      expenses: string;
      math: string;
    };
    percentage: {
      typeLabel: string;
      types: {
        percent_of: string;
        what_percent: string;
        percent_change: string;
      };
      labelA: string;
      labelB: string;
      labelA_what: string;
      labelB_what: string;
      labelA_change: string;
      labelB_change: string;
      resultLabel: string;
      formulaLabel: string;
    };
    discount: {
      priceLabel: string;
      discountLabel: string;
      taxLabel: string;
      finalPriceLabel: string;
      savedLabel: string;
      afterDiscountLabel: string;
      taxAmountLabel: string;
    };
    expenses: {
      itemNameLabel: string;
      itemNamePlaceholder: string;
      amountLabel: string;
      amountPlaceholder: string;
      addItem: string;
      splitLabel: string;
      totalLabel: string;
      perPersonLabel: string;
      averageLabel: string;
      countLabel: string;
      emptyList: string;
      clearAll: string;
      removeItem: string;
      validationItem: string;
    };
    math: {
      expressionLabel: string;
      expressionPlaceholder: string;
      evaluate: string;
      clear: string;
      resultLabel: string;
      historyLabel: string;
      emptyHistory: string;
    };
    errors: {
      INVALID_NUMBER: string;
      DIVISION_BY_ZERO: string;
      NEGATIVE_VALUE: string;
      INVALID_PERCENT: string;
      INVALID_SPLIT_COUNT: string;
      EMPTY_EXPRESSION: string;
      INVALID_CHARACTER: string;
      SYNTAX_ERROR: string;
    };
  };
  planner: {
    title: string;
    subtitle: string;
    categories: {
      daily_plan: string;
      tasks: string;
      shopping_list: string;
      schedule: string;
    };
    filters: {
      all: string;
      active: string;
      completed: string;
    };
    aiSectionTitle: string;
    aiPromptPlaceholder: string;
    aiGenerate: string;
    aiGenerating: string;
    manualSectionTitle: string;
    itemTitleLabel: string;
    itemTitlePlaceholder: string;
    itemMetaLabel: string;
    itemMetaPlaceholder: string;
    addItem: string;
    statsCompleted: string;
    statsRemaining: string;
    clearCompleted: string;
    emptyTitle: string;
    emptySubtitle: string;
    toggleDone: string;
    deleteItem: string;
    validationEmpty: string;
    validationAiEmpty: string;
  };
  guide: {
    sectionTitle: string;
    sectionSubtitle: string;
    steps: [
      { number: string; title: string; description: string },
      { number: string; title: string; description: string },
      { number: string; title: string; description: string }
    ];
    faqTitle: string;
    faqs: [
      { question: string; answer: string },
      { question: string; answer: string },
      { question: string; answer: string },
      { question: string; answer: string }
    ];
  };
  footer: {
    tagline: string;
    noAccountNotice: string;
    copyright: string;
  };
  errors: {
    network: string;
    server: string;
    serviceUnavailable: string;
    timeout: string;
    rateLimit: string;
    apiKey: string;
    unknown: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  uz: {
    meta: {
      title: 'HALLO — Kundalik AI Yordamchi',
      description: 'Kundalik savollar, rasmiy xatlar, tarjima, hisob-kitob va rejalashtirish uchun yagona klassik platforma.',
    },
    nav: {
      assistant: 'Yordamchi',
      writer: 'Matn yozuvchi',
      translator: 'Tarjimon',
      calculator: 'Hisoblagich',
      planner: 'Rejalashtiruvchi',
      languageLabel: 'Tilni tanlash',
      openMenu: 'Menyuni ochish',
      closeMenu: 'Menyuni yopish',
    },
    hero: {
      kicker: 'Kundalik yechimlar · Ro‘yxatdan o‘tishsiz · Uch tilda',
      headline: 'Kundalik ishlaringiz uchun sokin va aniq AI yordamchi.',
      subtitle:
        'Murakkab savollarga sodda javob oling, rasmiy xat va arizalar yozing, uch til o‘rtasida tabiiy tarjima qiling, xarajatlarni hisoblang hamda kuningizni tartibga soling.',
      primaryCta: 'Ishni boshlash',
      secondaryCta: 'Imkoniyatlar bilan tanishish',
      imageAlt: 'Issiq tabiiy yorug‘lik tushib turgan minimalist stol ustida ochiq daftar, ruchka va zaytun novdasi solingan sopol idish',
      imageCaption: 'Ortiqcha murakkabliksiz, har kuni kerak bo‘ladigan besh asosiy vosita bir joyda.',
      highlights: {
        instantTitle: 'Darhol foydalanish',
        instantDesc: 'Kirish, parol va profil yaratish talab etilmaydi.',
        multilingualTitle: 'Uch tilda uyg‘un',
        multilingualDesc: 'O‘zbek, ingliz va rus tillarida bir xil aniqlik.',
        practicalTitle: 'Amaliy natijalar',
        practicalDesc: 'Haqiqiy hisob-kitoblar va tayyor matnlar.',
      },
    },
    workspace: {
      sectionTitle: 'Ish maydoni',
      sectionSubtitle: 'Kerakli vositani tanlang va darhol natija oling.',
      tabs: {
        assistant: 'AI Yordamchi',
        writer: 'Matn yozuvchi',
        translator: 'AI Tarjimon',
        calculator: 'Hisoblagich',
        planner: 'Rejalashtiruvchi',
      },
    },
    assistant: {
      title: 'Kundalik AI Yordamchi',
      subtitle: 'Savollaringizni yozing, murakkab mavzularni sodda tilda tushunib oling va foydali tavsiyalar oling.',
      inputLabel: 'Savol yoki vazifangiz',
      placeholder: 'Masalan: Oilaviy byudjetni qanday oqilona taqsimlash mumkin?',
      send: 'Yuborish',
      sending: 'Javob tayyorlanmoqda...',
      clear: 'Suhbatni tozalash',
      copy: 'Nusxalash',
      copied: 'Nusxalandi',
      retry: 'Qayta urinish',
      emptyTitle: 'Nimada yordam berishim mumkin?',
      emptySubtitle: 'Quyidagi namunalardan birini tanlang yoki o‘z savolingizni yozing.',
      typingLabel: 'HALLO javob yozmoqda',
      userLabel: 'Siz',
      assistantLabel: 'HALLO',
      suggestions: [
        'Inflyatsiya nima va u kundalik xaridlarimizga qanday ta’sir qiladi? Sodda tushuntiring.',
        'Bir haftalik sog‘lom va tejamkor tushlik g‘oyalarini tavsiya qiling.',
        'Ish suhbatiga tayyorlanish uchun 5 ta eng muhim maslahat bering.',
        'Uyqu sifatini yaxshilash uchun kechki sokin odatlar rejasini tuzing.',
      ],
      validationEmpty: 'Iltimos, avval savol yoki xabar matnini kiriting.',
    },
    writer: {
      title: 'Aqlli Matn Yozuvchi',
      subtitle: 'Rasmiy xatlar, ariza va so‘rovnomalar, e’lonlar yarating yoki mavjud matnni chiroyli tahrirlang.',
      modeLabel: 'Matn turi',
      modes: {
        formal_letter: 'Rasmiy xat',
        application: 'Ariza va so‘rov',
        announcement: 'E’lon va xabar',
        rewrite: 'Qayta yozish va yaxshilash',
      },
      toneLabel: 'Uslub',
      tones: {
        formal: 'Rasmiy',
        polite: 'Muloyim',
        concise: 'Qisqa va lo‘nda',
      },
      recipientLabel: 'Kimga (ixtiyoriy)',
      recipientPlaceholder: 'Masalan: Korxona rahbariga yoki mijozlarga',
      topicLabel: 'Asosiy mazmun yoki tayyor matn',
      topicPlaceholder: 'Nimani yozish kerakligini qisqacha bayon qiling (sana, sabab, asosiy ma’lumotlar)...',
      rewritePlaceholder: 'Yaxshilash va ravonlashtirish kerak bo‘lgan matningizni shu yerga qo‘ying...',
      generate: 'Matn yaratish',
      generating: 'Matn tuzilmoqda...',
      clear: 'Tozalash',
      copy: 'Matnni nusxalash',
      copied: 'Nusxalandi',
      resultTitle: 'Tayyor matn',
      notesLabel: 'Muharrir izohi',
      emptyResult: 'Yaratilgan yoki tahrirlangan matn shu yerda ko‘rinadi.',
      validationEmpty: 'Iltimos, matn mavzusini yoki tahrirlanadigan matnni kiriting.',
      sampleTopics: {
        formal_letter: 'Hamkor tashkilotga loyiha muddatini bir haftaga uzaytirish bo‘yicha asosli taklif xati.',
        application: 'Oilaviy sharoit sababli 3 kunlik haq to‘lanadigan ta’til so‘rab yoziladigan ariza.',
        announcement: 'Jamoa a’zolari uchun juma kuni soat 15:00 da bo‘lib o‘tadigan umumiy yig‘ilish haqida e’lon.',
        rewrite: 'Salom, ertaga uchrashuvni soat 2 ga ko‘chirsak bo‘ladimi, chunki boshqa ishim chiqib qoldi.',
      },
      loadExample: 'Namuna yuklash',
    },
    translator: {
      title: 'AI Tarjimon',
      subtitle: 'O‘zbek, ingliz va rus tillari o‘rtasida tilni avtomatik aniqlagan holda tabiiy va aniq tarjima.',
      sourceLabel: 'Manba tili',
      targetLabel: 'Tarjima tili',
      autoDetect: 'Avtomatik aniqlash',
      swapLanguages: 'Tillarni almashtirish',
      languages: {
        uz: 'O‘zbekcha',
        en: 'Inglizcha',
        ru: 'Ruscha',
      },
      inputLabel: 'Asl matn',
      inputPlaceholder: 'Tarjima qilish uchun matnni kiriting...',
      translate: 'Tarjima qilish',
      translating: 'Tarjima qilinmoqda...',
      clear: 'Tozalash',
      copy: 'Tarjimani nusxalash',
      copied: 'Nusxalandi',
      detectedPrefix: 'Aniqlangan til:',
      resultLabel: 'Tarjima natijasi',
      nuanceLabel: 'Til izohi',
      emptyResult: 'Tarjima natijasi shu yerda paydo bo‘ladi.',
      charCount: 'belgi',
      validationEmpty: 'Iltimos, tarjima qilish uchun matn kiriting.',
      validationSameLang: 'Manba va tarjima tili bir xil bo‘lmasligi kerak.',
    },
    calculator: {
      title: 'Aqlli Hisoblagich',
      subtitle: 'Foizlar, chegirmalar, kundalik xarajatlar va matematik ifodalarni aniq hisoblang.',
      modes: {
        percentage: 'Foizlar',
        discount: 'Chegirma',
        expenses: 'Xarajatlar',
        math: 'Oddiy hisob',
      },
      percentage: {
        typeLabel: 'Hisob turi',
        types: {
          percent_of: 'Sonning foizi',
          what_percent: 'Necha foizni tashkil etadi',
          percent_change: 'Foiz o‘zgarishi',
        },
        labelA: 'Foiz (%)',
        labelB: 'Asosiy son',
        labelA_what: 'Qism qiymati',
        labelB_what: 'Umumiy qiymat',
        labelA_change: 'Avvalgi qiymat',
        labelB_change: 'Yangi qiymat',
        resultLabel: 'Natija',
        formulaLabel: 'Hisoblash tartibi',
      },
      discount: {
        priceLabel: 'Asl narx',
        discountLabel: 'Chegirma (%)',
        taxLabel: 'Qo‘shimcha soliq / QQS (%)',
        finalPriceLabel: 'Yakuniy narx',
        savedLabel: 'Tejalgan summa',
        afterDiscountLabel: 'Chegirmadan keyingi narx',
        taxAmountLabel: 'Soliq summasi',
      },
      expenses: {
        itemNameLabel: 'Xarajat nomi',
        itemNamePlaceholder: 'Masalan: Bozorlik yoki transport',
        amountLabel: 'Summa',
        amountPlaceholder: '0',
        addItem: 'Qo‘shish',
        splitLabel: 'Necha kishiga bo‘linsin',
        totalLabel: 'Jami xarajat',
        perPersonLabel: 'Kishi boshiga',
        averageLabel: 'O‘rtacha xarajat',
        countLabel: 'Yozuvlar soni',
        emptyList: 'Hozircha xarajatlar kiritilmagan.',
        clearAll: 'Ro‘yxatni tozalash',
        removeItem: 'O‘chirish',
        validationItem: 'Xarajat nomi va musbat summani kiriting.',
      },
      math: {
        expressionLabel: 'Matematik ifoda',
        expressionPlaceholder: 'Masalan: (125 + 75) * 3',
        evaluate: 'Hisoblash',
        clear: 'Tozalash',
        resultLabel: 'Natija',
        historyLabel: 'Oxirgi hisoblar',
        emptyHistory: 'Hisoblar tarixi shu yerda saqlanadi.',
      },
      errors: {
        INVALID_NUMBER: 'Iltimos, to‘g‘ri raqamlarni kiriting.',
        DIVISION_BY_ZERO: 'Nolga bo‘lish mumkin emas.',
        NEGATIVE_VALUE: 'Qiymat manfiy bo‘lmasligi kerak.',
        INVALID_PERCENT: 'Foiz 0 dan 100 gacha bo‘lishi kerak.',
        INVALID_SPLIT_COUNT: 'Bo‘luvchilar soni kamida 1 ta butun son bo‘lishi kerak.',
        EMPTY_EXPRESSION: 'Hisoblash uchun ifoda kiriting.',
        INVALID_CHARACTER: 'Faqat raqamlar, qavslar va +, -, *, /, % belgilaridan foydalaning.',
        SYNTAX_ERROR: 'Matematik ifoda noto‘g‘ri yozilgan.',
      },
    },
    planner: {
      title: 'Aqlli Rejalashtiruvchi',
      subtitle: 'Kunlik rejalar, vazifalar, xarid ro‘yxatlari va oddiy jadvalni bir joyda boshqaring.',
      categories: {
        daily_plan: 'Kunlik reja',
        tasks: 'Vazifalar',
        shopping_list: 'Xarid ro‘yxati',
        schedule: 'Jadval',
      },
      filters: {
        all: 'Barchasi',
        active: 'Bajarilmagan',
        completed: 'Bajarilgan',
      },
      aiSectionTitle: 'AI bilan tezkor reja tuzish',
      aiPromptPlaceholder: 'Masalan: Ertaga soat 08:00 dan 18:00 gacha samarali ish kuni rejasi yoki hafta oxiri bozorlik ro‘yxati...',
      aiGenerate: 'Reja tuzish',
      aiGenerating: 'Tuzilmoqda...',
      manualSectionTitle: 'Yangi band qo‘shish',
      itemTitleLabel: 'Vazifa yoki mahsulot nomi',
      itemTitlePlaceholder: 'Masalan: Hujjatlarni topshirish yoki zaytun moyi',
      itemMetaLabel: 'Vaqt, miqdor yoki izoh',
      itemMetaPlaceholder: 'Masalan: 10:30 yoki 2 dona',
      addItem: 'Qo‘shish',
      statsCompleted: 'Bajarildi',
      statsRemaining: 'Qoldi',
      clearCompleted: 'Bajarilganlarni o‘chirish',
      emptyTitle: 'Bu bo‘lim hozircha bo‘sh',
      emptySubtitle: 'Yuqoridan qo‘lda yangi band qo‘shing yoki AI yordamida tayyor ro‘yxat yarating.',
      toggleDone: 'Holatni o‘zgartirish',
      deleteItem: 'O‘chirish',
      validationEmpty: 'Iltimos, band nomini kiriting.',
      validationAiEmpty: 'Iltimos, reja uchun maqsad yoki mavzu yozing.',
    },
    guide: {
      sectionTitle: 'Tartibli kundalik jarayon',
      sectionSubtitle: 'HALLO ortiqcha shovqinsiz, har kuni duch keladigan vazifalarni uch oddiy bosqichda yengillashtiradi.',
      steps: [
        {
          number: '01.',
          title: 'Savol bering va tushuning',
          description: 'Murakkab mavzularni ona tilingizda sodda izoh bilan o‘qing va kerakli tavsiyalarni darhol oling.',
        },
        {
          number: '02.',
          title: 'Yozing va tarjima qiling',
          description: 'Rasmiy xatlar, arizalar va e’lonlarni tayyorlang hamda uch til o‘rtasida tabiiy tarjimadan foydalaning.',
        },
        {
          number: '03.',
          title: 'Hisoblang va rejalashtiring',
          description: 'Chegirma va xarajatlarni aniq hisoblab, kunlik jadval va xarid ro‘yxatlaringizni tartibga soling.',
        },
      ],
      faqTitle: 'Ko‘p beriladigan savollar',
      faqs: [
        {
          question: 'HALLO dan foydalanish uchun ro‘yxatdan o‘tish kerakmi?',
          answer: 'Yo‘q. Saytni ochganingiz zahoti barcha besh vositadan hech qanday akkaunt, parol yoki shaxsiy ma’lumot kiritmasdan foydalanishingiz mumkin.',
        },
        {
          question: 'Tanlagan tilim sahifani yangilaganimdan keyin saqlanadimi?',
          answer: 'Ha. O‘zbek, ingliz yoki rus tillaridan birini tanlasangiz, u brauzeringizda saqlanadi va AI javoblari ham shu tilda shakllantiriladi.',
        },
        {
          question: 'Rejalashtiruvchidagi ro‘yxatlarim qayerga saqlanadi?',
          answer: 'Sizning vazifa va xarid ro‘yxatlaringiz faqat o‘zingizning qurilmangizdagi mahalliy xotirada saqlanadi, tashqi serverga bog‘lanmaydi.',
        },
        {
          question: 'Tarjimon tilni o‘zi aniqlay oladimi?',
          answer: 'Ha. «Avtomatik aniqlash» rejimi matn o‘zbek, ingliz yoki rus tilida ekanini aniqlab, tanlangan tilga tabiiy o‘giradi.',
        },
      ],
    },
    footer: {
      tagline: 'Kundalik vazifalar uchun sokin va ishonchli AI yordamchi.',
      noAccountNotice: 'Ro‘yxatdan o‘tish talab etilmaydi',
      copyright: '© 2026 HALLO. Barcha huquqlar himoyalangan.',
    },
    errors: {
      network: 'Tarmoq bilan bog‘lanishda xatolik yuz berdi. Internet aloqasini tekshiring.',
      server: 'Server javob berishda muammoga uchradi. Birozdan so‘ng qayta urinib ko‘ring.',
      serviceUnavailable: 'AI xizmati hozir band. Bir necha soniyadan so‘ng qayta urinib ko‘ring.',
      timeout: 'So‘rovga javob kutish vaqti tugadi. Iltimos, qayta urinib ko‘ring.',
      rateLimit: 'So‘rovlar soni vaqtinchalik cheklandi. Bir necha soniyadan so‘ng urinib ko‘ring.',
      apiKey: 'AI xizmati hozircha sozlanmagan. Iltimos, sozlamalarni tekshiring.',
      unknown: 'Kutilmagan xatolik yuz berdi.',
    },
  },
  en: {
    meta: {
      title: 'HALLO — Everyday AI Assistant',
      description: 'A calm, classic multilingual platform for everyday questions, formal writing, translation, calculations, and planning.',
    },
    nav: {
      assistant: 'Assistant',
      writer: 'Text Writer',
      translator: 'Translator',
      calculator: 'Calculator',
      planner: 'Planner',
      languageLabel: 'Select language',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
    },
    hero: {
      kicker: 'Everyday clarity · No account needed · Three languages',
      headline: 'A calm, precise AI assistant for everyday life.',
      subtitle:
        'Get clear answers to daily questions, draft formal letters and requests, translate naturally across three languages, calculate expenses, and organize your day.',
      primaryCta: 'Start Working',
      secondaryCta: 'Explore Capabilities',
      imageAlt: 'Minimalist limestone study desk with an open linen journal, brass fountain pen, and ceramic vessel holding an olive branch in warm morning light',
      imageCaption: 'Five essential everyday instruments brought together in one quiet workspace.',
      highlights: {
        instantTitle: 'Immediate access',
        instantDesc: 'No sign-ups, passwords, or personal profiles required.',
        multilingualTitle: 'Three languages',
        multilingualDesc: 'Unified experience in Uzbek, English, and Russian.',
        practicalTitle: 'Real utility',
        practicalDesc: 'Accurate calculations, structured plans, and crisp drafts.',
      },
    },
    workspace: {
      sectionTitle: 'Workspace',
      sectionSubtitle: 'Choose the tool you need and get clear results right away.',
      tabs: {
        assistant: 'AI Assistant',
        writer: 'Text Writer',
        translator: 'AI Translator',
        calculator: 'Calculator',
        planner: 'Planner',
      },
    },
    assistant: {
      title: 'Everyday AI Assistant',
      subtitle: 'Ask practical questions, unpack complex topics in plain words, and receive thoughtful recommendations.',
      inputLabel: 'Your question or topic',
      placeholder: 'For example: How should I structure a monthly household budget?',
      send: 'Send',
      sending: 'Thinking...',
      clear: 'Clear conversation',
      copy: 'Copy',
      copied: 'Copied',
      retry: 'Try again',
      emptyTitle: 'How can I help today?',
      emptySubtitle: 'Pick a prompt below or write your own question in plain language.',
      typingLabel: 'HALLO is composing a reply',
      userLabel: 'You',
      assistantLabel: 'HALLO',
      suggestions: [
        'Explain how inflation affects everyday groceries in simple, practical terms.',
        'Suggest a balanced, budget-friendly weekly lunch plan for busy workdays.',
        'Give me 5 practical tips to prepare calmly for a job interview.',
        'Outline a gentle evening routine to improve sleep quality without screens.',
      ],
      validationEmpty: 'Please enter a question or message first.',
    },
    writer: {
      title: 'Smart Text Writer',
      subtitle: 'Compose formal letters, applications, and announcements, or refine an existing draft for clarity.',
      modeLabel: 'Document type',
      modes: {
        formal_letter: 'Formal Letter',
        application: 'Application & Request',
        announcement: 'Announcement & Note',
        rewrite: 'Rewrite & Improve',
      },
      toneLabel: 'Tone',
      tones: {
        formal: 'Formal',
        polite: 'Polite',
        concise: 'Concise',
      },
      recipientLabel: 'Recipient (optional)',
      recipientPlaceholder: 'e.g., Department Director or Project Clients',
      topicLabel: 'Key details or existing draft',
      topicPlaceholder: 'Describe what needs to be communicated (dates, purpose, key points)...',
      rewritePlaceholder: 'Paste the text you would like rewritten and refined here...',
      generate: 'Generate Text',
      generating: 'Drafting...',
      clear: 'Clear',
      copy: 'Copy text',
      copied: 'Copied',
      resultTitle: 'Draft Output',
      notesLabel: 'Editorial note',
      emptyResult: 'Your drafted or refined text will appear here.',
      validationEmpty: 'Please enter a brief description or the text you want to improve.',
      sampleTopics: {
        formal_letter: 'A polite request to a partner organization proposing a one-week extension on our project delivery date.',
        application: 'A formal application requesting three days of paid personal leave due to family matters.',
        announcement: 'An internal announcement inviting all team members to a Friday review meeting at 15:00.',
        rewrite: 'Hi, can we move tomorrow meeting to 2pm because something urgent came up for me.',
      },
      loadExample: 'Load example',
    },
    translator: {
      title: 'AI Translator',
      subtitle: 'Accurate, natural translation across Uzbek, English, and Russian with automatic language detection.',
      sourceLabel: 'Source language',
      targetLabel: 'Target language',
      autoDetect: 'Auto-detect',
      swapLanguages: 'Swap languages',
      languages: {
        uz: 'Uzbek',
        en: 'English',
        ru: 'Russian',
      },
      inputLabel: 'Source text',
      inputPlaceholder: 'Enter or paste text to translate...',
      translate: 'Translate',
      translating: 'Translating...',
      clear: 'Clear',
      copy: 'Copy translation',
      copied: 'Copied',
      detectedPrefix: 'Detected:',
      resultLabel: 'Translation',
      nuanceLabel: 'Usage note',
      emptyResult: 'Your translation will appear here.',
      charCount: 'chars',
      validationEmpty: 'Please enter text to translate.',
      validationSameLang: 'Source and target languages must be different.',
    },
    calculator: {
      title: 'Smart Calculator',
      subtitle: 'Compute percentages, discounts, shared expenses, and everyday arithmetic with precision.',
      modes: {
        percentage: 'Percentage',
        discount: 'Discount',
        expenses: 'Expenses',
        math: 'Everyday Math',
      },
      percentage: {
        typeLabel: 'Calculation mode',
        types: {
          percent_of: 'Percentage of a number',
          what_percent: 'What percentage is X of Y',
          percent_change: 'Percentage change',
        },
        labelA: 'Percentage (%)',
        labelB: 'Base number',
        labelA_what: 'Part value',
        labelB_what: 'Whole value',
        labelA_change: 'Initial value',
        labelB_change: 'New value',
        resultLabel: 'Result',
        formulaLabel: 'Formula breakdown',
      },
      discount: {
        priceLabel: 'Original price',
        discountLabel: 'Discount (%)',
        taxLabel: 'Tax / VAT (%)',
        finalPriceLabel: 'Final price',
        savedLabel: 'You save',
        afterDiscountLabel: 'After discount',
        taxAmountLabel: 'Tax amount',
      },
      expenses: {
        itemNameLabel: 'Expense item',
        itemNamePlaceholder: 'e.g., Groceries or commute',
        amountLabel: 'Amount',
        amountPlaceholder: '0',
        addItem: 'Add expense',
        splitLabel: 'Split between people',
        totalLabel: 'Total expenses',
        perPersonLabel: 'Per person',
        averageLabel: 'Average entry',
        countLabel: 'Items',
        emptyList: 'No expenses logged yet.',
        clearAll: 'Clear all',
        removeItem: 'Remove',
        validationItem: 'Enter an expense name and a valid positive amount.',
      },
      math: {
        expressionLabel: 'Expression',
        expressionPlaceholder: 'e.g., (125 + 75) * 3',
        evaluate: 'Calculate',
        clear: 'Clear',
        resultLabel: 'Result',
        historyLabel: 'Recent calculations',
        emptyHistory: 'Your calculation history will appear here.',
      },
      errors: {
        INVALID_NUMBER: 'Please enter valid numbers.',
        DIVISION_BY_ZERO: 'Division by zero is not allowed.',
        NEGATIVE_VALUE: 'Values cannot be negative.',
        INVALID_PERCENT: 'Percentages must be between 0 and 100.',
        INVALID_SPLIT_COUNT: 'Split count must be a whole number of at least 1.',
        EMPTY_EXPRESSION: 'Enter an expression to calculate.',
        INVALID_CHARACTER: 'Use only numbers, parentheses, and +, -, *, /, %.',
        SYNTAX_ERROR: 'The mathematical expression is incomplete or invalid.',
      },
    },
    planner: {
      title: 'Smart Planner',
      subtitle: 'Organize daily plans, tasks, shopping lists, and simple schedules in one calm workspace.',
      categories: {
        daily_plan: 'Daily Plan',
        tasks: 'Tasks',
        shopping_list: 'Shopping List',
        schedule: 'Schedule',
      },
      filters: {
        all: 'All',
        active: 'Active',
        completed: 'Completed',
      },
      aiSectionTitle: 'Generate a plan with AI',
      aiPromptPlaceholder: 'e.g., A focused workday schedule from 08:30 to 18:00 or a weekend Mediterranean grocery list...',
      aiGenerate: 'Build Plan',
      aiGenerating: 'Building...',
      manualSectionTitle: 'Add an entry manually',
      itemTitleLabel: 'Title or item',
      itemTitlePlaceholder: 'e.g., Submit quarterly report or Extra virgin olive oil',
      itemMetaLabel: 'Time, quantity, or note',
      itemMetaPlaceholder: 'e.g., 10:30 or 2 bottles',
      addItem: 'Add',
      statsCompleted: 'Completed',
      statsRemaining: 'Remaining',
      clearCompleted: 'Clear completed',
      emptyTitle: 'Nothing in this view yet',
      emptySubtitle: 'Add an item manually above or describe your goal for an AI-structured list.',
      toggleDone: 'Toggle completion',
      deleteItem: 'Delete',
      validationEmpty: 'Please enter an item title.',
      validationAiEmpty: 'Please describe the plan or list you want to generate.',
    },
    guide: {
      sectionTitle: 'Designed for quiet daily focus',
      sectionSubtitle: 'HALLO removes friction from everyday work across three straightforward steps.',
      steps: [
        {
          number: '01.',
          title: 'Ask and understand',
          description: 'Turn complicated topics into plain, actionable explanations in the language you work in best.',
        },
        {
          number: '02.',
          title: 'Draft and translate',
          description: 'Produce polished formal correspondence and translate smoothly between Uzbek, English, and Russian.',
        },
        {
          number: '03.',
          title: 'Calculate and plan',
          description: 'Verify discounts, split expenses fairly, and maintain daily schedules and shopping lists.',
        },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        {
          question: 'Do I need an account to use HALLO?',
          answer: 'No. Every tool is immediately open without registration, passwords, or personal profiles.',
        },
        {
          question: 'Is my language choice remembered after refreshing?',
          answer: 'Yes. Your selected interface language is saved locally and automatically guides AI responses and drafts.',
        },
        {
          question: 'Where are my planner lists stored?',
          answer: 'Your tasks, schedules, and shopping lists remain privately in your browser storage on your device.',
        },
        {
          question: 'Can the translator detect the source language automatically?',
          answer: 'Yes. Auto-detect identifies whether your input is Uzbek, English, or Russian before translating naturally.',
        },
      ],
    },
    footer: {
      tagline: 'A calm, reliable everyday AI assistant.',
      noAccountNotice: 'No registration required',
      copyright: '© 2026 HALLO. All rights reserved.',
    },
    errors: {
      network: 'Unable to reach the server. Please check your connection and try again.',
      server: 'The server encountered an issue processing your request. Please try again.',
      serviceUnavailable: 'The AI service is temporarily busy. Please try again in a few seconds.',
      timeout: 'The request took too long to respond. Please try again.',
      rateLimit: 'Too many requests at once. Please wait a moment and try again.',
      apiKey: 'AI service configuration is unavailable. Please check the environment setup.',
      unknown: 'An unexpected error occurred.',
    },
  },
  ru: {
    meta: {
      title: 'HALLO — Повседневный AI-помощник',
      description: 'Спокойная классическая платформа на трёх языках для повседневных вопросов, деловых писем, перевода, расчётов и планирования.',
    },
    nav: {
      assistant: 'Помощник',
      writer: 'Редактор',
      translator: 'Переводчик',
      calculator: 'Калькулятор',
      planner: 'Планировщик',
      languageLabel: 'Выбор языка',
      openMenu: 'Открыть меню',
      closeMenu: 'Закрыть меню',
    },
    hero: {
      kicker: 'Повседневная ясность · Без регистрации · Три языка',
      headline: 'Спокойный и точный AI-помощник для повседневных задач.',
      subtitle:
        'Получайте понятные ответы на сложные вопросы, составляйте деловые письма и заявления, переводите между тремя языками, ведите расчёты и планируйте свой день.',
      primaryCta: 'Начать работу',
      secondaryCta: 'Обзор возможностей',
      imageAlt: 'Минималистичный стол из известняка с открытым блокнотом в льняном переплёте, латунной перьевой ручкой и керамическим сосудом с веткой оливы в мягком утреннем свете',
      imageCaption: 'Пять необходимых повседневных инструментов в одном выверенном пространстве.',
      highlights: {
        instantTitle: 'Сразу к делу',
        instantDesc: 'Без входа, паролей и создания личных профилей.',
        multilingualTitle: 'Три языка',
        multilingualDesc: 'Полная поддержка узбекского, английского и русского.',
        practicalTitle: 'Реальная польза',
        practicalDesc: 'Точные вычисления, готовые тексты и ясные планы.',
      },
    },
    workspace: {
      sectionTitle: 'Рабочее пространство',
      sectionSubtitle: 'Выберите нужный инструмент и получите результат без лишних шагов.',
      tabs: {
        assistant: 'AI Помощник',
        writer: 'Редактор текстов',
        translator: 'AI Переводчик',
        calculator: 'Калькулятор',
        planner: 'Планировщик',
      },
    },
    assistant: {
      title: 'Повседневный AI-помощник',
      subtitle: 'Задавайте практические вопросы, разбирайте сложные темы простыми словами и получайте взвешенные советы.',
      inputLabel: 'Ваш вопрос или задача',
      placeholder: 'Например: Как грамотно распределить семейный бюджет на месяц?',
      send: 'Отправить',
      sending: 'Готовлю ответ...',
      clear: 'Очистить диалог',
      copy: 'Копировать',
      copied: 'Скопировано',
      retry: 'Повторить',
      emptyTitle: 'Чем я могу помочь сегодня?',
      emptySubtitle: 'Выберите один из примеров ниже или сформулируйте собственный вопрос.',
      typingLabel: 'HALLO печатает ответ',
      userLabel: 'Вы',
      assistantLabel: 'HALLO',
      suggestions: [
        'Объясните простыми словами, что такое инфляция и как она влияет на повседневные расходы.',
        'Предложите сбалансированное и экономное меню обедов на рабочую неделю.',
        'Дайте 5 практических советов, как спокойно подготовиться к собеседованию.',
        'Составьте мягкий вечерний распорядок для улучшения качества сна.',
      ],
      validationEmpty: 'Пожалуйста, сначала введите вопрос или сообщение.',
    },
    writer: {
      title: 'Умный редактор текстов',
      subtitle: 'Создавайте официальные письма, заявления и объявления или улучшайте готовый черновик.',
      modeLabel: 'Тип документа',
      modes: {
        formal_letter: 'Деловое письмо',
        application: 'Заявление и запрос',
        announcement: 'Объявление и заметка',
        rewrite: 'Переписать и улучшить',
      },
      toneLabel: 'Тон',
      tones: {
        formal: 'Официальный',
        polite: 'Вежливый',
        concise: 'Краткий',
      },
      recipientLabel: 'Кому (необязательно)',
      recipientPlaceholder: 'Например: Руководителю отдела или клиентам',
      topicLabel: 'Основная суть или исходный текст',
      topicPlaceholder: 'Опишите цель документа, даты, причины и ключевые детали...',
      rewritePlaceholder: 'Вставьте текст, который нужно переписать и сделать выразительнее...',
      generate: 'Создать текст',
      generating: 'Составляю текст...',
      clear: 'Очистить',
      copy: 'Копировать текст',
      copied: 'Скопировано',
      resultTitle: 'Готовый текст',
      notesLabel: 'Комментарий редактора',
      emptyResult: 'Созданный или отредактированный текст появится здесь.',
      validationEmpty: 'Пожалуйста, опишите тему или вставьте текст для редактирования.',
      sampleTopics: {
        formal_letter: 'Вежливое письмо партнёрской компании с предложением перенести срок сдачи проекта на одну неделю.',
        application: 'Официальное заявление на предоставление трёх дней оплачиваемого отпуска по семейным обстоятельствам.',
        announcement: 'Объявление для команды о встрече по итогам недели в пятницу в 15:00.',
        rewrite: 'Привет, давай перенесём завтрашнюю встречу на два часа дня, у меня появилось срочное дело.',
      },
      loadExample: 'Загрузить пример',
    },
    translator: {
      title: 'AI Переводчик',
      subtitle: 'Естественный и точный перевод между узбекским, английским и русским языками с автоопределением.',
      sourceLabel: 'Язык оригинала',
      targetLabel: 'Язык перевода',
      autoDetect: 'Определить автоматически',
      swapLanguages: 'Поменять языки',
      languages: {
        uz: 'Узбекский',
        en: 'Английский',
        ru: 'Русский',
      },
      inputLabel: 'Исходный текст',
      inputPlaceholder: 'Введите или вставьте текст для перевода...',
      translate: 'Перевести',
      translating: 'Перевожу...',
      clear: 'Очистить',
      copy: 'Копировать перевод',
      copied: 'Скопировано',
      detectedPrefix: 'Определён язык:',
      resultLabel: 'Результат перевода',
      nuanceLabel: 'Примечание',
      emptyResult: 'Перевод появится здесь.',
      charCount: 'симв.',
      validationEmpty: 'Пожалуйста, введите текст для перевода.',
      validationSameLang: 'Язык оригинала и язык перевода должны различаться.',
    },
    calculator: {
      title: 'Умный калькулятор',
      subtitle: 'Точный расчёт процентов, скидок, общих расходов и повседневных математических выражений.',
      modes: {
        percentage: 'Проценты',
        discount: 'Скидка',
        expenses: 'Расходы',
        math: 'Вычисления',
      },
      percentage: {
        typeLabel: 'Тип расчёта',
        types: {
          percent_of: 'Процент от числа',
          what_percent: 'Сколько процентов составляет',
          percent_change: 'Процентное изменение',
        },
        labelA: 'Процент (%)',
        labelB: 'Основное число',
        labelA_what: 'Часть',
        labelB_what: 'Целое значение',
        labelA_change: 'Исходное значение',
        labelB_change: 'Новое значение',
        resultLabel: 'Результат',
        formulaLabel: 'Порядок расчёта',
      },
      discount: {
        priceLabel: 'Исходная цена',
        discountLabel: 'Скидка (%)',
        taxLabel: 'Налог / НДС (%)',
        finalPriceLabel: 'Итоговая цена',
        savedLabel: 'Вы экономите',
        afterDiscountLabel: 'После скидки',
        taxAmountLabel: 'Сумма налога',
      },
      expenses: {
        itemNameLabel: 'Статья расхода',
        itemNamePlaceholder: 'Например: Продукты или дорога',
        amountLabel: 'Сумма',
        amountPlaceholder: '0',
        addItem: 'Добавить',
        splitLabel: 'Разделить на человек',
        totalLabel: 'Общая сумма',
        perPersonLabel: 'На человека',
        averageLabel: 'Средний расход',
        countLabel: 'Записей',
        emptyList: 'Список расходов пока пуст.',
        clearAll: 'Очистить всё',
        removeItem: 'Удалить',
        validationItem: 'Укажите название расхода и положительную сумму.',
      },
      math: {
        expressionLabel: 'Выражение',
        expressionPlaceholder: 'Например: (125 + 75) * 3',
        evaluate: 'Вычислить',
        clear: 'Очистить',
        resultLabel: 'Результат',
        historyLabel: 'Недавние расчёты',
        emptyHistory: 'История вычислений появится здесь.',
      },
      errors: {
        INVALID_NUMBER: 'Пожалуйста, введите корректные числа.',
        DIVISION_BY_ZERO: 'Деление на ноль невозможно.',
        NEGATIVE_VALUE: 'Значение не может быть отрицательным.',
        INVALID_PERCENT: 'Процент должен быть в диапазоне от 0 до 100.',
        INVALID_SPLIT_COUNT: 'Количество человек должно быть целым числом не меньше 1.',
        EMPTY_EXPRESSION: 'Введите выражение для расчёта.',
        INVALID_CHARACTER: 'Допустимы только цифры, скобки и знаки +, -, *, /, %.',
        SYNTAX_ERROR: 'Математическое выражение записано с ошибкой.',
      },
    },
    planner: {
      title: 'Умный планировщик',
      subtitle: 'Ведите планы на день, списки задач, покупок и простое расписание в одном месте.',
      categories: {
        daily_plan: 'План на день',
        tasks: 'Задачи',
        shopping_list: 'Список покупок',
        schedule: 'Расписание',
      },
      filters: {
        all: 'Все',
        active: 'Активные',
        completed: 'Выполненные',
      },
      aiSectionTitle: 'Составить план с помощью AI',
      aiPromptPlaceholder: 'Например: Продуктивный рабочий день с 08:30 до 18:00 или список покупок на выходные...',
      aiGenerate: 'Составить',
      aiGenerating: 'Составляю...',
      manualSectionTitle: 'Добавить запись вручную',
      itemTitleLabel: 'Название задачи или товара',
      itemTitlePlaceholder: 'Например: Отправить отчёт или оливковое масло',
      itemMetaLabel: 'Время, количество или заметка',
      itemMetaPlaceholder: 'Например: 10:30 или 2 шт.',
      addItem: 'Добавить',
      statsCompleted: 'Выполнено',
      statsRemaining: 'Осталось',
      clearCompleted: 'Удалить выполненные',
      emptyTitle: 'В этом разделе пока пусто',
      emptySubtitle: 'Добавьте пункт вручную выше или опишите цель, чтобы AI сформировал список.',
      toggleDone: 'Изменить статус',
      deleteItem: 'Удалить',
      validationEmpty: 'Пожалуйста, введите название пункта.',
      validationAiEmpty: 'Пожалуйста, опишите план или список, который нужно создать.',
    },
    guide: {
      sectionTitle: 'Спокойный порядок каждый день',
      sectionSubtitle: 'HALLO упрощает повседневные дела в три понятных шага без лишнего шума.',
      steps: [
        {
          number: '01.',
          title: 'Спросите и разберитесь',
          description: 'Превращайте сложные темы в ясные объяснения на удобном для вас языке.',
        },
        {
          number: '02.',
          title: 'Напишите и переведите',
          description: 'Оформляйте деловые письма и переводите тексты между узбекским, английским и русским.',
        },
        {
          number: '03.',
          title: 'Посчитайте и спланируйте',
          description: 'Проверяйте скидки, делите расходы и поддерживайте порядок в списке дел и покупок.',
        },
      ],
      faqTitle: 'Частые вопросы',
      faqs: [
        {
          question: 'Нужно ли регистрироваться для работы с HALLO?',
          answer: 'Нет. Все пять инструментов доступны сразу при открытии страницы без аккаунтов, паролей и анкет.',
        },
        {
          question: 'Сохраняется ли выбранный язык после обновления страницы?',
          answer: 'Да. Выбранный язык сохраняется в браузере, и ответы AI автоматически подстраиваются под него.',
        },
        {
          question: 'Где хранятся мои списки из планировщика?',
          answer: 'Ваши задачи, расписание и списки покупок хранятся локально на вашем устройстве.',
        },
        {
          question: 'Может ли переводчик сам определить исходный язык?',
          answer: 'Да. Режим автоопределения распознаёт узбекский, английский или русский текст и переводит его естественно.',
        },
      ],
    },
    footer: {
      tagline: 'Спокойный и надёжный AI-помощник на каждый день.',
      noAccountNotice: 'Регистрация не требуется',
      copyright: '© 2026 HALLO. Все права защищены.',
    },
    errors: {
      network: 'Не удалось связаться с сервером. Проверьте подключение к интернету.',
      server: 'Сервер столкнулся с ошибкой при обработке запроса. Попробуйте ещё раз.',
      serviceUnavailable: 'Сервис AI временно перегружен. Повторите попытку через несколько секунд.',
      timeout: 'Время ожидания ответа истекло. Пожалуйста, попробуйте ещё раз.',
      rateLimit: 'Слишком много запросов подряд. Подождите несколько секунд и повторите.',
      apiKey: 'Сервис AI не настроен. Проверьте конфигурацию окружения.',
      unknown: 'Произошла непредвиденная ошибка.',
    },
  },
};
