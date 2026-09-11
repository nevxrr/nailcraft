export const MASTER = {
  name: 'Анастасия Захватова',
  title: 'Дипломированный мастер маникюра',
  fullLegal: 'Самозанятая Захватова Анастасия Викторовна',
  inn: '123456789012',
  phone: '+7 (999) 999-99-99',
  address: 'г. Москва, пр. Карамзина, 5',
  academy: 'NailCraft',
}

export interface Course {
  id: string
  title: string
  level: string
  format: 'online' | 'offline' | 'hybrid'
  duration: string
  price: number
  description: string
  lessons: Lesson[]
  highlights: string[]
}

export interface Lesson {
  id: string
  title: string
  duration: string
  type: 'video' | 'practice' | 'pdf'
  summary: string
}

export interface Review {
  id: string
  name: string
  text: string
  rating: number
  course: string
}

export interface OfflineSlot {
  id: string
  date: string
  time: string
  topic: string
  seats: number
  seatsLeft: number
}

export const courses: Course[] = [
  {
    id: 'start',
    title: 'Маникюр с нуля',
    level: 'Новичок',
    format: 'hybrid',
    duration: '14 дней',
    price: 14900,
    description:
      'Полный старт в профессии: от рабочего места до идеального покрытия. Онлайн + офлайн практика.',
    highlights: [
      'Базовый маникюр и гигиена',
      'Подготовка ногтевой пластины',
      'Классика и френч',
      'Сертификат NailCraft',
    ],
    lessons: [
      {
        id: 's1',
        title: 'Знакомство с профессией',
        duration: '18 мин',
        type: 'video',
        summary: 'Инструменты, стерилизация, организация кабинета.',
      },
      {
        id: 's2',
        title: 'Анатомия ногтя и безопасность',
        duration: '22 мин',
        type: 'video',
        summary: 'Строение пластины, противопоказания, уход.',
      },
      {
        id: 's3',
        title: 'Комбинированный маникюр',
        duration: '35 мин',
        type: 'video',
        summary: 'Снятие, опил и обработка кутикулы.',
      },
      {
        id: 's4',
        title: 'Покрытие гель-лаком',
        duration: '28 мин',
        type: 'video',
        summary: 'База, цвет, топ без сколов.',
      },
      {
        id: 's5',
        title: 'Практика: френч',
        duration: '40 мин',
        type: 'practice',
        summary: 'Классический френч на типсах и натуральных ногтях.',
      },
      {
        id: 's6',
        title: 'Чек-лист мастера',
        duration: '12 мин',
        type: 'pdf',
        summary: 'Памятка по этапам услуги.',
      },
    ],
  },
  {
    id: 'pro',
    title: 'Укрепление и дизайн',
    level: 'Продолжающий',
    format: 'online',
    duration: '10 дней',
    price: 18900,
    description:
      'Укрепление тонких ногтей, архитектура и дизайны, которые быстро продаются.',
    highlights: [
      'Гель и полигель',
      'Архитектура формы',
      'Минималистичный дизайн',
      'Портфолио работ',
    ],
    lessons: [
      {
        id: 'p1',
        title: 'Диагностика и укрепление',
        duration: '20 мин',
        type: 'video',
        summary: 'Когда гель, когда полигель.',
      },
      {
        id: 'p2',
        title: 'Выкладной френч',
        duration: '32 мин',
        type: 'video',
        summary: 'Чистая линия улыбки.',
      },
      {
        id: 'p3',
        title: 'Дизайн за 10 минут',
        duration: '25 мин',
        type: 'video',
        summary: 'Втирка, линии, акцент.',
      },
      {
        id: 'p4',
        title: 'Домашнее задание',
        duration: '—',
        type: 'practice',
        summary: '3 работы с разбором куратора.',
      },
    ],
  },
  {
    id: 'offline-intensive',
    title: 'Офлайн-интенсив',
    level: 'Практика',
    format: 'offline',
    duration: '2 дня',
    price: 12900,
    description:
      'Живая практика в мини-группе: техника на моделях и первые уверенные работы.',
    highlights: [
      'До 6 человек',
      'Модели включены',
      'Разбор ошибок',
      'План первых клиентов',
    ],
    lessons: [
      {
        id: 'o1',
        title: 'День 1 — техника',
        duration: '6 ч',
        type: 'practice',
        summary: 'Маникюр и покрытие на двух моделях.',
      },
      {
        id: 'o2',
        title: 'День 2 — скорость',
        duration: '6 ч',
        type: 'practice',
        summary: 'Тайминг услуги и финальный разбор.',
      },
    ],
  },
  {
    id: 'photo',
    title: 'Съёмка портфолио',
    level: 'Доп.',
    format: 'online',
    duration: '5 дней',
    price: 6900,
    description: 'Как снимать работы на телефон так, чтобы клиенты записывались.',
    highlights: ['Свет и фон', 'Ракурсы', 'Ретушь', 'Лента Instagram'],
    lessons: [
      {
        id: 'ph1',
        title: 'Свет и композиция',
        duration: '16 мин',
        type: 'video',
        summary: 'Схема света для маникюра.',
      },
      {
        id: 'ph2',
        title: 'Обработка за 5 минут',
        duration: '14 мин',
        type: 'video',
        summary: 'Мобильная ретушь без потери текстуры.',
      },
    ],
  },
]

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Марина К.',
    text: 'За две недели ушла от «делаю подругам» к первым платным клиентам. Очень мягко объясняет и всё по делу.',
    rating: 5,
    course: 'Маникюр с нуля',
  },
  {
    id: 'r2',
    name: 'Алина С.',
    text: 'Онлайн удобно смотреть вечером, офлайн закрепил руки. Платформа понятная, без хаоса.',
    rating: 5,
    course: 'Маникюр с нуля',
  },
  {
    id: 'r3',
    name: 'Дарья В.',
    text: 'Брала укрепление — ногти клиентов перестали ломаться. Дизайны теперь делаю быстрее.',
    rating: 5,
    course: 'Укрепление и дизайн',
  },
  {
    id: 'r4',
    name: 'Полина М.',
    text: 'Кабинет после оплаты открылся сразу: уроки, запись на практику — всё в одном месте.',
    rating: 5,
    course: 'Офлайн-интенсив',
  },
]

export const offlineSlots: OfflineSlot[] = [
  {
    id: 'slot-1',
    date: '2026-08-22',
    time: '11:00–17:00',
    topic: 'Базовый маникюр + покрытие',
    seats: 6,
    seatsLeft: 2,
  },
  {
    id: 'slot-2',
    date: '2026-08-29',
    time: '11:00–17:00',
    topic: 'Френч и аккуратный дизайн',
    seats: 6,
    seatsLeft: 4,
  },
  {
    id: 'slot-3',
    date: '2026-09-05',
    time: '12:00–18:00',
    topic: 'Интенсив «Первые клиенты»',
    seats: 6,
    seatsLeft: 5,
  },
]

export function formatPrice(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })
}
