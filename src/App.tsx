import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Dashboards } from './Dashboards'
import brandIcon from './assets/brand/anyspot-icon-transparent.png'
import brandLogo from './assets/brand/anyspot-logo-transparent.png'
import goldenCardIntro from './assets/cards/golden-card-intro.png'
import heroVideo from './assets/videos/anyspotvideo2.mp4'
import './App.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type Page = 'home' | 'gyms' | 'clients' | 'appDemo'
type Audience = 'gym' | 'client'

const gymBenefits = [
  {
    title: 'Fill unused class capacity',
    body: 'Turn empty spots into paid visits without discounting your public prices.',
  },
  {
    title: 'Keep a fairer visit payout',
    body: 'The MVP model targets about 85% back to the studio on completed visits.',
  },
  {
    title: 'Run bookings from one place',
    body: 'Capacity, reservations, payouts, and schedule updates stay in one operating layer.',
  },
]

const clientBenefits = [
  {
    title: 'Tell us your city',
    body: 'We use demand to prioritize the first Czech launch areas.',
  },
  {
    title: 'Pick your training mood',
    body: 'Yoga today, padel next week, pilates when your schedule changes.',
  },
  {
    title: 'Book with credits',
    body: 'No long contract, no guessing, no calling three studios to find a slot.',
  },
]

const gymMetrics = [
  { value: '85%', label: 'target payout model' },
  { value: '14d', label: 'payout rhythm' },
  { value: '10', label: 'pilot studio spots' },
]

const operatingCards = [
  {
    title: 'Reservations',
    body: 'Front-desk visibility for who is booked, who arrived, and which spaces are still open.',
  },
  {
    title: 'Capacity',
    body: 'Protect regular members while opening only the spots you want to sell through AnySpot.',
  },
  {
    title: 'Payouts',
    body: 'A simple estimate of completed visits, commission, and upcoming payout windows.',
  },
  {
    title: 'Class calendar',
    body: 'Add sessions, edit trainers, and test new times before connecting the real backend.',
  },
  {
    title: 'New customers',
    body: 'Use marketplace demand to bring new people into quieter hours and first-visit offers.',
  },
  {
    title: 'Pilot analytics',
    body: 'See which activities, time slots, and neighborhoods are showing the strongest demand.',
  },
]

const cityCards = [
  'Prague yoga',
  'Brno pilates',
  'Ostrava strength',
  'Padel clubs',
  'Barre studios',
  'Cycling rooms',
]

function getPageFromPath(pathname: string): Page {
  if (pathname.startsWith('/app-demo')) {
    return 'appDemo'
  }

  if (pathname.startsWith('/gyms')) {
    return 'gyms'
  }

  if (pathname.startsWith('/clients')) {
    return 'clients'
  }

  return 'home'
}

function pathForPage(page: Page) {
  if (page === 'appDemo') {
    return '/app-demo'
  }

  if (page === 'gyms') {
    return '/gyms'
  }

  if (page === 'clients') {
    return '/clients'
  }

  return '/'
}

