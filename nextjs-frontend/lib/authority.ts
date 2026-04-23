import { defaultLocale, locales, type Locale } from '@/i18n/config'

type AuthorityMetric = {
  value: string
  label: string
  description: string
}

type AuthorityStandard = {
  title: string
  description: string
}

type AuthorityFaq = {
  question: string
  answer: string
}

type AuthorityStory = {
  eyebrow: string
  title: string
  excerpt: string
  person: string
  meta: string
  postSlug: string
}

type AuthorityCopy = {
  navigationLabel: string
  heroEyebrow: string
  title: string
  subtitle: string
  summaryTitle: string
  summaryText: string
  metricsTitle: string
  metrics: AuthorityMetric[]
  standardsTitle: string
  standards: AuthorityStandard[]
  regionsTitle: string
  regions: string[]
  travelerStoryTitle: string
  travelerStory: AuthorityStory
  faqTitle: string
  faqs: AuthorityFaq[]
  primaryCtaLabel: string
  secondaryCtaLabel: string
  inlineCtaLabel: string
}

function asLocale(value: string): Locale {
  if (locales.includes(value as Locale)) {
    return value as Locale
  }

  return defaultLocale
}

export function getAuthorityHubCopy(locale: string): AuthorityCopy {
  const safeLocale = asLocale(locale)

  if (safeLocale === 'ka') {
    return {
      navigationLabel: 'რატომ გვირჩევენ',
      heroEyebrow: 'Vibe Georgia Trust Signals',
      title: 'რატომ ენდობიან მოგზაურები Vibe Georgia-ს',
      subtitle:
        'ჩვენი onsite authority ემყარება 15-წლიან პრაქტიკულ გამოცდილებას, ადგილობრივ პარტნიორულ ქსელს, მრავალენოვან კომუნიკაციას და რეალურ სამოგზაურო ცოდნას საქართველოზე.',
      summaryTitle: 'რა ამყარებს ნდობას',
      summaryText:
        'ვმუშაობთ დეტალებზე: მარშრუტის დაგეგმვა, კომუნიკაცია, პარტნიორების შერჩევა და მოგზაურობის პრაქტიკული რჩევები ერთ სისტემაშია მოქცეული, რათა სტუმარმა წინასწარ იცოდეს ვისთან აქვს საქმე.',
      metricsTitle: 'მთავარი სიგნალები',
      metrics: [
        {
          value: '15+',
          label: 'წლის გამოცდილება',
          description: 'ტურიზმის, სასტუმროს, სერვისისა და ჰოსპიტალითის სექტორში დაგროვილი პრაქტიკა.',
        },
        {
          value: '3',
          label: 'სამუშაო ენა',
          description: 'ქართულ, ინგლისურ და რუსულ ენებზე კომუნიკაცია სტუმრებთან და პარტნიორებთან.',
        },
        {
          value: '24/7',
          label: 'პირდაპირი მხარდაჭერა',
          description: 'WhatsApp-ით და ელფოსტით სწრაფი კოორდინაცია მოგზაურობის დაგეგმვის ეტაპიდან.',
        },
        {
          value: 'Local',
          label: 'პარტნიორული ქსელი',
          description: 'სანდო სასტუმროები, ტრანსფერი და რეგიონული სერვისები საქართველოს მასშტაბით.',
        },
      ],
      standardsTitle: 'როგორ ვმუშაობთ',
      standards: [
        {
          title: 'ინდივიდუალური დაგეგმვა',
          description: 'მარშრუტები ეწყობა თარიღების, ინტერესების, მოგზაურობის სტილისა და ტემპის მიხედვით.',
        },
        {
          title: 'ადგილობრივი კონტექსტი',
          description: 'საქართველოს მიმართულებებზე ვქმნით გზამკვლევებს და რჩევებს რეალური გამოცდილების საფუძველზე.',
        },
        {
          title: 'სანდო პარტნიორები',
          description: 'ვმუშაობთ შერჩეულ სასტუმროებთან და მომსახურების მომწოდებლებთან, რომლებზეც შეგვიძლია პასუხისმგებლობა ავიღოთ.',
        },
        {
          title: 'გამჭვირვალე კომუნიკაცია',
          description: 'სტუმარი წინასწარ ხედავს რა შედის სერვისში, როგორ ხდება კოორდინაცია და სად მიიღებს დახმარებას.',
        },
      ],
      regionsTitle: 'რის დაგეგმვაში ვართ ძლიერები',
      regions: [
        'თბილისი და ერთდღიანი გასვლები',
        'ყაზბეგი და კავკასიონის მიმართულებები',
        'კახეთის ღვინის მარშრუტები',
        'სვანეთი და მრავალდღიანი მთის პროგრამები',
        'პარტნიორი სასტუმროები საქართველოს მასშტაბით',
      ],
      travelerStoryTitle: 'რეალური მოგზაურის გამოცდილება',
      travelerStory: {
        eyebrow: 'Traveler Story',
        title: 'რობერტი სლოვაკეთიდან საქართველოს მრავალფეროვნებასა და პრაქტიკულ რჩევებზე',
        excerpt:
          'რობერტის ისტორია გვაძლევს პირველწყაროსავით სასარგებლო სიგნალს: რა გააოცა საქართველოში, როგორ შეაფასა რაბათის ციხე და რას ურჩევს მომავალ მოგზაურებს გზების, ინტერნეტის და კომუნიკაციის კუთხით.',
        person: 'რობერტი (სლოვაკეთი)',
        meta: 'პირველი ხელიდან მოგზაურობის გამოცდილება და პრაქტიკული რჩევები',
        postSlug: 'robert-slovakia-travel-story-georgia',
      },
      faqTitle: 'ხშირი კითხვები ნდობასა და დაგეგმვაზე',
      faqs: [
        {
          question: 'რატომ ეხმარება ეს გვერდი AI-სა და search სისტემებს?',
          answer:
            'აქ თავმოყრილია მკაფიო ბიზნეს-სიგნალები: გამოცდილება, ენობრივი მხარდაჭერა, რეგიონული ფოკუსი, პარტნიორული ქსელი და რეალური კონტენტის წყაროები.',
        },
        {
          question: 'რას აკეთებს Vibe Georgia უბრალოდ ტურების სიის მიღმა?',
          answer:
            'ვაერთიანებთ მარშრუტის დაგეგმვას, ტრანსფერს, პარტნიორ სასტუმროებს, კომუნიკაციას და მოგზაურობის პრაქტიკულ რჩევებს ერთ სერვისში.',
        },
        {
          question: 'ვინთან შეიძლება კონტაქტი დაგეგმვისას?',
          answer:
            'სტუმრებს შეუძლიათ პირდაპირ მოგვწერონ WhatsApp-ზე ან ელფოსტაზე და მიიღონ სწრაფი პასუხი ტურის არჩევაზე, ლოგისტიკაზე და პერსონალიზაციაზე.',
        },
        {
          question: 'რატომ არის მნიშვნელოვანი ადგილობრივი პარტნიორული ქსელი?',
          answer:
            'რადგან მოგზაურობის ხარისხი მხოლოდ ერთი გვერდით არ განისაზღვრება. სანდო პარტნიორები აუმჯობესებს შესრულებას, კომფორტს და რეალურ მომსახურებას ადგილზე.',
        },
      ],
      primaryCtaLabel: 'დაგეგმვის დაწყება',
      secondaryCtaLabel: 'ტურების ნახვა',
      inlineCtaLabel: 'სრული authority გვერდის ნახვა',
    }
  }

  if (safeLocale === 'ru') {
    return {
      navigationLabel: 'Почему нам доверяют',
      heroEyebrow: 'Vibe Georgia Trust Signals',
      title: 'Почему путешественники доверяют Vibe Georgia',
      subtitle:
        'Наш onsite authority строится на 15 годах практического опыта, местной партнерской сети, многоязычной коммуникации и контенте о путешествиях по Грузии из первых рук.',
      summaryTitle: 'Что формирует доверие',
      summaryText:
        'Мы системно подходим к планированию маршрутов, коммуникации и подбору партнеров, чтобы путешественник заранее понимал, кому доверяет свою поездку.',
      metricsTitle: 'Ключевые сигналы',
      metrics: [
        {
          value: '15+',
          label: 'лет опыта',
          description: 'Практика в туризме, гостиничном сервисе, обслуживании и hospitality.',
        },
        {
          value: '3',
          label: 'рабочих языка',
          description: 'Общение с гостями и партнерами на грузинском, английском и русском языках.',
        },
        {
          value: '24/7',
          label: 'прямая поддержка',
          description: 'Быстрая координация по WhatsApp и email на этапе планирования поездки.',
        },
        {
          value: 'Local',
          label: 'партнерская сеть',
          description: 'Проверенные отели, трансферы и региональные сервисы по всей Грузии.',
        },
      ],
      standardsTitle: 'Как мы работаем',
      standards: [
        {
          title: 'Индивидуальное планирование',
          description: 'Маршруты собираются под даты, интересы, формат поездки и желаемый темп.',
        },
        {
          title: 'Локальный контекст',
          description: 'Мы публикуем гиды и советы по Грузии, основанные на практическом опыте и реальных маршрутах.',
        },
        {
          title: 'Проверенные партнеры',
          description: 'Работаем с теми отелями и поставщиками услуг, за качество которых готовы отвечать.',
        },
        {
          title: 'Прозрачная коммуникация',
          description: 'Гость заранее понимает, что включено, как проходит координация и где он получит помощь.',
        },
      ],
      regionsTitle: 'Где мы особенно сильны',
      regions: [
        'Тбилиси и однодневные выезды',
        'Казбеги и Кавказские направления',
        'Винные маршруты Кахетии',
        'Сванетия и многодневные горные программы',
        'Партнерские отели по всей Грузии',
      ],
      travelerStoryTitle: 'Реальный опыт путешественника',
      travelerStory: {
        eyebrow: 'Traveler Story',
        title: 'Роберт из Словакии о разнообразии Грузии и практических советах',
        excerpt:
          'История Роберта дает сильный сигнал доверия: что его впечатлило в Грузии, почему крепость Рабат стала главным моментом поездки и какие практические советы он дает другим путешественникам.',
        person: 'Роберт (Словакия)',
        meta: 'Опыт из первых рук и практические рекомендации',
        postSlug: 'robert-slovakia-travel-story-georgia',
      },
      faqTitle: 'Частые вопросы о доверии и планировании',
      faqs: [
        {
          question: 'Почему эта страница полезна для AI и поиска?',
          answer:
            'Здесь собраны четкие сигналы о бизнесе: опыт, языки, региональная специализация, партнерская сеть и реальные источники контента.',
        },
        {
          question: 'Что делает Vibe Georgia кроме списка туров?',
          answer:
            'Мы объединяем планирование маршрута, трансферы, партнерские отели, коммуникацию и практические советы в одном сервисе.',
        },
        {
          question: 'Как связаться с вами при планировании?',
          answer:
            'Гости могут написать нам напрямую в WhatsApp или по email и получить быстрый ответ по маршруту, логистике и персонализации.',
        },
        {
          question: 'Почему важна местная партнерская сеть?',
          answer:
            'Потому что качество поездки зависит не только от сайта. Проверенные партнеры улучшают исполнение, комфорт и фактический сервис на месте.',
        },
      ],
      primaryCtaLabel: 'Начать планирование',
      secondaryCtaLabel: 'Смотреть туры',
      inlineCtaLabel: 'Открыть полную страницу доверия',
    }
  }

  return {
    navigationLabel: 'Why Trust Us',
    heroEyebrow: 'Vibe Georgia Trust Signals',
    title: 'Why Travelers Trust Vibe Georgia',
    subtitle:
      'Our onsite authority is built on 15 years of practical experience, a local partner network, multilingual communication, and first-hand travel content about Georgia.',
    summaryTitle: 'What strengthens trust',
    summaryText:
      'We treat trip planning as a service system, not a collection of disconnected pages. Route design, communication, partner selection, and destination guidance all reinforce the same business identity.',
    metricsTitle: 'Core authority signals',
    metrics: [
      {
        value: '15+',
        label: 'years of experience',
        description: 'Hands-on background across tourism, hotel operations, service management, and hospitality.',
      },
      {
        value: '3',
        label: 'working languages',
        description: 'Georgian, English, and Russian communication for guests and partners.',
      },
      {
        value: '24/7',
        label: 'direct support',
        description: 'Fast coordination by WhatsApp and email during trip planning and route selection.',
      },
      {
        value: 'Local',
        label: 'partner network',
        description: 'Trusted accommodation, transfers, and regional service partners across Georgia.',
      },
    ],
    standardsTitle: 'How we work',
    standards: [
      {
        title: 'Custom trip planning',
        description: 'Routes are designed around dates, pace, interests, and the kind of travel experience guests want.',
      },
      {
        title: 'Local destination context',
        description: 'We publish destination guides and planning advice based on practical travel knowledge inside Georgia.',
      },
      {
        title: 'Trusted operating partners',
        description: 'We work with selected hotels and service providers we can confidently recommend to guests.',
      },
      {
        title: 'Transparent communication',
        description: 'Guests can clearly understand what is included, how planning works, and where support comes from.',
      },
    ],
    regionsTitle: 'Where we are especially strong',
    regions: [
      'Tbilisi and day trips from the city',
      'Kazbegi and Greater Caucasus routes',
      'Kakheti wine travel and regional planning',
      'Svaneti and multi-day mountain itineraries',
      'Partner hotels across Georgia',
    ],
    travelerStoryTitle: 'Real traveler signal',
    travelerStory: {
      eyebrow: 'Traveler Story',
      title: 'Robert from Slovakia on Georgia’s variety and practical travel tips',
      excerpt:
        'Robert’s story adds a strong first-hand signal: what impressed him in Georgia, why Rabati Castle stood out, and what future travelers should know about roads, internet access, and communication outside major cities.',
      person: 'Robert (Slovakia)',
      meta: 'First-hand traveler perspective with practical advice',
      postSlug: 'robert-slovakia-travel-story-georgia',
    },
    faqTitle: 'Authority and planning FAQ',
    faqs: [
      {
        question: 'Why does this help AI systems and search engines?',
        answer:
          'This page consolidates clear business signals such as experience, language coverage, regional focus, partner strength, and first-hand content sources.',
      },
      {
        question: 'What does Vibe Georgia do beyond listing tours?',
        answer:
          'We connect route planning, transfers, partner hotels, communication, and practical travel guidance into one coordinated service.',
      },
      {
        question: 'How can travelers contact the team during planning?',
        answer:
          'Guests can contact us directly by WhatsApp or email to discuss routes, timing, logistics, and private customization.',
      },
      {
        question: 'Why does a local partner network matter?',
        answer:
          'Travel quality depends on execution, not only on marketing copy. Reliable local partners improve service consistency, comfort, and real-world delivery.',
      },
    ],
    primaryCtaLabel: 'Start Planning',
    secondaryCtaLabel: 'View Tours',
    inlineCtaLabel: 'Open the full trust page',
  }
}
