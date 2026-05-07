import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Dashboards } from './Dashboards'
import brandIcon from './assets/brand/anyspot-icon-transparent.png'
import brandLogo from './assets/brand/anyspot-logo-transparent.png'
import goldenCardIntro from './assets/cards/golden-card-intro.png'
import heroVideo from './assets/videos/anyspotvideo2.mp4'
import './App.css'

const storySteps = [
  {
    eyebrow: 'For flexible movers',
    title: 'Find the class that fits today.',
    body: 'Search boutique gyms, studios, trainers, and fitness spaces across Czechia. Buy credits once and book instantly.',
  },
  {
    eyebrow: 'For independent gyms',
    title: 'A fairer marketplace for every visit.',
    body: 'AnySpot is built around stronger payouts, capacity control, and a modern calendar for studios that deserve better economics.',
  },
  {
    eyebrow: 'Operating system',
    title: 'Booking, credits, payouts, and growth in one place.',
    body: 'The MVP starts with discovery and booking. The platform grows into the daily operating layer for boutique fitness spaces.',
  },
]

const activities = [
  { name: 'Yoga', popularity: 84, bookings: 1240, trend: '+18%' },
  { name: 'Pilates', popularity: 92, bookings: 1680, trend: '+31%' },
  { name: 'Barre', popularity: 68, bookings: 740, trend: '+14%' },
  { name: 'Padel', popularity: 76, bookings: 910, trend: '+22%' },
  { name: 'Cycling', popularity: 71, bookings: 820, trend: '+11%' },
  { name: 'Strength', popularity: 88, bookings: 1510, trend: '+27%' },
]

function useScrollScrubVideo() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let frame = 0

    const updateScrollVideo = () => {
      if (frame) {
        return
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0
        const section = sectionRef.current
        const video = videoRef.current

        if (!section || !video) {
          return
        }

        const rect = section.getBoundingClientRect()
        const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1)
        const rawProgress = Math.min(Math.max(-rect.top / scrollable, 0), 1)

        setProgress(rawProgress)

        if (video.duration && Number.isFinite(video.duration)) {
          const targetTime = rawProgress * Math.max(video.duration - 0.05, 0)

          if (Math.abs(video.currentTime - targetTime) > 0.035) {
            video.currentTime = targetTime
          }
        }
      })
    }

    updateScrollVideo()
    window.addEventListener('scroll', updateScrollVideo, { passive: true })
    window.addEventListener('resize', updateScrollVideo)

    return () => {
      window.removeEventListener('scroll', updateScrollVideo)
      window.removeEventListener('resize', updateScrollVideo)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  return { sectionRef, videoRef, progress, isReady, setIsReady }
}

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setIsVisible(true)
        observer.disconnect()
      },
      {
        rootMargin: '0px 0px -14% 0px',
        threshold: 0.18,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return [ref, isVisible] as const
}