function App() {
  const [page, setPage] = useState<Page>(() => getPageFromPath(window.location.pathname))

  useEffect(() => {
    const syncRoute = () => setPage(getPageFromPath(window.location.pathname))

    window.addEventListener('popstate', syncRoute)

    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  const navigate = (nextPage: Page) => {
    const nextPath = pathForPage(nextPage)
    window.history.pushState({}, '', nextPath)
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <MotionShell page={page}>
      <Navigation page={page} navigate={navigate} />
      {page === 'home' && <ChooserPage navigate={navigate} />}
      {page === 'gyms' && <GymLanding />}
      {page === 'clients' && <ClientLanding />}
      {page === 'appDemo' && <AppDemoLanding />}
      <SiteFooter navigate={navigate} />
    </MotionShell>
  )
}

function MotionShell({ children, page }: { children: ReactNode; page: Page }) {
  const shellRef = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.fromTo(
        '.motion-hero',
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      )

      if (reduceMotion) {
        gsap.set('.reveal-card, .motion-image, .scrub-word, .float-loop', {
          clearProps: 'all',
          opacity: 1,
        })

        return
      }

      gsap.utils.toArray<HTMLElement>('.reveal-card').forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 42, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.82,
            ease: 'power3.out',
            delay: index * 0.04,
            scrollTrigger: {
              trigger: card,
              start: 'top 84%',
              once: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.motion-image').forEach((image) => {
        gsap.fromTo(
          image,
          { opacity: 0.42, scale: 0.86, filter: 'brightness(0.6)' },
          {
            opacity: 1,
            scale: 1,
            filter: 'brightness(1)',
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top 92%',
              end: 'bottom 20%',
              scrub: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.scrub-word').forEach((word) => {
        gsap.fromTo(
          word,
          { opacity: 0.14, y: 16 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: word,
              start: 'top 88%',
              end: 'top 48%',
              scrub: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.float-loop').forEach((element, index) => {
        gsap.to(element, {
          y: index % 2 === 0 ? -14 : 14,
          rotate: index % 2 === 0 ? -1.6 : 1.6,
          duration: 2.8 + index * 0.25,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })
    },
    { scope: shellRef, dependencies: [page], revertOnUpdate: true },
  )

  useEffect(() => {
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 80)

    return () => window.clearTimeout(refresh)
  }, [page])

  return (
    <main ref={shellRef} className={`site-shell page-${page}`}>
      {children}
    </main>
  )
}

function Navigation({ page, navigate }: { page: Page; navigate: (page: Page) => void }) {
  return (
    <nav className="top-nav">
      <button className="brand-link" type="button" onClick={() => navigate('home')}>
        <span className="brand-mark" aria-hidden="true">
          <img src={brandIcon} alt="" />
        </span>
        <span>AnySpot</span>
      </button>

      <div className="route-pill" aria-label="Audience navigation">
        <button className={page === 'gyms' ? 'is-active' : ''} type="button" onClick={() => navigate('gyms')}>
          For gyms
        </button>
        <button
          className={page === 'clients' ? 'is-active' : ''}
          type="button"
          onClick={() => navigate('clients')}
        >
          For clients
        </button>
        <button
          className={page === 'appDemo' ? 'is-active' : ''}
          type="button"
          onClick={() => navigate('appDemo')}
        >
          App demo
        </button>
      </div>

      <button
        className="nav-action"
        type="button"
        onClick={() => navigate(page === 'clients' ? 'gyms' : 'clients')}
      >
        {page === 'clients' ? 'I run a studio' : 'I want to train'}
      </button>
    </nav>
  )
}

function AppDemoLanding() {
  return (
    <div className="app-demo-page">
      <section className="app-demo-hero motion-hero">
        <video className="app-demo-video" src={heroVideo} muted playsInline autoPlay loop />
        <div className="app-demo-hero-overlay" />
        <div className="app-demo-copy">
          <p className="eyebrow">Product prototype</p>
          <h1>Marketplace, bookings, credits, and dashboards in one MVP demo.</h1>
          <p>
            This is the broader clickable prototype for showing how AnySpot can work as an app,
            marketplace, and operating layer after the landing-page journey.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="#demo-dashboards">
              View dashboards
            </a>
            <a className="secondary-cta" href="#demo-classes">
              Explore classes
            </a>
          </div>
        </div>
      </section>

      <section className="app-demo-section">
        <div className="section-copy">
          <h2>One credit wallet, multiple booking paths.</h2>
          <p>Use this page for investor, partner, or internal product walkthroughs.</p>
        </div>
        <div className="demo-flow-grid">
          <article className="reveal-card">
            <span>Buy credits</span>
            <p>Mock packages in CZK, ready for a Stripe flow later.</p>
          </article>
          <article className="reveal-card">
            <span>Book a class</span>
            <p>Class cards show time, trainer, capacity, and credits required.</p>
          </article>
          <article className="reveal-card">
            <span>Confirm visit</span>
            <p>Mock bookings persist locally and map cleanly to Supabase tables.</p>
          </article>
        </div>
      </section>

      <section className="app-demo-card-section">
        <div>
          <p className="eyebrow">Membership concept</p>
          <h2>Credits can feel as premium as a boutique studio pass.</h2>
          <p>
            The demo keeps the card concept visible without mixing it into the conversion-focused
            gym and client landing pages.
          </p>
        </div>
        <img src={goldenCardIntro} alt="AnySpot golden membership card concept" />
      </section>

      <section className="app-demo-section" id="demo-classes">
        <div className="section-copy">
          <h2>Activities users can discover.</h2>
          <p>Mock demand signals for the first Czech marketplace categories.</p>
        </div>
        <div className="demo-activity-grid">
          {cityCards.map((item) => (
            <article className="reveal-card" key={item}>
              <span>{item}</span>
              <p>Bookable with credits when partner supply is active.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-demo-waitlist">
        <img src={brandLogo} alt="AnySpot" />
        <h2>Use the split landing pages for acquisition. Use this page for the app demo.</h2>
        <div className="hero-actions">
          <a className="primary-cta" href="/gyms">
            Gym landing
          </a>
          <a className="secondary-cta" href="/clients">
            Client landing
          </a>
        </div>
      </section>

      <div id="demo-dashboards" className="app-demo-dashboard-wrap">
        <Dashboards brandIcon={brandIcon} />
      </div>
    </div>
  )
}

function ChooserPage({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <section className="chooser-hero motion-hero">
        <video className="ambient-video" src={heroVideo} muted playsInline autoPlay loop />
        <div className="hero-wash" />
        <div className="hero-center">
          <p className="eyebrow">One product, two focused journeys</p>
          <h1>Choose the AnySpot path built for you.</h1>
          <p className="hero-subtitle">
            Fitness clients and studio owners have different jobs to do. AnySpot separates the
            message, the forms, and the tracking from the first click.
          </p>
          <div className="chooser-actions">
            <button className="primary-cta" type="button" onClick={() => navigate('gyms')}>
              I am a studio or fitness center
            </button>
            <button className="secondary-cta" type="button" onClick={() => navigate('clients')}>
              I am looking for a studio
            </button>
          </div>
        </div>
      </section>

      <section className="audience-grid">
        <AudienceCard
          title="For gym owners"
          body="Lead with revenue, capacity, and a low-friction pilot. Built for outreach and partner ads."
          action="Open gym page"
          imageSeed="boutique-fitness-studio"
          onClick={() => navigate('gyms')}
        />
        <AudienceCard
          title="For clients"
          body="Lead with discovery, flexible credits, and a simple city waitlist. Built for demand generation."
          action="Open client page"
          imageSeed="pilates-yoga-class"
          onClick={() => navigate('clients')}
        />
      </section>
    </>
  )
}

function GymLanding() {
  return (
    <>
      <section className="split-hero gym-hero motion-hero">
        <div className="hero-text">
          <p className="eyebrow">For studio owners</p>
          <h1>
            Fill quiet class times without cutting your margin.
          </h1>
          <p>
            AnySpot helps boutique gyms, yoga studios, pilates rooms, padel clubs, and trainers
            bring in new clients while keeping a clearer, fairer payout model.
          </p>
          <div className="metric-row" aria-label="AnySpot studio pilot metrics">
            {gymMetrics.map((metric) => (
              <span className="metric-pill" key={metric.label}>
                <strong>{metric.value}</strong>
                <small>{metric.label}</small>
              </span>
            ))}
          </div>
          <div className="hero-actions">
            <a className="primary-cta" href="#gym-register">
              Register for a partner call
            </a>
            <a className="secondary-cta" href="#gym-benefits">
              See what we do
            </a>
          </div>
        </div>
        <div className="gold-card motion-image float-loop">
          <img src={goldenCardIntro} alt="AnySpot premium membership card" />
        </div>
      </section>

      <section className="proof-strip">
        <span>Pilot program</span>
        <strong>First 10 partner studios get 3 months of guided testing.</strong>
        <span>Prague and Czech launch cities</span>
      </section>

      <section className="benefit-section" id="gym-benefits">
        <div className="section-copy">
          <h2>What a studio owner needs to know first.</h2>
          <p>
            No diluted marketplace pitch. This page speaks to capacity, revenue quality, and a
            smoother operating layer.
          </p>
        </div>
        <div className="bento-grid gym-bento ops-bento">
          {gymBenefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
          <div className="large-bento reveal-card">
            <span>Approx. 85%</span>
            <h3>Target studio payout on completed MVP visits.</h3>
          </div>
          <div className="image-bento reveal-card motion-image" />
        </div>
      </section>

      <ScrollStatement
        words="Turn quiet hours into booked sessions, control capacity, see expected payouts, and learn which classes bring the right clients back."
      />

      <section className="operating-section">
        <div className="section-copy">
          <h2>A booking layer that can become your fitness operating system.</h2>
          <p>Start with discovery and reservations. Grow into payouts, schedules, and partner analytics.</p>
        </div>
        <div className="ops-grid">
          {operatingCards.map((item) => (
            <article className="ops-card reveal-card" key={item.title}>
              <span>{item.title}</span>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <WaitlistForm
        audience="gym"
        id="gym-register"
        title="Register your studio for the pilot conversation."
        body="Leave the basics and we will schedule a Zoom or in-person intro to understand your classes, pricing, capacity, and payout expectations."
        fields={[
          { name: 'name', label: 'Your name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'studioName', label: 'Studio name', type: 'text' },
        ]}
        buttonText="Request partner intro"
      />
    </>
  )
}

function ClientLanding() {
  return (
    <>
      <section className="client-hero client-hero-light motion-hero">
        <div className="hero-text">
          <p className="eyebrow">For people who train around real life</p>
          <h1>
            Find a studio that fits your week.
          </h1>
          <p>
            Join the AnySpot waitlist and help shape which studios, cities, and class types open first.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="#client-waitlist">
              Join client waitlist
            </a>
            <a className="secondary-cta" href="#client-benefits">
              How it works
            </a>
          </div>
        </div>
        <div className="client-phone-stage motion-image">
          <div className="phone-card float-loop">
            <span className="phone-topline">Tonight near you</span>
            <strong>Pilates Flow</strong>
            <p>Karlin, 18:30</p>
            <div className="credit-chip">6 credits</div>
          </div>
          <div className="phone-card phone-card-secondary float-loop">
            <span className="phone-topline">Recommended</span>
            <strong>Padel Club</strong>
            <p>Smichov, Saturday</p>
            <div className="credit-chip">8 credits</div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <span>Client waitlist</span>
        <strong>Be first when AnySpot opens flexible booking in Czech cities.</strong>
        <span>No long contract</span>
      </section>

      <section className="client-steps-section" id="client-benefits">
        <div className="section-copy">
          <h2>Three simple choices before you train.</h2>
          <p>AnySpot should feel closer to choosing a playlist than signing a contract.</p>
        </div>
        <div className="client-step-grid">
          {clientBenefits.map((benefit) => (
            <article className="client-step-card reveal-card" key={benefit.title}>
              <h3>{benefit.title}</h3>
              <p>{benefit.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="consumer-motion-section">
        <div className="consumer-image motion-image" />
        <ScrollStatement words="Search by city, class type, time, credits, trainer, and vibe. Keep your week flexible without choosing one studio forever." />
      </section>

      <section className="city-section">
        <div className="section-copy">
          <h2>Tell us what to bring to your city first.</h2>
          <p>Demand is tracked by city and activity, so launch supply can follow real interest.</p>
        </div>
        <div className="city-grid">
          {cityCards.map((item) => (
            <article className="city-card reveal-card" key={item}>
              <span>{item}</span>
            </article>
          ))}
        </div>
      </section>

      <WaitlistForm
        audience="client"
        id="client-waitlist"
        title="Join the client waitlist."
        body="Tell us where you train so we can prioritize the right studios and launch cities."
        fields={[
          { name: 'name', label: 'Your name', type: 'text' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'city', label: 'City', type: 'text' },
        ]}
        buttonText="Join waitlist"
      />
    </>
  )
}

function AudienceCard({
  action,
  body,
  imageSeed,
  onClick,
  title,
}: {
  action: string
  body: string
  imageSeed: string
  onClick: () => void
  title: string
}) {
  return (
    <button className="audience-card reveal-card" type="button" onClick={onClick}>
      <span
        className="audience-image"
        style={{ backgroundImage: `url(https://picsum.photos/seed/${imageSeed}/900/680)` }}
        aria-hidden="true"
      />
      <span className="audience-content">
        <strong>{title}</strong>
        <span>{body}</span>
        <em>{action}</em>
      </span>
    </button>
  )
}

function BenefitCard({ body, title }: { body: string; title: string }) {
  return (
    <article className="benefit-card reveal-card">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

function ScrollStatement({ words }: { words: string }) {
  const splitWords = useMemo(() => words.split(' '), [words])

  return (
    <section className="scrub-section" aria-label={words}>
      <p>
        {splitWords.map((word, index) => (
          <span className="scrub-word" key={`${word}-${index}`}>
            {word}
          </span>
        ))}
      </p>
    </section>
  )
}

function WaitlistForm({
  audience,
  body,
  buttonText,
  fields,
  id,
  title,
}: {
  audience: Audience
  body: string
  buttonText: string
  fields: Array<{ name: string; label: string; type: string }>
  id: string
  title: string
}) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const entry = {
      audience,
      createdAt: new Date().toISOString(),
      sourcePath: window.location.pathname,
      values: Object.fromEntries(formData.entries()),
    }
    const existing = window.localStorage.getItem('anyspot_waitlist_entries')
    const entries = existing ? (JSON.parse(existing) as Array<unknown>) : []

    window.localStorage.setItem('anyspot_waitlist_entries', JSON.stringify([...entries, entry]))
    setSubmitted(true)
    form.reset()
  }

  return (
    <section className="form-section" id={id}>
      <div className="form-copy">
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <form className="lead-form reveal-card" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <input name={field.name} type={field.type} required />
          </label>
        ))}
        <button className="primary-cta" type="submit">
          {buttonText}
        </button>
        <p className={`form-status ${submitted ? 'is-visible' : ''}`}>
          Saved locally for the MVP demo. We will connect this to Supabase later.
        </p>
      </form>
    </section>
  )
}

function SiteFooter({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <footer className="site-footer">
      <button className="brand-link" type="button" onClick={() => navigate('home')}>
        <span className="brand-mark" aria-hidden="true">
          <img src={brandIcon} alt="" />
        </span>
        <span>AnySpot</span>
      </button>
      <div>
        <button type="button" onClick={() => navigate('gyms')}>
          Gym landing
        </button>
        <button type="button" onClick={() => navigate('clients')}>
          Client landing
        </button>
        <button type="button" onClick={() => navigate('appDemo')}>
          App demo
        </button>
      </div>
    </footer>
  )
}

export default App
