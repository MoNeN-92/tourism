import type { Locale } from '@/i18n/config'

export const COMMERCIAL_PAGE_SLUGS = [
  'private-tours-in-georgia',
  'day-trips-from-tbilisi',
  'kazbegi-tours',
  'kakheti-wine-tours',
  'svaneti-tours',
] as const

export type CommercialPageSlug = (typeof COMMERCIAL_PAGE_SLUGS)[number]

type PageContent = {
  title: string
  eyebrow: string
  seoDescription: string
  intro: string
  valuePoints: string[]
  audienceTitle: string
  audiencePoints: string[]
  sectionTitle: string
  sectionParagraphs: string[]
  faqTitle: string
  faqs: Array<{ question: string; answer: string }>
}

type PageDefinition = {
  heroImage: string
  content: Record<Locale, PageContent>
}

const pages: Record<CommercialPageSlug, PageDefinition> = {
  'private-tours-in-georgia': {
    heroImage: 'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771396197/cover_1_secna5.jpg',
    content: {
      en: {
        title: 'Private Tours in Georgia',
        eyebrow: 'Tailor-made travel',
        seoDescription: 'Discover private tours in Georgia with custom itineraries, flexible timing, local guides, and comfortable transport across the country.',
        intro: 'Our private tours in Georgia are designed for travelers who want more flexibility, stronger local insight, and a smoother experience than standard group trips.',
        valuePoints: ['Flexible timing and pickup', 'Local guides and private transport', 'Ideal for couples, families, and small groups'],
        audienceTitle: 'Best for travelers who want',
        audiencePoints: ['A more personal travel experience', 'Control over pace, stops, and focus'],
        sectionTitle: 'How we approach private travel',
        sectionParagraphs: [
          'We build routes around your available days, interests, and preferred pace.',
          'That lets the journey feel more comfortable and more relevant than a fixed group schedule.',
        ],
        faqTitle: 'Private tour FAQ',
        faqs: [
          { question: 'Can you customize the route?', answer: 'Yes. We can adapt timing, route focus, and stop duration to your preferences.' },
          { question: 'Are private tours suitable for families?', answer: 'Yes. Private tours are often the most comfortable option for families and small groups.' },
        ],
      },
      ka: {
        title: 'კერძო ტურები საქართველოში',
        eyebrow: 'მორგებული მოგზაურობა',
        seoDescription: 'აღმოაჩინე კერძო ტურები საქართველოში ინდივიდუალური მარშრუტებით, მოქნილი გრაფიკით, ადგილობრივი გიდებით და კომფორტული ტრანსპორტით.',
        intro: 'ჩვენი კერძო ტურები განკუთვნილია მათთვის, ვისაც სურს მეტი მოქნილობა, ადგილობრივი ცოდნა და უფრო კომფორტული გამოცდილება, ვიდრე სტანდარტულ ჯგუფურ ტურებში.',
        valuePoints: ['მოქნილი დრო და აყვანის ლოკაცია', 'ადგილობრივი გიდები და კერძო ტრანსპორტი', 'იდეალურია წყვილებისთვის, ოჯახებისთვის და მცირე ჯგუფებისთვის'],
        audienceTitle: 'საუკეთესოა მათთვის, ვისაც სურს',
        audiencePoints: ['უფრო პერსონალური მოგზაურობის გამოცდილება', 'ტემპზე, გაჩერებებსა და აქცენტებზე მეტი კონტროლი'],
        sectionTitle: 'როგორ ვუდგებით კერძო მოგზაურობას',
        sectionParagraphs: [
          'მარშრუტს ვაწყობთ თქვენი დღეების რაოდენობის, ინტერესების და სასურველი ტემპის მიხედვით.',
          'ამით მოგზაურობა ხდება უფრო კომფორტული და უფრო თქვენზე მორგებული, ვიდრე ფიქსირებული ჯგუფური გრაფიკი.',
        ],
        faqTitle: 'კერძო ტურის FAQ',
        faqs: [
          { question: 'შეგიძლიათ მარშრუტის მორგება?', answer: 'დიახ. შეგვიძლია მოვარგოთ დრო, აქცენტები და გაჩერებების ხანგრძლივობა თქვენს სურვილებს.' },
          { question: 'კერძო ტური ოჯახებისთვისაც კარგია?', answer: 'დიახ. კერძო ტურები ხშირად ყველაზე კომფორტული არჩევანია ოჯახებისთვის და მცირე ჯგუფებისთვის.' },
        ],
      },
      ru: {
        title: 'Частные туры по Грузии',
        eyebrow: 'Индивидуальные путешествия',
        seoDescription: 'Откройте частные туры по Грузии с индивидуальными маршрутами, гибким графиком, местными гидами и комфортным транспортом.',
        intro: 'Наши частные туры по Грузии созданы для тех, кто хочет больше гибкости, локальной экспертизы и более комфортный формат, чем стандартные групповые поездки.',
        valuePoints: ['Гибкое время и место встречи', 'Местные гиды и частный транспорт', 'Идеально для пар, семей и небольших групп'],
        audienceTitle: 'Лучше всего подходит тем, кто хочет',
        audiencePoints: ['Более персональный опыт путешествия', 'Больше контроля над темпом, остановками и акцентами'],
        sectionTitle: 'Как мы подходим к частным турам',
        sectionParagraphs: [
          'Мы строим маршрут вокруг вашего количества дней, интересов и предпочтительного темпа.',
          'Так поездка получается более комфортной и более персональной, чем фиксированная групповая программа.',
        ],
        faqTitle: 'FAQ по частным турам',
        faqs: [
          { question: 'Можно ли адаптировать маршрут?', answer: 'Да. Мы можем настроить время, акценты маршрута и длительность остановок под ваши пожелания.' },
          { question: 'Подходят ли частные туры для семей?', answer: 'Да. Частные туры часто являются самым комфортным вариантом для семей и небольших групп.' },
        ],
      },
    },
  },
  'day-trips-from-tbilisi': {
    heroImage: 'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771399999/tourism-platform/sb9vjb5qdp8fyum3mjpc.png',
    content: {
      en: {
        title: 'Day Trips from Tbilisi',
        eyebrow: 'Easy one-day escapes',
        seoDescription: 'Find the best day trips from Tbilisi including Kazbegi, Kakheti, and other scenic routes with private transport and local guidance.',
        intro: 'If you are staying in Tbilisi and want to use your time well, a strong day trip can show you a lot without changing hotels.',
        valuePoints: ['Popular routes from Tbilisi', 'Private departures and hotel pickup', 'Balanced timing for short-stay travelers'],
        audienceTitle: 'Ideal for',
        audiencePoints: ['Visitors staying 2-5 days in Tbilisi', 'Travelers who want efficient planning'],
        sectionTitle: 'Why a good day trip matters',
        sectionParagraphs: [
          'A good one-day route is about more than distance. It must balance driving time with meaningful stops.',
          'That is why route design matters if you want a full but comfortable day.',
        ],
        faqTitle: 'Day trip FAQ',
        faqs: [
          { question: 'Which day trip is best for first-time visitors?', answer: 'Kazbegi and Kakheti are usually the strongest first choices from Tbilisi.' },
          { question: 'Can day trips start from the hotel?', answer: 'Yes. Private day trips can start directly from your hotel in Tbilisi.' },
        ],
      },
      ka: {
        title: 'ერთდღიანი გასვლები თბილისიდან',
        eyebrow: 'მარტივი ერთდღიანი მოგზაურობები',
        seoDescription: 'იპოვე საუკეთესო ერთდღიანი გასვლები თბილისიდან, მათ შორის ყაზბეგი, კახეთი და სხვა მიმართულებები კერძო ტრანსპორტითა და ადგილობრივი გიდობით.',
        intro: 'თუ თბილისში ჩერდებით და დროის ეფექტურად გამოყენება გსურთ, კარგად დაგეგმილი ერთდღიანი ტური ბევრ რამეს გაჩვენებთ სასტუმროს შეცვლის გარეშე.',
        valuePoints: ['პოპულარული მარშრუტები თბილისიდან', 'კერძო გასვლები და სასტუმროდან აყვანა', 'დაბალანსებული დრო მოკლე ვიზიტებისთვის'],
        audienceTitle: 'იდეალურია',
        audiencePoints: ['სტუმრებისთვის, რომლებიც თბილისში 2-5 დღით ჩერდებიან', 'მათთვის, ვისაც ეფექტური დაგეგმვა სურს'],
        sectionTitle: 'რატომ არის მნიშვნელოვანი კარგი ერთდღიანი ტური',
        sectionParagraphs: [
          'კარგი ერთდღიანი მარშრუტი მხოლოდ მანძილზე არ არის დამოკიდებული. საჭიროა გზის დროისა და შინაარსიანი გაჩერებების ბალანსი.',
          'ამიტომ მარშრუტის სწორად აგება მნიშვნელოვანია, თუ გინდა შინაარსიანი და კომფორტული დღე.',
        ],
        faqTitle: 'ერთდღიანი ტურის FAQ',
        faqs: [
          { question: 'რომელი ტური ჯობს პირველად ჩამოსულებისთვის?', answer: 'ყაზბეგი და კახეთი ხშირად საუკეთესო პირველი არჩევანია თბილისიდან.' },
          { question: 'შეიძლება ტური სასტუმროდან დაიწყოს?', answer: 'დიახ. კერძო ერთდღიანი გასვლები შეიძლება პირდაპირ თქვენი სასტუმროდან დაიწყოს.' },
        ],
      },
      ru: {
        title: 'Однодневные поездки из Тбилиси',
        eyebrow: 'Удобные однодневные поездки',
        seoDescription: 'Найдите лучшие однодневные поездки из Тбилиси, включая Казбеги, Кахетию и другие направления с частным транспортом и местным сопровождением.',
        intro: 'Если вы остановились в Тбилиси и хотите использовать время эффективно, хорошо спланированная однодневная поездка покажет многое без смены отеля.',
        valuePoints: ['Популярные маршруты из Тбилиси', 'Частные выезды и встреча у отеля', 'Сбалансированный тайминг для коротких поездок'],
        audienceTitle: 'Идеально подходит для',
        audiencePoints: ['Гостей, которые проводят в Тбилиси 2-5 дней', 'Тех, кто ценит эффективное планирование'],
        sectionTitle: 'Почему важен хороший однодневный маршрут',
        sectionParagraphs: [
          'Хорошая однодневная поездка зависит не только от расстояния. Нужен баланс между временем в пути и содержательными остановками.',
          'Именно поэтому правильная структура маршрута важна, если вы хотите насыщенный, но комфортный день.',
        ],
        faqTitle: 'FAQ по однодневным поездкам',
        faqs: [
          { question: 'Какая поездка лучше для первого визита?', answer: 'Казбеги и Кахетия обычно являются лучшими первыми вариантами из Тбилиси.' },
          { question: 'Может ли поездка начаться от отеля?', answer: 'Да. Частные однодневные поездки могут начинаться прямо от вашего отеля.' },
        ],
      },
    },
  },
  'kazbegi-tours': {
    heroImage: 'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771399999/tourism-platform/ztclgvrg6o0ooxvzfzxz.jpg',
    content: {
      en: {
        title: 'Kazbegi Tours',
        eyebrow: 'Iconic mountain scenery',
        seoDescription: 'Explore Kazbegi tours from Tbilisi with mountain views, scenic stops, Gergeti Trinity Church, and private travel options.',
        intro: 'Kazbegi is one of Georgia’s strongest signature experiences thanks to its dramatic landscapes and memorable road journey.',
        valuePoints: ['Popular mountain route from Tbilisi', 'Gergeti Trinity Church and scenic viewpoints', 'Strong choice for first-time visitors'],
        audienceTitle: 'Why travelers choose Kazbegi',
        audiencePoints: ['For dramatic alpine scenery', 'For a high-impact day trip with iconic views'],
        sectionTitle: 'What makes Kazbegi work well',
        sectionParagraphs: [
          'Kazbegi is best when the timing leaves room for scenic stops and weather changes.',
          'That is why route balance matters more than trying to add too many stops in one day.',
        ],
        faqTitle: 'Kazbegi FAQ',
        faqs: [
          { question: 'Is Kazbegi possible as a day trip?', answer: 'Yes. A well-planned private day trip to Kazbegi works very well from Tbilisi.' },
          { question: 'When is the best time to visit?', answer: 'Late spring to autumn is the most flexible period, though winter also offers dramatic mountain scenery.' },
        ],
      },
      ka: {
        title: 'ყაზბეგის ტურები',
        eyebrow: 'ლეგენდარული მთის პეიზაჟები',
        seoDescription: 'აღმოაჩინე ყაზბეგის ტურები თბილისიდან მთის ხედებით, ულამაზესი გაჩერებებით, გერგეტის სამებით და კერძო მოგზაურობის ვარიანტებით.',
        intro: 'ყაზბეგი საქართველოს ერთ-ერთი ყველაზე შთამბეჭდავი მიმართულებაა დრამატული ხედებისა და დასამახსოვრებელი გზის გამო.',
        valuePoints: ['პოპულარული მთის მარშრუტი თბილისიდან', 'გერგეტის სამება და პანორამული ხედები', 'ძლიერი არჩევანია პირველად ჩამოსულებისთვის'],
        audienceTitle: 'რატომ ირჩევენ მოგზაურები ყაზბეგს',
        audiencePoints: ['ალპური პეიზაჟებისთვის', 'ძლიერი შთაბეჭდილების მოსახდენად ერთდღიან მარშრუტშიც კი'],
        sectionTitle: 'რა ხდის ყაზბეგს ძლიერ არჩევანად',
        sectionParagraphs: [
          'ყაზბეგი საუკეთესოა მაშინ, როცა დრო რჩება ხედებისთვის და ამინდის ცვლილებებისთვის.',
          'ამიტომ მარშრუტის ბალანსი უფრო მნიშვნელოვანია, ვიდრე ზედმეტად ბევრი გაჩერება ერთ დღეში.',
        ],
        faqTitle: 'ყაზბეგის FAQ',
        faqs: [
          { question: 'შესაძლებელია ყაზბეგი ერთდღიანად?', answer: 'დიახ. კარგად დაგეგმილი კერძო ერთდღიანი ტური თბილისიდან ძალიან კარგად მუშაობს.' },
          { question: 'როდის ჯობს წასვლა?', answer: 'გვიანი გაზაფხული, ზაფხული და შემოდგომა ყველაზე მოქნილი პერიოდია, თუმცა ზამთარსაც თავისი ატმოსფერო აქვს.' },
        ],
      },
      ru: {
        title: 'Туры в Казбеги',
        eyebrow: 'Знаковые горные пейзажи',
        seoDescription: 'Откройте туры в Казбеги из Тбилиси с горными видами, живописными остановками, Троицкой церковью в Гергети и частными форматами путешествия.',
        intro: 'Казбеги — одно из самых впечатляющих направлений Грузии благодаря драматичным пейзажам и красивой дороге.',
        valuePoints: ['Популярный горный маршрут из Тбилиси', 'Гергети и панорамные виды', 'Сильный выбор для первого визита'],
        audienceTitle: 'Почему путешественники выбирают Казбеги',
        audiencePoints: ['Ради альпийских пейзажей', 'Ради яркой поездки даже в формате одного дня'],
        sectionTitle: 'Что делает Казбеги сильным направлением',
        sectionParagraphs: [
          'Казбеги раскрывается лучше, когда в расписании есть время на виды и возможные изменения погоды.',
          'Поэтому баланс маршрута важнее, чем попытка вместить слишком много остановок за один день.',
        ],
        faqTitle: 'FAQ по Казбеги',
        faqs: [
          { question: 'Можно ли поехать в Казбеги на один день?', answer: 'Да. Хорошо спланированная частная поездка из Тбилиси отлично работает в формате одного дня.' },
          { question: 'Когда лучше ехать?', answer: 'Конец весны, лето и осень — самые гибкие сезоны, хотя зима тоже дает особую атмосферу.' },
        ],
      },
    },
  },
  'kakheti-wine-tours': {
    heroImage: 'https://res.cloudinary.com/dj7qaif1i/image/upload/v1772002734/bpdwac4beshtt97ilzli.jpg',
    content: {
      en: {
        title: 'Kakheti Wine Tours',
        eyebrow: 'Georgia’s wine heartland',
        seoDescription: 'Book Kakheti wine tours from Tbilisi and discover Georgian wine culture, cellar visits, tastings, and scenic countryside routes.',
        intro: 'Kakheti is one of Georgia’s most commercially important travel themes because it combines wine, food, culture, and easy access from Tbilisi.',
        valuePoints: ['Wine tastings and cellar visits', 'Private day trips or slower custom routes', 'Strong choice for couples and premium travelers'],
        audienceTitle: 'Ideal for travelers interested in',
        audiencePoints: ['Wine with local context', 'Food, countryside, and relaxed travel'],
        sectionTitle: 'Why Kakheti converts well',
        sectionParagraphs: [
          'Travelers choosing Kakheti want more than transportation. They want atmosphere and authentic wine experiences.',
          'The strongest Kakheti tours combine wine, scenery, food, and storytelling instead of treating the day like a checklist.',
        ],
        faqTitle: 'Kakheti FAQ',
        faqs: [
          { question: 'Can Kakheti work as a day trip?', answer: 'Yes. Kakheti works very well as a private day trip from Tbilisi.' },
          { question: 'Is this only for wine experts?', answer: 'No. Kakheti tours are also great for travelers who want a relaxed introduction to Georgian wine culture.' },
        ],
      },
      ka: {
        title: 'კახეთის ღვინის ტურები',
        eyebrow: 'საქართველოს ღვინის გული',
        seoDescription: 'დაჯავშნე კახეთის ღვინის ტურები თბილისიდან და აღმოაჩინე ქართული ღვინის კულტურა, მარანები, დეგუსტაციები და ულამაზესი სოფლის მარშრუტები.',
        intro: 'კახეთი საქართველოს ერთ-ერთი ყველაზე ძლიერი ტურისტული თემაა, რადგან აერთიანებს ღვინოს, კულინარიას, კულტურას და თბილისიდან მარტივ მისადგომობას.',
        valuePoints: ['ღვინის დეგუსტაციები და მარანები', 'კერძო ერთდღიანი ან უფრო მშვიდი ინდივიდუალური მარშრუტები', 'ძლიერი არჩევანია წყვილებისთვის და პრემიუმ მოგზაურებისთვის'],
        audienceTitle: 'იდეალურია მათთვის, ვისაც აინტერესებს',
        audiencePoints: ['ღვინო ადგილობრივი კონტექსტით', 'გემო, სოფლის ატმოსფერო და მშვიდი მოგზაურობა'],
        sectionTitle: 'რატომ მუშაობს კახეთი განსაკუთრებით კარგად',
        sectionParagraphs: [
          'კახეთს ირჩევენ ისინი, ვისაც უბრალოდ ტრანსპორტზე მეტი სჭირდება. მათ სურთ ატმოსფერო და ავთენტური ღვინის გამოცდილება.',
          'საუკეთესო კახეთის ტურები აერთიანებს ღვინოს, ხედებს, გემოს და ისტორიას, და არა უბრალოდ გაჩერებების სიას.',
        ],
        faqTitle: 'კახეთის FAQ',
        faqs: [
          { question: 'შესაძლებელია კახეთი ერთდღიანად?', answer: 'დიახ. კახეთი ძალიან კარგად მუშაობს თბილისიდან კერძო ერთდღიანი ტურის ფორმატში.' },
          { question: 'ეს მხოლოდ ღვინის ექსპერტებისთვისაა?', answer: 'არა. კახეთის ტურები კარგია მათთვისაც, ვისაც უბრალოდ ქართული ღვინის კულტურის მშვიდი გაცნობა სურს.' },
        ],
      },
      ru: {
        title: 'Винные туры в Кахетию',
        eyebrow: 'Винное сердце Грузии',
        seoDescription: 'Забронируйте винные туры в Кахетию из Тбилиси и откройте грузинскую винную культуру, погреба, дегустации и красивые сельские маршруты.',
        intro: 'Кахетия — одна из самых сильных туристических тем Грузии, потому что объединяет вино, гастрономию, культуру и удобный доступ из Тбилиси.',
        valuePoints: ['Дегустации вина и посещение погребов', 'Частные однодневные поездки или более спокойные маршруты', 'Сильный выбор для пар и premium-путешественников'],
        audienceTitle: 'Подходит путешественникам, которых интересуют',
        audiencePoints: ['Вино с локальным контекстом', 'Гастрономия, сельская атмосфера и спокойный ритм'],
        sectionTitle: 'Почему Кахетия особенно хорошо работает',
        sectionParagraphs: [
          'Люди выбирают Кахетию не только ради трансфера. Им нужна атмосфера и аутентичные винные впечатления.',
          'Лучшие туры в Кахетию объединяют вино, виды, гастрономию и историю, а не просто список остановок.',
        ],
        faqTitle: 'FAQ по Кахетии',
        faqs: [
          { question: 'Можно ли сделать Кахетию поездкой на один день?', answer: 'Да. Кахетия отлично работает как частная однодневная поездка из Тбилиси.' },
          { question: 'Подходит ли это только знатокам вина?', answer: 'Нет. Туры в Кахетию отлично подходят и тем, кто просто хочет спокойно познакомиться с грузинской винной культурой.' },
        ],
      },
    },
  },
  'svaneti-tours': {
    heroImage: 'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771399999/tourism-platform/ka5jpijgi4mb0hktu5m0.jpg',
    content: {
      en: {
        title: 'Svaneti Tours',
        eyebrow: 'Remote mountain adventure',
        seoDescription: 'Plan Svaneti tours with mountain landscapes, Mestia, Ushguli, authentic villages, and multi-day travel designed for depth and scenery.',
        intro: 'Svaneti is one of Georgia’s strongest regions for travelers who want a more dramatic, immersive, and character-rich mountain journey.',
        valuePoints: ['Mestia and Ushguli highlights', 'Excellent region for multi-day private travel', 'Strong landscape and village atmosphere'],
        audienceTitle: 'Best for travelers seeking',
        audiencePoints: ['A deeper mountain experience', 'Authentic regional character and multi-day travel'],
        sectionTitle: 'Why Svaneti needs stronger planning',
        sectionParagraphs: [
          'Svaneti is not a destination where travelers should rush. Route design and overnight rhythm matter more here.',
          'That is why well-built private itineraries usually perform much better than generic programs in this region.',
        ],
        faqTitle: 'Svaneti FAQ',
        faqs: [
          { question: 'Is Svaneti better as a multi-day trip?', answer: 'Yes. Svaneti is usually best experienced over several days.' },
          { question: 'Who should choose Svaneti over Kazbegi?', answer: 'Travelers who want a deeper and more remote mountain journey often prefer Svaneti.' },
        ],
      },
      ka: {
        title: 'სვანეთის ტურები',
        eyebrow: 'მოშორებული მთის თავგადასავალი',
        seoDescription: 'დაგეგმე სვანეთის ტურები მთის პეიზაჟებით, მესტიით, უშგულით, ავთენტური სოფლების გამოცდილებით და მრავალდღიანი მარშრუტებით.',
        intro: 'სვანეთი საქართველოს ერთ-ერთი ყველაზე ძლიერი მიმართულებაა მათთვის, ვისაც სურს უფრო ღრმა, შთამბეჭდავი და ხასიათიანი მთის მოგზაურობა.',
        valuePoints: ['მესტია და უშგული როგორც მთავარი ლოკაციები', 'შესანიშნავია მრავალდღიანი კერძო მოგზაურობისთვის', 'ძლიერი პეიზაჟი და სოფლის ატმოსფერო'],
        audienceTitle: 'საუკეთესოა მათთვის, ვინც ეძებს',
        audiencePoints: ['უფრო ღრმა მთის გამოცდილებას', 'ავთენტურ რეგიონულ ხასიათს და მრავალდღიან მოგზაურობას'],
        sectionTitle: 'რატომ სჭირდება სვანეთს უკეთესი დაგეგმვა',
        sectionParagraphs: [
          'სვანეთი არ არის მიმართულება, სადაც აჩქარება მუშაობს. აქ მარშრუტის აგება და ღამის გათენების რიტმი განსაკუთრებით მნიშვნელოვანია.',
          'სწორედ ამიტომ ამ რეგიონში კარგად აგებული კერძო მარშრუტები ბევრად უკეთ მუშაობს, ვიდრე სტანდარტული პროგრამები.',
        ],
        faqTitle: 'სვანეთის FAQ',
        faqs: [
          { question: 'სჯობს თუ არა სვანეთი მრავალდღიანი ტური იყოს?', answer: 'დიახ. სვანეთი ჩვეულებრივ ყველაზე კარგად რამდენიმე დღეში იხსნება.' },
          { question: 'ვისთვის სჯობს სვანეთი ყაზბეგზე მეტად?', answer: 'მათთვის, ვისაც უფრო ღრმა და შორეული მთის მოგზაურობა სურს, სვანეთი ხშირად უკეთესი არჩევანია.' },
        ],
      },
      ru: {
        title: 'Туры в Сванетию',
        eyebrow: 'Горное приключение вдали от города',
        seoDescription: 'Планируйте туры в Сванетию с горными пейзажами, Местией, Ушгули, аутентичными деревнями и многодневными маршрутами.',
        intro: 'Сванетия — одно из самых сильных направлений Грузии для тех, кто хочет более глубокое, впечатляющее и насыщенное характером горное путешествие.',
        valuePoints: ['Местия и Ушгули как главные локации', 'Отлично подходит для многодневного частного путешествия', 'Сильная природа и деревенская атмосфера'],
        audienceTitle: 'Лучше всего подходит тем, кто ищет',
        audiencePoints: ['Более глубокий горный опыт', 'Аутентичный региональный характер и многодневную поездку'],
        sectionTitle: 'Почему Сванетия требует лучшего планирования',
        sectionParagraphs: [
          'Сванетия — не то направление, где стоит торопиться. Здесь построение маршрута и ритм ночевок особенно важны.',
          'Именно поэтому в этом регионе хорошо собранные частные маршруты обычно работают лучше стандартных программ.',
        ],
        faqTitle: 'FAQ по Сванетии',
        faqs: [
          { question: 'Лучше ли ехать в Сванетию на несколько дней?', answer: 'Да. Сванетия обычно лучше раскрывается в формате многодневной поездки.' },
          { question: 'Кому стоит выбрать Сванетию вместо Казбеги?', answer: 'Тем, кто хочет более глубокое и удаленное горное путешествие, Сванетия часто подходит лучше.' },
        ],
      },
    },
  },
}

export function isCommercialPageSlug(value: string): value is CommercialPageSlug {
  return (COMMERCIAL_PAGE_SLUGS as readonly string[]).includes(value)
}

export function getCommercialPage(locale: Locale, slug: CommercialPageSlug) {
  const page = pages[slug]
  return {
    slug,
    heroImage: page.heroImage,
    ...page.content[locale],
  }
}

export function getCommercialPageSummaries(locale: Locale) {
  return COMMERCIAL_PAGE_SLUGS.map((slug) => {
    const page = getCommercialPage(locale, slug)
    return { slug, title: page.title, description: page.seoDescription }
  })
}