function App() {
  const heroScrub = useScrollScrubVideo()
  const [creditGridRef, isCreditGridVisible] = useScrollReveal<HTMLDivElement>()
  const [activityGridRef, isActivityGridVisible] = useScrollReveal<HTMLDivElement>()
  const {
    sectionRef: heroSectionRef,
    videoRef: heroVideoRef,
    progress: heroProgress,
    isReady: isHeroReady,
    setIsReady: setIsHeroReady,
  } = heroScrub
  const activeStep = useMemo(() => {
    return Math.min(storySteps.length - 1, Math.floor(heroProgress * storySteps.length))
  }, [heroProgress])

  const progressPercent = `${Math.round(heroProgress * 100)}%`
  const markHeroVideoReady = () => {
    setIsHeroReady(true)

    const video = heroVideoRef.current

    if (!video) {
      return
    }

    video.muted = true
    video.playsInline = true

    void video
      .play()
      .then(() => video.pause())
      .catch(() => undefined)
  }

  return (
    <main className="landing">
      <nav className="nav">
        <a className="brand" href="#top" aria-label="AnySpot home">
          <span className="brand-mark" aria-hidden="true">
            <img src={brandIcon} alt="" />
          </span>
          <span>AnySpot</span>
        </a>
        <div className="nav-links" aria-label="Primary navigation">
          <a href="#credits">Credits</a>
          <a href="#gyms">For gyms</a>
          <a href="#dashboards">Dashboards</a>
          <a href="#waitlist">Waitlist</a>
        </div>
        <a className="nav-cta" href="#waitlist">
          Join waitlist
        </a>
      </nav>

      <section className="scroll-cinema" id="top" ref={heroSectionRef}>
        <div className="cinema-sticky">
          <video
            ref={heroVideoRef}
            className={`hero-video ${isHeroReady ? 'is-ready' : ''}`}
            src={heroVideo}
            muted
            playsInline
            preload="auto"
            onCanPlay={markHeroVideoReady}
            onLoadedData={markHeroVideoReady}
            onLoadedMetadata={markHeroVideoReady}
            aria-label="AnySpot cinematic fitness preview"
          />
          <div className="video-overlay" />
          <div className="orange-glow" />

          <div className="hero-copy">
            <p className="kicker">Czech fitness marketplace</p>
            <h1>Flexible fitness access. Fair payouts for local studios.</h1>
            <p className="hero-lede">
              AnySpot is a modern fitness marketplace and booking operating
              system for boutique gyms, trainers, and fitness spaces.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#classes">
                Find your next class
              </a>
              <a className="button secondary" href="#gyms">
                Partner with us
              </a>
            </div>
          </div>

          <div className="scroll-panel" aria-live="polite">
            <span>{storySteps[activeStep].eyebrow}</span>
            <strong>{storySteps[activeStep].title}</strong>
            <p>{storySteps[activeStep].body}</p>
          </div>

          <div className="scroll-meter" aria-hidden="true">
            <div style={{ width: progressPercent }} />
          </div>
        </div>
      </section>

      <section className="section intro" id="credits">
        <div>
          <p className="section-kicker">How credits work</p>
          <h2>One balance. Many ways to train.</h2>
        </div>
        <div
          ref={creditGridRef}
          className={`credit-grid reveal-grid ${isCreditGridVisible ? 'is-visible' : ''}`}
        >
          <article style={{ '--item-index': 0 } as CSSProperties}>
            <span>01</span>
            <h3>Buy credits</h3>
            <p>Choose a pack in CZK and keep full control over your fitness budget.</p>
          </article>
          <article style={{ '--item-index': 1 } as CSSProperties}>
            <span>02</span>
            <h3>Book instantly</h3>
            <p>Use credits for yoga, padel, pilates, strength, cycling, and more.</p>
          </article>
          <article style={{ '--item-index': 2 } as CSSProperties}>
            <span>03</span>
            <h3>Studios earn fairly</h3>
            <p>Gyms receive around 85 percent per completed visit in the initial model.</p>
          </article>
        </div>
      </section>

      <section className="card-showcase" id="gyms">
        <div className="card-showcase-inner">
          <div className="card-copy">
            <p className="section-kicker">For gyms and studios</p>
            <h2>Membership cards that feel as premium as the studios behind them.</h2>
            <p>
              AnySpot can present credits as a cinematic pass: flexible for users,
              fair for gyms, and ready to become a real wallet, booking, and payout layer.
            </p>
            <div className="gym-value-pills" aria-label="Gym value highlights">
              <span>85% gym payout model</span>
              <span>14-day payouts</span>
              <span>Credit wallet ready</span>
            </div>
          </div>

          <div className="single-card-stage" aria-label="AnySpot premium membership card">
            <img src={goldenCardIntro} alt="AnySpot golden premium membership card" />
          </div>
        </div>
      </section>

      <section className="section" id="classes">
        <div className="section-heading">
          <p className="section-kicker">Featured activities</p>
          <h2>Built for the way people actually move around a city.</h2>
        </div>
        <div
          ref={activityGridRef}
          className={`activity-grid reveal-grid ${isActivityGridVisible ? 'is-visible' : ''}`}
        >
          {activities.map((activity, index) => (
            <a
              href="#waitlist"
              key={activity.name}
              style={
                {
                  '--item-index': index,
                  '--popularity': `${activity.popularity}%`,
                } as CSSProperties
              }
            >
              <span className="activity-name">{activity.name}</span>
              <span className="activity-number">
                <AnimatedNumber value={activity.bookings} /> bookings
              </span>
              <span className="activity-trend">{activity.trend} demand</span>
              <span className="activity-fill" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="waitlist" id="waitlist">
        <img className="waitlist-logo" src={brandLogo} alt="AnySpot" />
        <p className="section-kicker">Early access</p>
        <h2>Be first when AnySpot opens partner testing in Czechia.</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const form = event.currentTarget
            form.classList.add('is-submitted')
          }}
        >
          <input type="email" placeholder="you@example.com" aria-label="Email address" required />
          <button type="submit">Join waitlist</button>
        </form>
        <p className="form-success">You are on the list. Nice.</p>
      </section>

      <Dashboards brandIcon={brandIcon} />
    </main>
  )
}

function AnimatedNumber({ value }: { value: number }) {
  const numberRef = useRef<HTMLSpanElement | null>(null)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const element = numberRef.current

    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        const start = performance.now()
        const duration = 1100

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplayValue(Math.round(value * eased))

          if (progress < 1) {
            window.requestAnimationFrame(tick)
          }
        }

        window.requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [value])

  return <span ref={numberRef}>{displayValue.toLocaleString('cs-CZ')}</span>
}

export default App
