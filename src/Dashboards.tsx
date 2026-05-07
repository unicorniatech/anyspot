import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { localStorageDriver, redisReadyDriverNotes } from './mockBackend/persistence'
import type { AnySpotMockState, FitnessClass, Gym, Payout, Role } from './mockBackend/types'

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
    description: 'Classes, revenue, payouts',
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

  const metrics = useMemo(() => {
    if (!state) {
      return []
    }

    const totalBookings = state.gyms.reduce((sum, gym) => sum + gym.monthlyBookings, 0)
    const payoutDue = state.payouts.reduce((sum, payout) => sum + payout.amountCzk, 0)
    const activeGyms = state.gyms.filter((gym) => gym.status === 'active').length

    return [
      { label: 'Active gyms', value: activeGyms.toString() },
      { label: 'Monthly bookings', value: totalBookings.toLocaleString('cs-CZ') },
      { label: 'Payout queue', value: formatCzk(payoutDue) },
      { label: 'Commission', value: `${state.platformSettings.commissionPercent}%` },
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
    <section className="dashboard-shell" id="dashboards">
      <div className="dashboard-header">
        <div>
          <p className="section-kicker">MVP backend mock</p>
          <h2>Role dashboards with local persistence.</h2>
          <p>
            This is still frontend-only, but the data is structured like a future backend:
            localStorage today, Supabase/Postgres as source of truth later, Redis for cache
            and fast operational state.
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
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
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
  const user = state.users.find((candidate) => candidate.role === 'user')
  const upcoming = state.bookings
    .filter((booking) => booking.userId === user?.id)
    .map((booking) => ({
      booking,
      fitnessClass: state.classes.find((classItem) => classItem.id === booking.classId),
    }))

  const bookClass = (fitnessClass: FitnessClass) => {
    if (!user || user.creditsBalance < fitnessClass.creditsRequired) {
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
  }

  const addCredits = (credits: number) => {
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
      <DashboardCard title="AI recommendation placeholder" wide>
        <p>
          Future OpenAI assistant: recommend classes from goals, location, schedule,
          previous bookings, credit budget, and recovery needs.
        </p>
      </DashboardCard>
      <DashboardCard title="Weekly training plan">
        <MiniBars
          items={[
            { label: 'Strength', value: 80 },
            { label: 'Mobility', value: 54 },
            { label: 'Recovery', value: 38 },
          ]}
        />
      </DashboardCard>
      <DashboardCard title="Credit packages">
        <div className="package-stack">
          <button type="button" onClick={() => addCredits(5)}>Add 5 credits</button>
          <button type="button" onClick={() => addCredits(12)}>Add 12 credits</button>
          <button type="button" onClick={() => addCredits(25)}>Mock checkout</button>
        </div>
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
        <p>Estimated studio payout for the current 14-day period.</p>
      </DashboardCard>
      <DashboardCard title="Schedule optimization">
        <p>
          Future AI concept: detect under-filled time slots, recommend class times,
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
      <DashboardCard title="Payout health">
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
            <span>Missing payout details and class capacity rules</span>
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
      <DashboardCard title="Payout operations" wide>
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
  const updateCommission = (direction: 1 | -1) => {
    persist((draft) => {
      draft.platformSettings.commissionPercent = Math.min(
        25,
        Math.max(5, draft.platformSettings.commissionPercent + direction),
      )
      draft.auditEvents.unshift({
        id: `audit_${Date.now()}`,
        actor: 'Founder Control',
        action: `Changed commission to ${draft.platformSettings.commissionPercent}%`,
        createdAt: 'Just now',
      })
      return draft
    })
  }

  return (
    <div className="dashboard-grid">
      <DashboardCard title="Founder controls">
        <div className="setting-control">
          <span>Platform commission</span>
          <strong>{state.platformSettings.commissionPercent}%</strong>
          <div>
            <button type="button" onClick={() => updateCommission(-1)}>
              -1
            </button>
            <button type="button" onClick={() => updateCommission(1)}>
              +1
            </button>
          </div>
        </div>
      </DashboardCard>
      <DashboardCard title="Redis-ready plan">
        <p>{redisReadyDriverNotes.productionShape}</p>
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
            <span>{state.platformSettings.redisCachePlanned ? 'Planned boundary' : 'Off'}</span>
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

function DashboardCard({
  title,
  children,
  wide = false,
}: {
  title: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <article className={`dashboard-card ${wide ? 'wide' : ''}`}>
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
              <span>{payout.period} · {payout.status}</span>
            </div>
            <strong>{formatCzk(payout.amountCzk)}</strong>
          </div>
        )
      })}
    </div>
  )
}
