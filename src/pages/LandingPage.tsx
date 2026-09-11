import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import handImg from '../assets/figma/hand.png'
import masterImg from '../assets/figma/master.png'
import {
  LandingHeader,
  TelegramButton,
  TelegramIconLink,
} from '../components/LayoutBits'
import {
  COURSE,
  DAY_PLAN,
  FOR_WHOM,
  MASTER,
  OFFER_POINTS,
  PAIN,
  RPM_ROWS,
  SYSTEM,
  TELEGRAM_URL,
  TICKER,
  formatPrice,
} from '../data/content'
import { Reveal } from '../components/Reveal'
import { usePrefersReducedMotion, useScrollProgress } from '../hooks/useMotion'
import { useStore } from '../store/StoreContext'

function Ticker() {
  const line = [...TICKER, ...TICKER]
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {line.map((item, i) => (
          <span key={`${item}-${i}`}>
            {item}
            <i />
          </span>
        ))}
      </div>
    </div>
  )
}

function CursorGlow() {
  const reduced = usePrefersReducedMotion()
  const [pos, setPos] = useState({ x: 0, y: 0, on: false })

  useEffect(() => {
    if (reduced) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches) return
    const move = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY, on: true })
    }
    const leave = () => setPos((p) => ({ ...p, on: false }))
    window.addEventListener('pointermove', move)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [reduced])

  if (!pos.on) return null
  return (
    <div
      className="cursor-glow"
      style={{ '--cx': `${pos.x}px`, '--cy': `${pos.y}px` } as CSSProperties}
      aria-hidden
    />
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const { enroll, enrolled } = useStore()
  const progress = useScrollProgress()

  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (!id) return
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
    return () => window.clearTimeout(t)
  }, [])

  function openCourse() {
    enroll()
    navigate('/course')
  }

  return (
    <div className="page landing" id="top">
      <div className="scroll-bar" style={{ transform: `scaleX(${progress})` }} />
      <div className="atmosphere" aria-hidden>
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <CursorGlow />
      <LandingHeader />

      <main>
        <section className="shell hero-section">
          <p className="hero-kicker">
            <span>01</span> Школа · {MASTER.years} лет практики
          </p>
          <div className="hero-layout">
            <div className="hero-copy">
              <h1 className="hero-title">
                Сколы
                <br />
                на третий день —
                <span className="hero-title-break">это не норма.</span>
              </h1>
              <p className="hero-lead">
                Аппаратный маникюр без режущего. Гель как архитектура.
                Носка до 5 недель.
              </p>
              <div className="cta-wrap">
                <TelegramButton>Написать в Telegram</TelegramButton>
                <button type="button" className="cta-ghost" onClick={openCourse}>
                  {enrolled ? 'Открыть курс' : 'Тест · открыть курс без оплаты'}
                </button>
                <div className="hero-hand" aria-hidden>
                  <img src={handImg} alt="" />
                </div>
              </div>
            </div>

            <div className="portrait-block">
              <div className="portrait-arch">
                <img src={masterImg} alt={MASTER.name} />
              </div>
              <div className="portrait-plate">
                <strong>{MASTER.name}</strong>
                <span>{MASTER.title}</span>
              </div>
              <div className="hero-facts">
                <span>без ножниц</span>
                <span>2 места</span>
                <span>{formatPrice(COURSE.price)}</span>
              </div>
            </div>
          </div>
        </section>

        <Ticker />

        <section className="shell chapter" id="pain">
          <div className="chapter-index">
            <span className="chapter-num">02</span>
            <h2>Боль</h2>
            <p>Три причины, почему покрытие не доживает до коррекции.</p>
          </div>
          <div className="pain-stack">
            {PAIN.map((item, i) => (
              <Reveal key={item.num} className="pain-card" delay={i * 80}>
                <span className="num">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="shell chapter" id="system">
          <div className="chapter-index">
            <span className="chapter-num">03</span>
            <h2>Система</h2>
            <p>Не «на глаз». Фреза, обороты, архитектура — и носка до 5 недель.</p>
          </div>
          <div className="system-grid">
            {SYSTEM.map((item, i) => (
              <Reveal key={item.num} className="system-card" delay={i * 70}>
                <span className="num">{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="shell offer-section" id="offer">
          <Reveal className="offer-stage">
            <p className="eyebrow">
              <span>04</span> Курс
            </p>
            <h2 className="offer-title">{COURSE.title}</h2>
            <p className="offer-lead">
              Один день. Теория, затем две модели. Мини-группа из двух —
              или индивидуально.
            </p>
            <div className="offer-price">
              <strong>{formatPrice(COURSE.price)}</strong>
              <span>стажировка {formatPrice(COURSE.internship)}</span>
            </div>
            <ul className="offer-points">
              {OFFER_POINTS.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
            <div className="offer-actions">
              <TelegramButton>Забронировать место в Telegram</TelegramButton>
              <button type="button" className="cta-ghost dark" onClick={openCourse}>
                {enrolled ? 'Продолжить курс' : 'Тест · войти в курс без оплаты'}
              </button>
            </div>
          </Reveal>
        </section>

        <section className="shell chapter" id="day">
          <div className="chapter-index">
            <span className="chapter-num">05</span>
            <h2>День</h2>
            <p>Быстрый каркас: сначала таблица, потом руки. Без воды.</p>
          </div>
          <div className="day-list">
            {DAY_PLAN.map((item, i) => (
              <Reveal key={item.time} className="day-row" delay={i * 80}>
                <span className="day-mark">0{i + 1}</span>
                <div>
                  <p className="day-time">{item.time}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="whom-grid">
            {FOR_WHOM.map((item, i) => (
              <Reveal key={item.title} className="whom-card glass" delay={i * 90}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="shell gift-section" id="gift">
          <Reveal className="gift-card">
            <div className="gift-copy">
              <p className="eyebrow">
                <span>06</span> Подарок
              </p>
              <h2>Шпаргалка «фрезы и обороты»</h2>
              <p>
                Таблица, по которой учат аппарат: фреза, зона, обороты, задача.
                PDF ещё собирается — каркас уже здесь. Полную версию и разборы
                сложных ногтей пришлю в Telegram.
              </p>
              <TelegramButton>Забрать шпаргалку в Telegram</TelegramButton>
            </div>
            <div className="rpm-wrap" role="table" aria-label="Фрезы и обороты">
              <div className="rpm-head" role="row">
                <span>Фреза</span>
                <span>Зона</span>
                <span>Обороты</span>
                <span>Задача</span>
              </div>
              {RPM_ROWS.map((row) => (
                <div key={row.bit} className="rpm-row" role="row">
                  <strong>{row.bit}</strong>
                  <span>{row.zone}</span>
                  <span>{row.rpm}</span>
                  <span>{row.job}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="shell about-section" id="about">
          <Reveal className="about-grid">
            <div>
              <p className="eyebrow">
                <span>07</span> Преподаватель
              </p>
              <h2>{MASTER.name}</h2>
              <p className="about-lead">
                {MASTER.years} лет в аппаратном маникюре. Учит без режущего
                инструмента — с нуля и тех, кто уже работает.
              </p>
              <p className="muted">
                Уроки — таблицы и чек-листы. Лайфхаки. Разбор сложных пластин.
                После дня — чат, не брошенные в мессенджере.
              </p>
            </div>
            <aside className="about-aside glass-strong">
              <p>{MASTER.legal}</p>
              <p>Контакт и вход — только Telegram.</p>
              <TelegramIconLink />
            </aside>
          </Reveal>
        </section>
      </main>

      <footer className="shell site-footer">
        <span>© {new Date().getFullYear()} NailCraft</span>
        <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
          Telegram
        </a>
      </footer>
    </div>
  )
}
