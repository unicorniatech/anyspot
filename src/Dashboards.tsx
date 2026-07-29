import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { localStorageDriver, redisReadyDriverNotes } from './mockBackend/persistence'
import type { AnySpotMockState, FitnessClass, Gym, Payout, Role } from './mockBackend/types'

gsap.registerPlugin(ScrollTrigger)

const roles: { id: Role; label: string; description: string; scope: string }[] = [
  {
    id: 'user',
    label: 'User',
    description: 'Credits, bookings, recommendations',
    scope: 'Consumer app',
  },
  {
    id: 'reception',
    label: 'Reception',
    description: 'Check-ins and front desk capacity',
    scope: 'Studio front desk',
  },
  {
    id: 'management',
    label: 'Management',
    description: 'Classes, revenue, subscription value',
    scope: 'Gym operator',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Marketplace operations',
    scope: 'AnySpot ops',
  },
  {
    id: 'superadmin',
    label: 'Superadmin',
    description: 'Founder controls and system model',
    scope: 'Founder console',
  },
]

const roleAiInsights: Record<Role, string> = {
  user: 'AI studies goals, training load, recovery, and preferred locations before suggesting the next class.',
  reception: 'AI highlights late arrivals, check-in bottlenecks, no-show risk, and open capacity in real time.',
  management: 'AI recommends class times, content prompts, staffing moves, and revenue opportunities.',
  admin: 'AI summarizes partner risk, launch supply gaps, approvals, and city-level demand.',
  superadmin: 'AI watches the operating model, subscription settings, privacy boundaries, and infrastructure health.',
}

const aiDashboardCards = [
  {
    title: 'Booking intelligence',
    metric: '92%',
    body: 'Predicted fit between capacity, trainer availability, local demand, and user goals.',
  },
  {
    title: 'AI content studio',
    metric: '18',
    body: 'Draft class posts, trainer spotlights, onboarding notes, and campaign ideas from schedule data.',
  },
  {
    title: 'Privacy posture',
    metric: 'Local',
    body: 'Sensitive operational state can stay close to the studio before syncing to the cloud layer.',
  },
  {
    title: 'Action report',
    metric: '4 min',
    body: 'Mock assistant turns bookings, check-ins, and revenue signals into a plain-language summary.',
  },
]

const aiCommandLines = [
  'Analyzing Karlin evening capacity...',
  'Drafting studio content for Reformer Flow...',
  'Matching clients by goal, intensity, and recovery window...',
  'Checking privacy boundary before report export...',
]

const formatCzk = (amount: number) =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount)

type DashboardsProps = {
  brandIcon: string
}

