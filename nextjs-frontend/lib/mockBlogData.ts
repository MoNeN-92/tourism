// lib/mockBlogData.ts
export interface BlogPost {
  id: string
  slug: string
  title_ka: string
  title_en: string
  title_ru: string
  excerpt_ka: string
  excerpt_en: string
  excerpt_ru: string
  coverImage: string
  publishedDate: string
  author_ka: string
  author_en: string
  author_ru: string
}

export interface BlogContent {
  intro: string
  section1Title: string
  section1Content: string
  section2Title: string
  section2Content: string
  listItems: string[]
  conclusion: string
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'discover-svaneti-mountains',
    title_ka: 'აღმოაჩინე სვანეთის მთები',
    title_en: 'Discover Svaneti Mountains',
    title_ru: 'Откройте для себя горы Сванетии',
    excerpt_ka: 'სვანეთი - საქართველოს ერთ-ერთი ულამაზესი რეგიონი, რომელიც გთავაზობთ დაუვიწყარ მთის ლანდშაფტებს და უნიკალურ კულტურას.',
    excerpt_en: 'Svaneti is one of the most beautiful regions of Georgia, offering unforgettable mountain landscapes and unique culture.',
    excerpt_ru: 'Сванетия - один из самых красивых регионов Грузии, предлагающий незабываемые горные пейзажи и уникальную культуру.',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    publishedDate: '2024-01-15',
    author_ka: 'გიორგი ბერიძე',
    author_en: 'Giorgi Beridze',
    author_ru: 'Гиорги Беридзе',
  },
  {
    id: '2',
    slug: 'kazbegi-winter-adventure',
    title_ka: 'ზამთრის თავგადასავალი ყაზბეგში',
    title_en: 'Winter Adventure in Kazbegi',
    title_ru: 'Зимнее приключение в Казбеги',
    excerpt_ka: 'ყაზბეგი ზამთარში წარმოადგენს ულამაზეს ადგილს თოვლიანი მწვერვალებით, სკი-კურორტებით და თბილი სტუმართმოყვარეობით.',
    excerpt_en: 'Kazbegi in winter is a beautiful place with snowy peaks, ski resorts, and warm hospitality.',
    excerpt_ru: 'Казбеги зимой - прекрасное место со снежными вершинами, горнолыжными курортами и теплым гостеприимством.',
    coverImage: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80',
    publishedDate: '2024-01-20',
    author_ka: 'ნინო მელაძე',
    author_en: 'Nino Meladze',
    author_ru: 'Нино Меладзе',
  },
  {
    id: '3',
    slug: 'batumi-coastal-guide',
    title_ka: 'ბათუმის სანაპირო გზამკვლევი',
    title_en: 'Batumi Coastal Guide',
    title_ru: 'Путеводитель по побережью Батуми',
    excerpt_ka: 'ბათუმი - შავი ზღვის სანაპიროზე მდებარე ულამაზესი ქალაქი, სადაც შეგიძლიათ ისიამოვნოთ სანაპიროთი, თანამედროვე არქიტექტურით და გემრიელი კერძებით.',
    excerpt_en: 'Batumi is a beautiful city on the Black Sea coast where you can enjoy the beach, modern architecture, and delicious cuisine.',
    excerpt_ru: 'Батуми - красивый город на побережье Черного моря, где можно насладиться пляжем, современной архитектурой и вкусной кухней.',
    coverImage: 'https://api.visitbatumi.com/media/image/ec568ecc98e84a9db0c9d34c051c2191.jpg',
    publishedDate: '2024-01-25',
    author_ka: 'ლევან გოგოლაძე',
    author_en: 'Levan Gogoladze',
    author_ru: 'Леван Гоголадзе',
  },
  {
    id: '4',
    slug: 'tbilisi-old-town-walking-tour',
    title_ka: 'თბილისის ძველი ქალაქის ფეხით ტური',
    title_en: 'Tbilisi Old Town Walking Tour',
    title_ru: 'Пешеходная экскурсия по старому Тбилиси',
    excerpt_ka: 'გაიარეთ თბილისის ძველი ქალაქის ვიწრო ქუჩებით და აღმოაჩინეთ ისტორიული შენობები, ტრადიციული რესტორნები და უნიკალური ატმოსფერო.',
    excerpt_en: 'Walk through the narrow streets of Old Tbilisi and discover historic buildings, traditional restaurants, and unique atmosphere.',
    excerpt_ru: 'Прогуляйтесь по узким улочкам старого Тбилиси и откройте для себя исторические здания, традиционные рестораны и уникальную атмосферу.',
    coverImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/b0/81/77/narikala-fortress-largejpg.jpg?w=700&h=-1&s=1',
    publishedDate: '2024-02-01',
    author_ka: 'მარიამ ქავთარაძე',
    author_en: 'Mariam Kavtaradze',
    author_ru: 'Мариам Кавтарадзе',
  },
  {
    id: '5',
    slug: 'wine-regions-of-georgia',
    title_ka: 'საქართველოს ღვინის რეგიონები',
    title_en: 'Wine Regions of Georgia',
    title_ru: 'Винные регионы Грузии',
    excerpt_ka: 'საქართველო - ღვინის უძველესი სამშობლო. გაეცანით კახეთის, იმერეთის და სხვა რეგიონების ღვინის ტრადიციებს.',
    excerpt_en: 'Georgia is the oldest homeland of wine. Explore the wine traditions of Kakheti, Imereti, and other regions.',
    excerpt_ru: 'Грузия - древнейшая родина вина. Познакомьтесь с винными традициями Кахетии, Имеретии и других регионов.',
    coverImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
    publishedDate: '2024-02-05',
    author_ka: 'დავით ხარაიშვილი',
    author_en: 'Davit Kharaishvili',
    author_ru: 'Давид Хараишвили',
  },
  {
    id: '6',
    slug: 'gudauri-ski-resort-guide',
    title_ka: 'გუდაურის სათხილამურო კურორტის გზამკვლევი',
    title_en: 'Gudauri Ski Resort Guide',
    title_ru: 'Путеводитель по горнолыжному курорту Гудаури',
    excerpt_ka: 'გუდაური - საქართველოს ერთ-ერთი პოპულარული სათხილამურო კურორტი, რომელიც გთავაზობთ შესანიშნავ პირობებს ზამთრის სპორტის მოყვარულებისთვის.',
    excerpt_en: 'Gudauri is one of the most popular ski resorts in Georgia, offering excellent conditions for winter sports enthusiasts.',
    excerpt_ru: 'Гудаури - один из самых популярных горнолыжных курортов Грузии, предлагающий отличные условия для любителей зимних видов спорта.',
    coverImage: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
    publishedDate: '2024-02-10',
    author_ka: 'ანა ჯაფარიძე',
    author_en: 'Ana Japaridze',
    author_ru: 'Ана Джапаридзе',
  },
]

