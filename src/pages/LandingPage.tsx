import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  courses,
  formatPrice,
  reviews,
  MASTER,
} from '../data/content'
import { useStore } from '../store/StoreContext'
import { LandingHeader, SocialLinks } from '../components/LayoutBits'
import handImg from '../assets/figma/hand.png'
import masterImg from '../assets/figma/master.png'

export function LandingPage() {
  const navigate = useNavigate()
  const { enroll, isEnrolled, state, login } = useStore()
  const [sent, setSent] = useState(false)

  function buy(courseId: string) {
    if (!state.userName) login('Ученица')
    enroll(courseId)
    navigate('/cabinet')
  }

  function onContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="page landing" id="top">
      <LandingHeader />

      <main>
        <section className="shell hero-section">
          <div className="hero-layout">
            <div className="hero-copy">
              <h1 className="hero-title">
                Хотите зарабатывать от{' '}
                <span className="money">80.000 ₽</span> в день и работать на
                себя?
              </h1>
              <p className="hero-lead">
                Мы превратим ваше увлечение в востребованную профессию с нуля.
                Вы получите не просто диплом, а готовый набор навыков для
                старта карьеры уже на следующей неделе
              </p>
              <div className="cta-wrap">
                <a href="#courses" className="cta-figma">
                  Посмотреть курсы
                </a>
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
              <SocialLinks />
            </div>
          </div>
        </section>

        <section className="shell section" id="courses">
          <div className="section-head">
            <h2>Курсы</h2>
            <p>
              После оплаты откроется личный кабинет с уроками и записью на
              офлайн.
            </p>
          </div>
          <div className="cards-8">
            {courses.map((course) => {
              const owned = isEnrolled(course.id)
              return (
                <article key={course.id} className="course-tile">
                  <div className="meta-row">
                    <span className="chip">{course.level}</span>
                    <span className="chip">
                      {course.format === 'online'
                        ? 'Онлайн'
                        : course.format === 'offline'
                          ? 'Офлайн'
                          : 'Гибрид'}
                    </span>
                    <span className="chip">{course.duration}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="tile-foot">
                    <span className="price">{formatPrice(course.price)}</span>
                    {owned ? (
                      <button
                        type="button"
                        className="btn btn-aqua"
                        onClick={() => navigate('/cabinet')}
                      >
                        Открыть
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => buy(course.id)}
                      >
                        Оплатить
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="shell section" id="how">
          <div className="section-head">
            <h2>Как устроена платформа</h2>
            <p>Лендинг → оплата курса → кабинет с уроками и офлайн-записью.</p>
          </div>
          <div className="how-grid">
            <div className="how-step glass">
              <div className="num">01</div>
              <h3>Выбор курса</h3>
              <p>Смотрите программы и формат без регистрации.</p>
            </div>
            <div className="how-step glass">
              <div className="num">02</div>
              <h3>Оплата</h3>
              <p>После оплаты открывается личный кабинет.</p>
            </div>
            <div className="how-step glass">
              <div className="num">03</div>
              <h3>Учёба и практика</h3>
              <p>Онлайн-уроки и запись на живые занятия.</p>
            </div>
          </div>
        </section>

        <section className="shell section" id="reviews">
          <div className="section-head">
            <h2>Отзывы</h2>
            <p>Коротко о том, как проходит обучение в NailCraft.</p>
          </div>
          <div className="reviews-grid">
            {reviews.map((r) => (
              <article key={r.id} className="review-card glass-strong">
                <div className="stars">{'★'.repeat(r.rating)}</div>
                <p>{r.text}</p>
                <footer>
                  <strong>{r.name}</strong>
                  <span>{r.course}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="shell section" id="contacts">
          <div className="section-head">
            <h2>Контакты</h2>
          </div>
          <div className="contacts-block">
            <div className="contact-card glass">
              <p className="contacts-legal">
                {MASTER.fullLegal}
                <br />
                ИНН: {MASTER.inn}
              </p>
              <div className="contacts-lines">
                <p>Телефон: {MASTER.phone}</p>
                <p>Адрес: {MASTER.address}</p>
              </div>
              <div className="legal-links">
                <a href="#offer">Оферта</a>
                <a href="#privacy">Политика конфиденциальности</a>
              </div>
              <SocialLinks />
            </div>

            <form className="contact-form glass-strong" onSubmit={onContact}>
              <h3>Оставить заявку</h3>
              <p className="muted">Подскажем, с какого курса лучше начать.</p>
              <div className="form-grid">
                <label className="field">
                  <span>Имя</span>
                  <input name="name" required placeholder="Алина" />
                </label>
                <label className="field">
                  <span>Телефон или Telegram</span>
                  <input
                    name="contact"
                    required
                    placeholder="+7 или @username"
                  />
                </label>
                <label className="field">
                  <span>Интересует</span>
                  <select name="interest" defaultValue="start">
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="btn btn-pink">
                  Отправить
                </button>
                {sent && (
                  <div className="toast" role="status">
                    Заявка принята — скоро свяжемся.
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="map-box" aria-label="Карта">
            КАРТА
          </div>
        </section>
      </main>

      <footer className="shell site-footer">
        <span>© {new Date().getFullYear()} NailCraft</span>
        <span>
          {MASTER.name} · {MASTER.title}
        </span>
      </footer>
    </div>
  )
}