export function Dashboards({ brandIcon }: DashboardsProps) {
  const [state, setState] = useState<AnySpotMockState | null>(null)
  const [activeRole, setActiveRole] = useState<Role>('user')
  const [isSaving, setIsSaving] = useState(false)
  const dashboardRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    void localStorageDriver.read().then(setState)
  }, [])

  const persist = (updater: (draft: AnySpotMockState) => AnySpotMockState) => {
    if (!state) {
      return
    }

    const next = updater(structuredClone(state))
    setState(next)
    setIsSaving(true)
    void localStorageDriver.write(next).finally(() => {
      window.setTimeout(() => setIsSaving(false), 350)
    })
  }

  const resetWorkspace = () => {
    void localStorageDriver.reset().then(setState)
  }

  useEffect(() => {
    if (!state || !dashboardRef.current) {
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set('.ai-dashboard-card, .dashboard-card, .metric-card, .role-tabs button', {
          clearProps: 'all',
          opacity: 1,
        })

        return
      }

      gsap.fromTo(
        '.ai-dashboard-card',
        { opacity: 0, y: 36, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.82,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '.ai-dashboard-grid',
            start: 'top 82%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.metric-card, .role-tabs button, .dashboard-card',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.54,
          ease: 'power2.out',
          stagger: 0.035,
        },
      )

      gsap.to('.ai-orbit-ring', {
        rotate: 360,
        duration: 18,
        ease: 'none',
        repeat: -1,
      })

      gsap.to('.ai-pulse-core', {
        scale: 1.08,
        opacity: 0.72,
        duration: 1.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, dashboardRef)

    return () => context.revert()
  }, [activeRole, state])

  const metrics = useMemo(() => {
    if (!state) {
      return []
    }

    const totalBookings = state.gyms.reduce((sum, gym) => sum + gym.monthlyBookings, 0)
    const studioRevenue = state.gyms.reduce((sum, gym) => sum + gym.payoutDueCzk, 0)
    const activeGyms = state.gyms.filter((gym) => gym.status === 'active').length

    return [
      { label: 'Active gyms', value: activeGyms.toString() },
      { label: 'Monthly bookings', value: totalBookings.toLocaleString('cs-CZ') },
      { label: 'Studio revenue tracked', value: formatCzk(studioRevenue) },
      { label: 'Transaction fee', value: `${state.platformSettings.transactionFeePercent}%` },
    ]
  }, [state])

  const activeRoleMeta = roles.find((role) => role.id === activeRole) ?? roles[0]

  if (!state) {
    return (
      <section className="dashboard-shell" id="dashboards">
        <p className="section-kicker">Mock backend</p>
        <h2>Loading local workspace...</h2>
      </section>
    )
  }

  return (
    <section ref={dashboardRef} className="dashboard-shell" id="dashboards">
      <div className="dashboard-header">
        <div>
          <h2>Role dashboards with local persistence.</h2>
          <p>
            A cinematic mock backend for the demo: AI assistance, role workspaces, local
            persistence, privacy boundaries, and hyperlocal infrastructure concepts in one surface.
          </p>
        </div>
        <div className="persistence-card">
          <img src={brandIcon} alt="" />
          <span>{isSaving ? 'Saving locally...' : 'Local state persisted'}</span>
          <button type="button" onClick={resetWorkspace}>
            Reset demo data
          </button>
        </div>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card reveal-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="ai-dashboard-grid">
        <article className="ai-dashboard-card ai-dashboard-card-large">
          <div>
            <span>AI operating layer</span>
            <h3>One assistant across bookings, reports, content, and class recommendations.</h3>
          </div>
          <div className="ai-orbit-stage" aria-hidden="true">
            <i className="ai-orbit-ring" />
            <i className="ai-orbit-ring ai-orbit-ring-offset" />
            <b className="ai-pulse-core" />
          </div>
        </article>

        {aiDashboardCards.slice(0, 2).map((card) => (
          <article className="ai-dashboard-card ai-dashboard-card-stat" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.metric}</strong>
            <p>{card.body}</p>
          </article>
        ))}

        <article className="ai-dashboard-card ai-command-card">
          <span>Live command mock</span>
          <div className="ai-command-lines">
            {aiCommandLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </article>

        {aiDashboardCards.slice(2).map((card) => (
          <article className="ai-dashboard-card ai-dashboard-card-stat" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.metric}</strong>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      <div className="role-section-map" aria-label="Role workspace map">
        {roles.map((role, index) => (
          <button
            type="button"
            className={activeRole === role.id ? 'is-active' : ''}
            key={role.id}
            onClick={() => setActiveRole(role.id)}
          >
            <span>0{index + 1}</span>
            <strong>{role.label}</strong>
            <small>{role.scope}</small>
          </button>
        ))}
      </div>

      <div className="role-tabs" aria-label="Dashboard role selector">
        {roles.map((role) => (
          <button
            className={activeRole === role.id ? 'is-active' : ''}
            type="button"
            key={role.id}
            onClick={() => setActiveRole(role.id)}
          >
            <strong>{role.label}</strong>
            <span>{role.description}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-panel" key={activeRole}>
        <div className="role-workspace-header">
          <span>{activeRoleMeta.scope}</span>
          <h3>{activeRoleMeta.label} dashboard</h3>
          <p>{activeRoleMeta.description}</p>
          <div className="role-ai-note">
            <strong>AI layer</strong>
            <span>{roleAiInsights[activeRole]}</span>
          </div>
        </div>
        {activeRole === 'user' && <UserDashboard state={state} persist={persist} />}
        {activeRole === 'reception' && <ReceptionDashboard state={state} persist={persist} />}
        {activeRole === 'management' && <ManagementDashboard state={state} persist={persist} />}
        {activeRole === 'admin' && <AdminDashboard state={state} persist={persist} />}
        {activeRole === 'superadmin' && <SuperadminDashboard state={state} persist={persist} />}
      </div>
    </section>
  )
}

function UserDashboard({
  state,
  persist,
}: {
  state: AnySpotMockState
  persist: (updater: (draft: AnySpotMockState) => AnySpotMockState) => void
}) {
  const [assistantMode, setAssistantMode] = useState<'ready' | 'analyzing' | 'applied' | 'alternatives' | 'chat'>('ready')
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [actionMessage, setActionMessage] = useState('AI plan ready for review.')
  const [trainingPlan, setTrainingPlan] = useState([
    { label: 'Strength', value: 80 },
    { label: 'Mobility', value: 54 },
    { label: 'Recovery', value: 38 },
  ])
  const user = state.users.find((candidate) => candidate.role === 'user')
  const upcoming = state.bookings
    .filter((booking) => booking.userId === user?.id)
    .map((booking) => ({
      booking,
      fitnessClass: state.classes.find((classItem) => classItem.id === booking.classId),
    }))

  const bookClass = (fitnessClass: FitnessClass) => {
    if (!user || user.creditsBalance < fitnessClass.creditsRequired) {
      setActionMessage('Add credits before booking this class.')
      return
    }

    persist((draft) => {
      const draftUser = draft.users.find((candidate) => candidate.id === user.id)
      const draftClass = draft.classes.find((candidate) => candidate.id === fitnessClass.id)

      if (draftUser && draftClass) {
        draftUser.creditsBalance -= draftClass.creditsRequired
        draftClass.bookedCount += 1
        draft.bookings.push({
          id: `book_${Date.now()}`,
          userId: draftUser.id,
          classId: draftClass.id,
          customerName: draftUser.name,
          checkedIn: false,
          status: 'confirmed',
        })
      }

      return draft
    })
    setActionMessage(`${fitnessClass.title} booked and added to upcoming classes.`)
    setAssistantMode('applied')
  }

  const addCredits = (credits: number, label = `Added ${credits} credits`) => {
    if (!user) {
      return
    }

    persist((draft) => {
      const draftUser = draft.users.find((candidate) => candidate.id === user.id)

      if (draftUser) {
        draftUser.creditsBalance += credits
      }

      return draft
    })
    setActionMessage(`${label}. Wallet updated for this session.`)
    setAssistantMode('ready')
  }

  const runAssistantAction = (mode: 'applied' | 'alternatives' | 'chat') => {
    setAssistantMode('analyzing')
    setActionMessage('AI is checking your goal, credits, bookings, and recovery window...')

    window.setTimeout(() => {
      setAssistantMode(mode)

      if (mode === 'applied') {
        setTrainingPlan([
          { label: 'Strength', value: 88 },
          { label: 'Mobility', value: 62 },
          { label: 'Recovery', value: 46 },
        ])
        setActionMessage('Plan applied: strength priority increased, recovery protected for Friday.')
        return
      }

      if (mode === 'alternatives') {
        setTrainingPlan([
          { label: 'Pilates', value: 72 },
          { label: 'Padel', value: 58 },
          { label: 'Recovery', value: 52 },
        ])
        setActionMessage('Generated alternatives: Pilates tomorrow, padel Saturday, recovery Friday.')
        return
      }

      setActionMessage('Assistant ready: ask about goals, soreness, time slots, or class intensity.')
    }, 900)
  }

  return (
    <div className="dashboard-grid">
      <DashboardCard title="Wallet">
        <div className="big-number">{user?.creditsBalance ?? 0} credits</div>
        <p>Persistent demo balance. Book a class and refresh the page to see it stay saved.</p>
      </DashboardCard>
      <DashboardCard title="Upcoming bookings">
        <List>
          {upcoming.map(({ booking, fitnessClass }) => (
            <li key={booking.id}>
              <strong>{fitnessClass?.title}</strong>
              <span>
                {fitnessClass?.startsAt} · {booking.checkedIn ? 'Checked in' : 'Confirmed'}
              </span>
            </li>
          ))}
        </List>
      </DashboardCard>
      <DashboardCard title="AI training assistant" wide accent>
        <AiTrainingAssistant
          actionMessage={actionMessage}
          mode={assistantMode}
          onApplyPlan={() => runAssistantAction('applied')}
          onAskAssistant={() => runAssistantAction('chat')}
          onChangeDetails={() => setIsGoalModalOpen(true)}
          onGenerateAlternatives={() => runAssistantAction('alternatives')}
        />
      </DashboardCard>
      <DashboardCard title="Weekly training plan">
        <MiniBars items={trainingPlan} />
      </DashboardCard>
      <DashboardCard title="Credit packages">
        <div className="package-stack">
          <button type="button" onClick={() => addCredits(5)}>Add 5 credits</button>
          <button type="button" onClick={() => addCredits(12)}>Add 12 credits</button>
          <button type="button" onClick={() => addCredits(25, 'Mock checkout complete')}>Mock checkout</button>
        </div>
        <p className="dashboard-action-message">{actionMessage}</p>
      </DashboardCard>
      <DashboardCard title="Bookable classes" wide>
        <div className="class-row-list">
          {state.classes.map((fitnessClass) => (
            <ClassRow key={fitnessClass.id} fitnessClass={fitnessClass}>
              <button
                type="button"
                onClick={() => bookClass(fitnessClass)}
                disabled={!user || user.creditsBalance < fitnessClass.creditsRequired}
              >
                Book
              </button>
            </ClassRow>
          ))}
        </div>
      </DashboardCard>
      {isGoalModalOpen && (
        <AiGoalModal
          onClose={() => setIsGoalModalOpen(false)}
          onSave={() => {
            setIsGoalModalOpen(false)
            runAssistantAction('alternatives')
          }}
        />
      )}
    </div>
  )
}

function ReceptionDashboard({
  state,
  persist,
}: {
  state: AnySpotMockState
  persist: (updater: (draft: AnySpotMockState) => AnySpotMockState) => void
}) {
  const toggleCheckIn = (bookingId: string) => {
    persist((draft) => {
      const booking = draft.bookings.find((candidate) => candidate.id === bookingId)

      if (booking) {
        booking.checkedIn = !booking.checkedIn
        booking.status = booking.checkedIn ? 'completed' : 'confirmed'
      }

      return draft
    })
  }

  const addWalkIn = () => {
    persist((draft) => {
      const targetClass = draft.classes[0]

      if (targetClass) {
        targetClass.bookedCount += 1
        draft.bookings.push({
          id: `book_walkin_${Date.now()}`,
          userId: 'usr_walkin',
          classId: targetClass.id,
          customerName: 'Walk-in guest',
          checkedIn: true,
          status: 'completed',
        })
      }

      return draft
    })
  }

  return (
    <div className="dashboard-grid">
      <DashboardCard title="Reception command">
        <div className="big-number">
          {state.bookings.filter((booking) => !booking.checkedIn).length} pending
        </div>
        <button type="button" onClick={addWalkIn}>
          Add walk-in
        </button>
      </DashboardCard>
      <DashboardCard title="Today pulse">
        <MiniBars
          items={[
            { label: 'Arrived', value: 72 },
            { label: 'No-show risk', value: 18 },
            { label: 'Open capacity', value: 31 },
          ]}
        />
      </DashboardCard>
      <DashboardCard title="Front desk queue" wide>
        <div className="table-list">
          {state.bookings.map((booking) => {
            const fitnessClass = state.classes.find((classItem) => classItem.id === booking.classId)

            return (
              <div className="table-row" key={booking.id}>
                <div>
                  <strong>{booking.customerName}</strong>
                  <span>{fitnessClass?.title} · {fitnessClass?.startsAt}</span>
                </div>
                <button type="button" onClick={() => toggleCheckIn(booking.id)}>
                  {booking.checkedIn ? 'Undo check-in' : 'Check in'}
                </button>
              </div>
            )
          })}
        </div>
      </DashboardCard>
      <DashboardCard title="Capacity monitor" wide>
        <div className="class-row-list">
          {state.classes.map((fitnessClass) => (
            <ClassRow key={fitnessClass.id} fitnessClass={fitnessClass} />
          ))}
        </div>
      </DashboardCard>
    </div>
  )
}

function ManagementDashboard({
  state,
  persist,
}: {
  state: AnySpotMockState
  persist: (updater: (draft: AnySpotMockState) => AnySpotMockState) => void
}) {
  const addClass = () => {
    persist((draft) => {
      draft.classes.push({
        id: `cls_${Date.now()}`,
        gymId: 'gym_pulse',
        title: 'New Schedule Test',
        trainer: 'Team',
        startsAt: 'Next week, 18:30',
        capacity: 12,
        bookedCount: 0,
        creditsRequired: 4,
        status: 'scheduled',
      })
      draft.auditEvents.unshift({
        id: `audit_${Date.now()}`,
        actor: 'Studio Manager',
        action: 'Created a mock class from management dashboard',
        createdAt: 'Just now',
      })
      return draft
    })
  }

  return (
    <div className="dashboard-grid">
      <DashboardCard title="Revenue estimate">
        <div className="big-number">
          {formatCzk(state.gyms.reduce((sum, gym) => sum + gym.payoutDueCzk, 0))}
        </div>
        <p>Tracked studio-side booking revenue. AnySpot does not take a transaction fee.</p>
      </DashboardCard>
      <DashboardCard title="AI schedule optimization" accent>
        <p>
          Detect under-filled time slots, recommend class times, draft campaign ideas,
          and simulate credit demand before publishing.
        </p>
      </DashboardCard>
      <DashboardCard title="Demand heatmap">
        <MiniBars
          items={[
            { label: 'Morning', value: 46 },
            { label: 'Lunch', value: 63 },
            { label: 'Evening', value: 91 },
          ]}
        />
      </DashboardCard>
      <DashboardCard title="Revenue health">
        <PayoutList payouts={state.payouts} gyms={state.gyms} />
      </DashboardCard>
      <DashboardCard title="Class management" wide>
        <button className="panel-action" type="button" onClick={addClass}>
          Add mock class
        </button>
        <div className="class-row-list">
          {state.classes.map((fitnessClass) => (
            <ClassRow key={fitnessClass.id} fitnessClass={fitnessClass} />
          ))}
        </div>
      </DashboardCard>
    </div>
  )
}

function AdminDashboard({
  state,
  persist,
}: {
  state: AnySpotMockState
  persist: (updater: (draft: AnySpotMockState) => AnySpotMockState) => void
}) {
  const approveGym = (gymId: string) => {
    persist((draft) => {
      const gym = draft.gyms.find((candidate) => candidate.id === gymId)

      if (gym) {
        gym.status = 'active'
        draft.auditEvents.unshift({
          id: `audit_${Date.now()}`,
          actor: 'Marketplace Admin',
          action: `Approved ${gym.name}`,
          createdAt: 'Just now',
        })
      }

      return draft
    })
  }

  return (
    <div className="dashboard-grid">
      <DashboardCard title="Marketplace health">
        <MiniBars
          items={[
            { label: 'Supply', value: 67 },
            { label: 'Demand', value: 82 },
            { label: 'Approvals', value: 41 },
          ]}
        />
      </DashboardCard>
      <DashboardCard title="Risk queue">
        <List>
          <li>
            <strong>Nova Barre needs onboarding</strong>
            <span>Missing subscription setup and class capacity rules</span>
          </li>
          <li>
            <strong>Karlin evenings near full</strong>
            <span>Potential expansion slot at 19:30</span>
          </li>
        </List>
      </DashboardCard>
      <DashboardCard title="Partner approvals" wide>
        <div className="table-list">
          {state.gyms.map((gym) => (
            <GymRow key={gym.id} gym={gym}>
              <button type="button" onClick={() => approveGym(gym.id)} disabled={gym.status === 'active'}>
                {gym.status === 'active' ? 'Active' : 'Approve'}
              </button>
            </GymRow>
          ))}
        </div>
      </DashboardCard>
      <DashboardCard title="Revenue operations" wide>
        <PayoutList payouts={state.payouts} gyms={state.gyms} />
      </DashboardCard>
    </div>
  )
}

function SuperadminDashboard({
  state,
  persist,
}: {
  state: AnySpotMockState
  persist: (updater: (draft: AnySpotMockState) => AnySpotMockState) => void
}) {
  const updateSubscription = (direction: 1 | -1) => {
    persist((draft) => {
      draft.platformSettings.monthlySubscriptionCzk = Math.min(
        8990,
        Math.max(990, draft.platformSettings.monthlySubscriptionCzk + direction * 250),
      )
      draft.auditEvents.unshift({
        id: `audit_${Date.now()}`,
        actor: 'Founder Control',
        action: `Changed monthly subscription to ${formatCzk(draft.platformSettings.monthlySubscriptionCzk)}`,
        createdAt: 'Just now',
      })
      return draft
    })
  }

  return (
    <div className="dashboard-grid">
      <DashboardCard title="Founder controls">
        <div className="setting-control">
          <span>Monthly studio subscription</span>
          <strong>{formatCzk(state.platformSettings.monthlySubscriptionCzk)}</strong>
          <div>
            <button type="button" onClick={() => updateSubscription(-1)}>
              -250
            </button>
            <button type="button" onClick={() => updateSubscription(1)}>
              +250
            </button>
          </div>
        </div>
        <p>Transaction fee stays fixed at {state.platformSettings.transactionFeePercent}%.</p>
      </DashboardCard>
      <DashboardCard title="Hyperlocal hardware plan">
        <p>
          {redisReadyDriverNotes.productionShape} The product direction adds resilient local
          hardware so studios are not paying endless cloud fees for every operational touch.
        </p>
      </DashboardCard>
      <DashboardCard title="Feature flags">
        <List>
          <li>
            <strong>Mock payments</strong>
            <span>Enabled for MVP checkout demos</span>
          </li>
          <li>
            <strong>AI recommendations</strong>
            <span>Placeholder UI only, no API calls yet</span>
          </li>
          <li>
            <strong>Redis cache</strong>
            <span>{state.platformSettings.redisCachePlanned ? 'Planned with local hardware boundary' : 'Off'}</span>
          </li>
        </List>
      </DashboardCard>
      <DashboardCard title="Audit log" wide>
        <List>
          {state.auditEvents.map((event) => (
            <li key={event.id}>
              <strong>{event.action}</strong>
              <span>{event.actor} · {event.createdAt}</span>
            </li>
          ))}
        </List>
      </DashboardCard>
    </div>
  )
}

function MiniBars({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div className="mini-bars">
      {items.map((item) => (
        <div key={item.label}>
          <span>
            {item.label}
            <strong>{item.value}%</strong>
          </span>
          <i>
            <b style={{ width: `${item.value}%` }} />
          </i>
        </div>
      ))}
    </div>
  )
}

function AiTrainingAssistant({
  actionMessage,
  mode,
  onApplyPlan,
  onAskAssistant,
  onChangeDetails,
  onGenerateAlternatives,
}: {
  actionMessage: string
  mode: 'ready' | 'analyzing' | 'applied' | 'alternatives' | 'chat'
  onApplyPlan: () => void
  onAskAssistant: () => void
  onChangeDetails: () => void
  onGenerateAlternatives: () => void
}) {
  const isAnalyzing = mode === 'analyzing'
  const insight =
    mode === 'alternatives'
      ? 'Alternative path created: lower intensity, more mobility, and a weekend social class.'
      : mode === 'applied'
        ? 'Plan applied: your next class mix now favors strength while protecting recovery.'
        : mode === 'chat'
          ? 'Assistant is ready to answer follow-up questions about soreness, goals, and class fit.'
          : 'Ready to optimize your week from goals, credits, location, and booking history.'

  return (
    <div className="ai-training-assistant">
      <div className="ai-training-main">
        <div className={`ai-loader-line ${isAnalyzing ? 'is-running' : 'is-complete'}`}>
          <span />
          <p>{isAnalyzing ? 'Analyzing goals, credits, intensity, and recovery window' : insight}</p>
        </div>
        <div>
          <span className="ai-mini-label">Current goal</span>
          <strong>Build strength without losing mobility</strong>
          <p>
            Your last two bookings were high-control sessions. This week should balance one
            strength class, one mobility session, and one lighter social activity.
          </p>
          <button className="text-action-button" type="button" onClick={onChangeDetails}>
            Change details
          </button>
        </div>
      </div>

      <div className="ai-advice-grid">
        <article>
          <span>Advice</span>
          <p>Keep intensity medium today. Your next hard class fits better tomorrow evening.</p>
        </article>
        <article>
          <span>Best match</span>
          <p>Ignite Strength at 18:00 uses 4 credits and still has 3 open spots.</p>
        </article>
        <article>
          <span>Action</span>
          <p>Book strength, save 5 credits for weekend padel, and add recovery on Friday.</p>
        </article>
      </div>

      <p className="assistant-session-note">{actionMessage}</p>
      <div className="ai-action-row">
        <button type="button" onClick={onApplyPlan}>Apply plan</button>
        <button type="button" onClick={onGenerateAlternatives}>Generate alternatives</button>
        <button type="button" onClick={onAskAssistant}>Ask assistant</button>
      </div>
    </div>
  )
}

function AiGoalModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="ai-goal-modal" role="dialog" aria-modal="true" aria-labelledby="ai-goal-title">
        <div>
          <span className="ai-mini-label">Personalization</span>
          <h3 id="ai-goal-title">Update the AI training brief</h3>
          <p>Mock inputs for the session. Saving regenerates the assistant plan locally.</p>
        </div>
        <div className="goal-form-grid">
          <label>
            <span>Main goal</span>
            <input defaultValue="Build strength without losing mobility" />
          </label>
          <label>
            <span>Preferred intensity</span>
            <select defaultValue="medium">
              <option value="low">Low recovery focus</option>
              <option value="medium">Medium balanced</option>
              <option value="high">High performance</option>
            </select>
          </label>
          <label>
            <span>Available days</span>
            <input defaultValue="Tuesday, Friday, Saturday" />
          </label>
          <label>
            <span>City area</span>
            <input defaultValue="Karlin and Smichov" />
          </label>
        </div>
        <div className="modal-action-row">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" onClick={onSave}>Save and regenerate</button>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({
  title,
  children,
  accent = false,
  wide = false,
}: {
  title: string
  children: ReactNode
  accent?: boolean
  wide?: boolean
}) {
  return (
    <article className={`dashboard-card reveal-card ${wide ? 'wide' : ''} ${accent ? 'accent' : ''}`}>
      <h3>{title}</h3>
      {children}
    </article>
  )
}

function List({ children }: { children: ReactNode }) {
  return <ul className="dashboard-list">{children}</ul>
}

function ClassRow({
  fitnessClass,
  children,
}: {
  fitnessClass: FitnessClass
  children?: ReactNode
}) {
  const fill = Math.round((fitnessClass.bookedCount / fitnessClass.capacity) * 100)

  return (
    <div className="class-row">
      <div>
        <strong>{fitnessClass.title}</strong>
        <span>
          {fitnessClass.trainer} · {fitnessClass.startsAt} · {fitnessClass.creditsRequired} credits
        </span>
      </div>
      <div className="capacity-pill">
        <span>{fitnessClass.bookedCount}/{fitnessClass.capacity}</span>
        <div>
          <i style={{ width: `${fill}%` }} />
        </div>
      </div>
      {children}
    </div>
  )
}

function GymRow({
  gym,
  children,
}: {
  gym: Gym
  children?: ReactNode
}) {
  return (
    <div className="table-row">
      <div>
        <strong>{gym.name}</strong>
        <span>
          {gym.city} · {gym.status} · {gym.monthlyBookings} bookings
        </span>
      </div>
      {children}
    </div>
  )
}

function PayoutList({ payouts, gyms }: { payouts: Payout[]; gyms: Gym[] }) {
  return (
    <div className="table-list">
      {payouts.map((payout) => {
        const gym = gyms.find((candidate) => candidate.id === payout.gymId)

        return (
          <div className="table-row" key={payout.id}>
            <div>
              <strong>{gym?.name}</strong>
              <span>{payout.period} · revenue tracking · {payout.status}</span>
            </div>
            <strong>{formatCzk(payout.amountCzk)}</strong>
          </div>
        )
      })}
    </div>
  )
}