// Blog content for each post
export const blogContentData: Record<string, Record<string, BlogContent>> = {
  'discover-svaneti-mountains': {
    ka: {
      intro: 'სვანეთი საქართველოს ერთ-ერთი ულამაზესი და უნიკალური კუთხეა. მდებარეობს კავკასიონის მთავარ ქედზე და გთავაზობთ დაუვიწყარ ბუნებრივ ლანდშაფტებს, ისტორიულ ძეგლებს და უძველეს ტრადიციებს.',
      section1Title: 'სვანეთის ბუნება და ლანდშაფტები',
      section1Content: 'სვანეთი ცნობილია თავისი მაღალმთიანი ლანდშაფტებით, თოვლიანი მწვერვალებით და კრისტალურად სუფთა მდინარეებით. აქ შეგიძლიათ ნახოთ უშგულის საოცარი სოფელი, რომელიც UNESCO-ს მსოფლიო მემკვიდრეობის სიაშია შეტანილი.',
      section2Title: 'რას უნდა მოელოდეთ',
      section2Content: 'სვანეთის მოგზაურობისას თქვენ შეგხვდებათ უნიკალური კულტურა, გემრიელი ადგილობრივი კერძები და გულთბილი სტუმართმოყვარეობა. რეგიონი იდეალურია როგორც ზაფხულის, ისე ზამთრის ტურიზმისთვის.',
      listItems: [
        'დაუვიწყარი ჰაიკინგის მარშრუტები',
        'ისტორიული სვანური კოშკები',
        'ტრადიციული სვანური კერძები',
        'მთის თოვლიანი მწვერვალები'
      ],
      conclusion: 'სვანეთი ადგილია, სადაც დრო თითქოს გაჩერებულია. აქ შეგიძლიათ დაისვენოთ თანამედროვე ცხოვრების სირთულეებისგან და ისიამოვნოთ ბუნების სილამაზით და ადგილობრივი კულტურით.'
    },
    en: {
      intro: 'Svaneti is one of the most beautiful and unique corners of Georgia. Located in the Greater Caucasus Range, it offers unforgettable natural landscapes, historical monuments, and ancient traditions.',
      section1Title: 'Nature and Landscapes of Svaneti',
      section1Content: 'Svaneti is famous for its high-mountain landscapes, snowy peaks, and crystal-clear rivers. Here you can see the amazing village of Ushguli, which is listed as a UNESCO World Heritage Site.',
      section2Title: 'What to Expect',
      section2Content: 'When traveling to Svaneti, you will encounter a unique culture, delicious local cuisine, and warm hospitality. The region is ideal for both summer and winter tourism.',
      listItems: [
        'Unforgettable hiking routes',
        'Historic Svan towers',
        'Traditional Svan cuisine',
        'Snow-capped mountain peaks'
      ],
      conclusion: 'Svaneti is a place where time seems to have stopped. Here you can rest from the complexities of modern life and enjoy the beauty of nature and local culture.'
    },
    ru: {
      intro: 'Сванетия - один из самых красивых и уникальных уголков Грузии. Расположенная в Большом Кавказском хребте, она предлагает незабываемые природные ландшафты, исторические памятники и древние традиции.',
      section1Title: 'Природа и ландшафты Сванетии',
      section1Content: 'Сванетия известна своими высокогорными ландшафтами, заснеженными вершинами и кристально чистыми реками. Здесь вы можете увидеть удивительную деревню Ушгули, внесенную в список Всемирного наследия ЮНЕСКО.',
      section2Title: 'Чего ожидать',
      section2Content: 'Путешествуя в Сванетию, вы встретите уникальную культуру, вкусную местную кухню и теплое гостеприимство. Регион идеален как для летнего, так и для зимнего туризма.',
      listItems: [
        'Незабываемые пешие маршруты',
        'Исторические сванские башни',
        'Традиционная сванская кухня',
        'Заснеженные горные вершины'
      ],
      conclusion: 'Сванетия - место, где время словно остановилось. Здесь вы можете отдохнуть от сложностей современной жизни и насладиться красотой природы и местной культуры.'
    }
  },
  'kazbegi-winter-adventure': {
    ka: {
      intro: 'ყაზბეგი ზამთარში გთავაზობთ უნიკალურ თავგადასავალს თოვლიან მთებში. სტეფანწმინდის მუნიციპალიტეტში მდებარე ეს რეგიონი ცნობილია თავისი ბუნებრივი სილამაზით და სათხილამურო კურორტებით.',
      section1Title: 'ზამთრის აქტივობები ყაზბეგში',
      section1Content: 'ყაზბეგში შეგიძლიათ ისიამოვნოთ სათხილამურო სპორტით, სნოუბორდით, და თოვლიან ლანდშაფტებზე ფეხით სიარულით. გერგეტის სამების ეკლესია ზამთარში განსაკუთრებულ ხედს ქმნის თოვლიანი მწვერვალების ფონზე.',
      section2Title: 'სად დავრჩეთ და რა ვჭამოთ',
      section2Content: 'რეგიონში ბევრი კომფორტული სასტუმრო და სახლია, სადაც თბილი სტუმართმოყვარეობა და გემრიელი ადგილობრივი კერძები გელოდებათ. ყაზბეგის ტრადიციული კვერცხი და ხინკალი განსაკუთრებით პოპულარულია.',
      listItems: [
        'სათხილამურო ტრასები ყველა დონისთვის',
        'გერგეტის სამების ეკლესიის ვიზიტი',
        'ჯიპ-ტურები თოვლიან მთებში',
        'ხევსურული და ადგილობრივი კერძები'
      ],
      conclusion: 'ყაზბეგი ზამთარში იდეალური დანიშნულების ადგილია მოგზაურებისთვის, რომლებიც ეძებენ თოვლს, თავგადასავალს და დაუვიწყარ გამოცდილებას საქართველოს მთებში.'
    },
    en: {
      intro: 'Kazbegi in winter offers a unique adventure in snowy mountains. Located in the Stepantsminda municipality, this region is famous for its natural beauty and ski resorts.',
      section1Title: 'Winter Activities in Kazbegi',
      section1Content: 'In Kazbegi, you can enjoy skiing, snowboarding, and hiking in snowy landscapes. Gergeti Trinity Church creates a spectacular view against the backdrop of snowy peaks in winter.',
      section2Title: 'Where to Stay and What to Eat',
      section2Content: 'The region has many comfortable hotels and guesthouses where warm hospitality and delicious local cuisine await you. Kazbegi\'s traditional khinkali and local dishes are particularly popular.',
      listItems: [
        'Ski slopes for all levels',
        'Visit to Gergeti Trinity Church',
        'Jeep tours in snowy mountains',
        'Khevsurian and local cuisine'
      ],
      conclusion: 'Kazbegi in winter is an ideal destination for travelers seeking snow, adventure, and an unforgettable experience in the Georgian mountains.'
    },
    ru: {
      intro: 'Казбеги зимой предлагает уникальное приключение в заснеженных горах. Расположенный в муниципалитете Степанцминда, этот регион известен своей природной красотой и горнолыжными курортами.',
      section1Title: 'Зимние развлечения в Казбеги',
      section1Content: 'В Казбеги вы можете насладиться катанием на лыжах, сноуборде и пешими прогулками по заснеженным ландшафтам. Церковь Святой Троицы в Гергети создает захватывающий вид на фоне заснеженных вершин зимой.',
      section2Title: 'Где остановиться и что поесть',
      section2Content: 'В регионе много комфортабельных отелей и гостевых домов, где вас ждет теплое гостеприимство и вкусная местная кухня. Традиционные хинкали Казбеги и местные блюда особенно популярны.',
      listItems: [
        'Горнолыжные трассы для всех уровней',
        'Посещение церкви Святой Троицы в Гергети',
        'Джип-туры в заснеженных горах',
        'Хевсурская и местная кухня'
      ],
      conclusion: 'Казбеги зимой - идеальное место для путешественников, ищущих снег, приключения и незабываемые впечатления в грузинских горах.'
    }
  },
  'batumi-coastal-guide': {
    ka: {
      intro: 'ბათუმი საქართველოს უმთავრესი კურორტი და შავი ზღვის სანაპიროს მარგალიტია. ამ თანამედროვე ქალაქში ბუნების სილამაზე, უძველესი კულტურა და თანამედროვე არქიტექტურა ერთმანეთს ეხამება.',
      section1Title: 'ბათუმის სანაპიროები და პლაჟები',
      section1Content: 'ბათუმი ცნობილია თავისი ლამაზი სანაპიროებით და კეთილმოწყობილი პლაჟებით. ბულვარი, რომელიც 7 კილომეტრზე გადაჭიმულია, იდეალური ადგილია საღამოს სასეირნოდ და დასასვენებლად.',
      section2Title: 'კულტურა და გასართობი',
      section2Content: 'ბათუმში შეგხვდებათ ნეონის ციხე ხმაური, თანამედროვე აფაბეთის სკვერი, და ბევრი სხვა საინტერესო ადგილი. ქალაქში მდიდარი ღამის ცხოვრება და დელფინარიუმი ბავშვებისთვის.',
      listItems: [
        'ბათუმის ბულვარი და პლაჟები',
        'აფაბეთის სკვერი და ნეონის ციხე ხმაური',
        'ბათუმის ბოტანიკური ბაღი',
        'ადგილობრივი აჭარული კერძები'
      ],
      conclusion: 'ბათუმი შესანიშნავი არჩევანია როგორც ზაფხულის დასასვენებლად, ისე მთელი წლის განმავლობაში სტუმრობისთვის. აქ ზღვა, მზე და საინტერესო გასართობი აქტივობები გელოდებათ.'
    },
    en: {
      intro: 'Batumi is Georgia\'s main resort and the pearl of the Black Sea coast. In this modern city, natural beauty, ancient culture, and contemporary architecture blend harmoniously.',
      section1Title: 'Batumi Beaches and Waterfront',
      section1Content: 'Batumi is famous for its beautiful coastline and well-equipped beaches. The Boulevard, stretching for 7 kilometers, is an ideal place for evening walks and relaxation.',
      section2Title: 'Culture and Entertainment',
      section2Content: 'In Batumi, you will encounter the Alphabetic Tower, modern Europe Square, and many other interesting places. The city has a rich nightlife and a dolphinarium for children.',
      listItems: [
        'Batumi Boulevard and beaches',
        'Alphabet Tower and Europe Square',
        'Batumi Botanical Garden',
        'Local Adjarian cuisine'
      ],
      conclusion: 'Batumi is an excellent choice for both summer vacations and year-round visits. Here, the sea, sun, and interesting entertainment activities await you.'
    },
    ru: {
      intro: 'Батуми - главный курорт Грузии и жемчужина побережья Черного моря. В этом современном городе гармонично сочетаются природная красота, древняя культура и современная архитектура.',
      section1Title: 'Пляжи и набережная Батуми',
      section1Content: 'Батуми известен своей красивой береговой линией и благоустроенными пляжами. Бульвар, протянувшийся на 7 километров, - идеальное место для вечерних прогулок и отдыха.',
      section2Title: 'Культура и развлечения',
      section2Content: 'В Батуми вас встретят Башня грузинского алфавита, современная площадь Европы и многие другие интересные места. В городе богатая ночная жизнь и дельфинарий для детей.',
      listItems: [
        'Батумский бульвар и пляжи',
        'Башня алфавита и площадь Европы',
        'Батумский ботанический сад',
        'Местная аджарская кухня'
      ],
      conclusion: 'Батуми - отличный выбор как для летнего отдыха, так и для круглогодичного посещения. Здесь вас ждут море, солнце и интересные развлечения.'
    }
  },
  'tbilisi-old-town-walking-tour': {
    ka: {
      intro: 'თბილისის ძველი ქალაქი საქართველოს დედაქალაქის გული და სულია. ვიწრო ქუჩები, ისტორიული შენობები და ტრადიციული არქიტექტურა უნიკალურ ატმოსფეროს ქმნის.',
      section1Title: 'თბილისის ძველი ქალაქის ისტორია',
      section1Content: 'ძველი თბილისი დაფუძნდა მე-5 საუკუნეში. აბანოთუბანი, ნარიყალა და სხვა ისტორიული ძეგლები ქალაქის მდიდარ ისტორიას მოგვითხრობს. აქ ყოველი ქუჩა თავისი ამბავით აღსავსეა.',
      section2Title: 'რას უნდა ნახოთ',
      section2Content: 'ძველ თბილისში აუცილებლად უნდა ნახოთ ნარიყალას ციხე, აბანოთუბანი, შარდენის ქუჩა, და მეტეხი ხიდი. ტრადიციულ რესტორნებში ქართული კერძები გასინჯეთ.',
      listItems: [
        'ნარიყალას ციხე და საბაღდატო',
        'აბანოთუბნის გოგირდის აბაზანები',
        'შარდენის ქუჩა რესტორნებითა და კაფეებით',
        'მეტეხის ხიდი და მტკვრის ხედი'
      ],
      conclusion: 'თბილისის ძველი ქალაქი ადგილია სადაც წარსული და აწმყო ერთმანეთს ხვდება. ფეხით სიარული ძველ ქუჩებში დაუვიწყარი გამოცდილებაა ყველა მოგზაურისთვის.'
    },
    en: {
      intro: 'Old Tbilisi is the heart and soul of Georgia\'s capital. Narrow streets, historic buildings, and traditional architecture create a unique atmosphere.',
      section1Title: 'History of Old Tbilisi',
      section1Content: 'Old Tbilisi was founded in the 5th century. The Abanotubani district, Narikala, and other historical monuments tell the story of the city\'s rich history. Every street here is full of its own story.',
      section2Title: 'What to See',
      section2Content: 'In Old Tbilisi, you must see Narikala Fortress, Abanotubani, Shardeni Street, and the Metekhi Bridge. Try Georgian dishes in traditional restaurants.',
      listItems: [
        'Narikala Fortress and cable car',
        'Sulfur baths of Abanotubani',
        'Shardeni Street with restaurants and cafes',
        'Metekhi Bridge and Mtkvari River view'
      ],
      conclusion: 'Old Tbilisi is a place where past and present meet. Walking through the old streets is an unforgettable experience for every traveler.'
    },
    ru: {
      intro: 'Старый Тбилиси - сердце и душа столицы Грузии. Узкие улочки, исторические здания и традиционная архитектура создают уникальную атмосферу.',
      section1Title: 'История старого Тбилиси',
      section1Content: 'Старый Тбилиси был основан в 5 веке. Район Абанотубани, Нарикала и другие исторические памятники рассказывают о богатой истории города. Каждая улица здесь полна своей историей.',
      section2Title: 'Что посмотреть',
      section2Content: 'В старом Тбилиси обязательно посетите крепость Нарикала, Абанотубани, улицу Шардена и мост Метехи. Попробуйте грузинские блюда в традиционных ресторанах.',
      listItems: [
        'Крепость Нарикала и канатная дорога',
        'Серные бани Абанотубани',
        'Улица Шардена с ресторанами и кафе',
        'Мост Метехи и вид на Мтквари'
      ],
      conclusion: 'Старый Тбилиси - это место, где встречаются прошлое и настоящее. Прогулка по старым улицам - незабываемый опыт для каждого путешественника.'
    }
  },
  'wine-regions-of-georgia': {
    ka: {
      intro: 'საქართველო ღვინის დაყენების 8000 წლიანი ისტორიის მქონე ქვეყანაა. კახეთი, იმერეთი და სხვა რეგიონები უნიკალურ ღვინის ტრადიციებს გვთავაზობენ.',
      section1Title: 'კახეთი - ღვინის მთავარი რეგიონი',
      section1Content: 'კახეთი საქართველოს ღვინის ძირითადი რეგიონია. აქ ყურძნის მრავალი ჯიში მოჰყავთ, მათ შორის საფერავი და რქაწითელი. ციკორაძის და შუმის მარნები განსაკუთრებით პოპულარულია.',
      section2Title: 'ღვინის დეგუსტაცია და ღვინის ტურიზმი',
      section2Content: 'საქართველოში ღვინის ტურიზმი სწრაფად ვითარდება. შეგიძლიათ ეწვიოთ ღვინის მარნებს, დააგემოვნოთ სხვადასხვა ღვინო და გაეცნოთ ქვევრის ღვინის დაყენების უძველეს მეთოდს.',
      listItems: [
        'კახეთის ღვინის მარნები და ღვინის ტური',
        'ქვევრის ღვინის დეგუსტაცია',
        'სიღნაღი და ტელავის ღვინის ფესტივალები',
        'ღვინოსთან ადგილობრივი კერძების დაწყვილება'
      ],
      conclusion: 'საქართველო ღვინის მოყვარულებისთვის სამოთხეა. ღვინის რეგიონების მოგზაურობა გაცნობთ უძველეს ტრადიციებს და გემრიელ ქართულ ღვინოებს.'
    },
    en: {
      intro: 'Georgia is a country with an 8,000-year history of winemaking. Kakheti, Imereti, and other regions offer unique wine traditions.',
      section1Title: 'Kakheti - The Main Wine Region',
      section1Content: 'Kakheti is Georgia\'s main wine region. Many grape varieties are grown here, including Saperavi and Rkatsiteli. Tsinandali and Shumi wineries are particularly popular.',
      section2Title: 'Wine Tasting and Wine Tourism',
      section2Content: 'Wine tourism is rapidly developing in Georgia. You can visit wineries, taste different wines, and learn about the ancient method of qvevri winemaking.',
      listItems: [
        'Kakheti wineries and wine tours',
        'Qvevri wine tasting',
        'Sighnaghi and Telavi wine festivals',
        'Pairing local cuisine with wine'
      ],
      conclusion: 'Georgia is a paradise for wine lovers. Traveling through wine regions will introduce you to ancient traditions and delicious Georgian wines.'
    },
    ru: {
      intro: 'Грузия - страна с 8000-летней историей виноделия. Кахетия, Имеретия и другие регионы предлагают уникальные винные традиции.',
      section1Title: 'Кахетия - главный винный регион',
      section1Content: 'Кахетия - основной винный регион Грузии. Здесь выращивают множество сортов винограда, включая Саперави и Ркацители. Винодельни Цинандали и Шуми особенно популярны.',
      section2Title: 'Дегустация вина и винный туризм',
      section2Content: 'Винный туризм в Грузии быстро развивается. Вы можете посетить винодельни, попробовать разные вина и узнать о древнем методе виноделия в квеври.',
      listItems: [
        'Винодельни Кахетии и винные туры',
        'Дегустация вина в квеври',
        'Винные фестивали в Сигнахи и Телави',
        'Сочетание местной кухни с вином'
      ],
      conclusion: 'Грузия - рай для любителей вина. Путешествие по винным регионам познакомит вас с древними традициями и вкусными грузинскими винами.'
    }
  },
  'gudauri-ski-resort-guide': {
    ka: {
      intro: 'გუდაური საქართველოს ერთ-ერთი უმთავრესი სათხილამურო კურორტია. 2000-3000 მეტრის სიმაღლეზე მდებარე ეს კურორტი შესანიშნავ პირობებს გთავაზობთ ზამთრის სპორტისთვის.',
      section1Title: 'სათხილამურო ტრასები და ინფრასტრუქტურა',
      section1Content: 'გუდაურში 57 კმ სათხილამურო ტრასა და თანამედროვე საბაგირო სისტემებია. ტრასები შესაფერისია როგორც დამწყებთათვის, ისე პროფესიონალებისთვის. თოვლის ხარისხი და რაოდენობა იდეალურია.',
      section2Title: 'სად დავრჩეთ და რა ვჭამოთ',
      section2Content: 'გუდაურში ბევრი სასტუმრო და ქირაობის ბინაა. კურორტზე რამდენიმე რესტორანი და კაფეა, სადაც როგორც ქართულ, ისე ევროპულ კერძებს მიირთმევთ.',
      listItems: [
        'თანამედროვე საბაგირო სისტემები',
        'ტრასები ყველა დონისთვის',
        'ფრირაიდინგი და ჰელისკიინგი',
        'სკი-სკოლები და აღჭურვილობის გაქირავება'
      ],
      conclusion: 'გუდაური შესანიშნავი არჩევანია თოვლის მოყვარულებისთვის. კურორტი გთავაზობთ თანამედროვე ინფრასტრუქტურას, კარგ თოვლს და მშვენიერ მთის ხედებს.'
    },
    en: {
      intro: 'Gudauri is one of Georgia\'s main ski resorts. Located at an altitude of 2000-3000 meters, this resort offers excellent conditions for winter sports.',
      section1Title: 'Ski Slopes and Infrastructure',
      section1Content: 'Gudauri has 57 km of ski runs and modern lift systems. The slopes are suitable for both beginners and professionals. Snow quality and quantity are ideal.',
      section2Title: 'Where to Stay and What to Eat',
      section2Content: 'Gudauri has many hotels and rental apartments. There are several restaurants and cafes at the resort where you can enjoy both Georgian and European cuisine.',
      listItems: [
        'Modern lift systems',
        'Slopes for all levels',
        'Freeriding and heliskiing',
        'Ski schools and equipment rental'
      ],
      conclusion: 'Gudauri is an excellent choice for snow lovers. The resort offers modern infrastructure, good snow, and beautiful mountain views.'
    },
    ru: {
      intro: 'Гудаури - один из главных горнолыжных курортов Грузии. Расположенный на высоте 2000-3000 метров, этот курорт предлагает отличные условия для зимних видов спорта.',
      section1Title: 'Горнолыжные трассы и инфраструктура',
      section1Content: 'В Гудаури есть 57 км горнолыжных трасс и современные подъемники. Трассы подходят как для новичков, так и для профессионалов. Качество и количество снега идеальны.',
      section2Title: 'Где остановиться и что поесть',
      section2Content: 'В Гудаури много отелей и квартир в аренду. На курорте есть несколько ресторанов и кафе, где можно насладиться как грузинской, так и европейской кухней.',
      listItems: [
        'Современные подъемники',
        'Трассы для всех уровней',
        'Фрирайд и хелиски',
        'Лыжные школы и прокат оборудования'
      ],
      conclusion: 'Гудаури - отличный выбор для любителей снега. Курорт предлагает современную инфраструктуру, хороший снег и прекрасные горные виды.'
    }
  }
}