import { useEffect, useMemo, useRef, useState } from 'react'
import heroVideo from './assets/videos/anyspot-hero-video.mp4'
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

const activities = ['Yoga', 'Pilates', 'Barre', 'Padel', 'Cycling', 'Strength']

function App() {
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
        const scrollable = section.offsetHeight - window.innerHeight
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

  const activeStep = useMemo(() => {
    return Math.min(storySteps.length - 1, Math.floor(progress * storySteps.length))
  }, [progress])

  const progressPercent = `${Math.round(progress * 100)}%`

  return (
    <main className="landing">
      <nav className="nav">
        <a className="brand" href="#top" aria-label="AnySpot home">
          <span className="brand-mark">A</span>
          <span>AnySpot</span>
        </a>
        <div className="nav-links" aria-label="Primary navigation">
          <a href="#credits">Credits</a>
          <a href="#gyms">For gyms</a>
          <a href="#waitlist">Waitlist</a>
        </div>
        <a className="nav-cta" href="#waitlist">
          Join waitlist
        </a>
      </nav>

      <section className="scroll-cinema" id="top" ref={sectionRef}>
        <div className="cinema-sticky">
          <video
            ref={videoRef}
            className={`hero-video ${isReady ? 'is-ready' : ''}`}
            src={heroVideo}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={() => setIsReady(true)}
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
        <div className="credit-grid">
          <article>
            <span>01</span>
            <h3>Buy credits</h3>
            <p>Choose a pack in CZK and keep full control over your fitness budget.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Book instantly</h3>
            <p>Use credits for yoga, padel, pilates, strength, cycling, and more.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Studios earn fairly</h3>
            <p>Gyms receive around 85 percent per completed visit in the initial model.</p>
          </article>
        </div>
      </section>

      <section className="section split" id="gyms">
        <div className="split-copy">
          <p className="section-kicker">For gyms and studios</p>
          <h2>More than bookings. A fair operating layer for boutique fitness.</h2>
          <p>
            Manage reservations, class capacity, payouts, customer discovery,
            and schedule experiments without a long-term commitment.
          </p>
        </div>
        <div className="compare-card">
          <div>
            <span>Typical card payout</span>
            <strong>Low and opaque</strong>
          </div>
          <div>
            <span>AnySpot MVP model</span>
            <strong>Approx. 85% to the gym</strong>
          </div>
        </div>
      </section>

      <section className="section" id="classes">
        <div className="section-heading">
          <p className="section-kicker">Featured activities</p>
          <h2>Built for the way people actually move around a city.</h2>
        </div>
        <div className="activity-grid">
          {activities.map((activity) => (
            <a href="#waitlist" key={activity}>
              {activity}
            </a>
          ))}
        </div>
      </section>

      <section className="waitlist" id="waitlist">
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
    </main>
  )
}

export default App
