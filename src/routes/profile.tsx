import { useState } from 'react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { BriefcaseBusiness, ShieldCheck, UserRound } from 'lucide-react'

import { getCurrentAppUser } from '@/lib/auth.functions'
import { getMyProfile, updateMyProfile } from '@/server/profile.functions'

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser()

    if (!appUser) {
      throw redirect({ to: '/login' })
    }
  },
  loader: () => getMyProfile(),
  component: ProfilePage,
})

function ProfilePage() {
  const profile = Route.useLoaderData()
  const employee = profile.employee
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    phone: employee?.phone ?? '',
    dateOfBirth: employee?.dateOfBirth ?? '',
    gender: employee?.gender ?? '',
    address: employee?.address ?? '',
  })

  function handleCancel() {
    setFormData({
      firstName: employee?.firstName ?? '',
      lastName: employee?.lastName ?? '',
      phone: employee?.phone ?? '',
      dateOfBirth: employee?.dateOfBirth ?? '',
      gender: employee?.gender ?? '',
      address: employee?.address ?? '',
    })

    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateMyProfile({
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
        },
      })

      setSuccess('Profile updated successfully!')
      setIsEditing(false)

      await router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const isAdmin = profile.account.role === 'ADMIN'

  return (
    <main className="page-wrap profile-page space-y-6 px-4 py-8 sm:py-10">
      <header className="profile-hero island-shell flex flex-col gap-5 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <div className="profile-avatar flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg sm:h-16 sm:w-16">
            <UserRound aria-hidden="true" size={30} />
          </div>
          <div>
            <p className="island-kicker mb-1">Account & personal details</p>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
              My Profile
            </h1>
            <p className="mb-0 mt-2 text-sm text-[var(--sea-ink-soft)] sm:text-base">
              View and manage your account and employee information.
            </p>
          </div>
        </div>

        <div className="profile-role-badge inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-[var(--sea-ink)]">
          {isAdmin ? (
            <ShieldCheck aria-hidden="true" size={17} />
          ) : (
            <BriefcaseBusiness aria-hidden="true" size={17} />
          )}
          {isAdmin ? 'Administrator' : 'Employee'}
        </div>
      </header>

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="profile-card island-shell rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <h2 className="m-0 text-xl font-bold text-[var(--sea-ink)]">
            Account Details
          </h2>
          <p className="mb-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
            Your sign-in and access information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProfileField label="Email" value={profile.account.email} />
          <ProfileField label="Role" value={profile.account.role} />
        </div>
      </section>

      {employee ? (
        <section className="profile-card island-shell rounded-2xl p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-xl font-bold text-[var(--sea-ink)]">
                Employee Details
              </h2>
              <p className="mb-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
                Your personal and employment information.
              </p>
            </div>

            {profile.account.role === 'EMPLOYEE' && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  setSuccess('')
                  setError('')
                  setIsEditing(true)
                }}
                className="brand-button rounded-lg px-5 py-2 text-sm font-semibold transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProfileInput
                  label="First Name"
                  value={formData.firstName}
                  onChange={(value) =>
                    setFormData({ ...formData, firstName: value })
                  }
                  required
                />

                <ProfileInput
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(value) =>
                    setFormData({ ...formData, lastName: value })
                  }
                />

                <ProfileInput
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                />

                <ProfileInput
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(value) =>
                    setFormData({ ...formData, dateOfBirth: value })
                  }
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--sea-ink)]">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value,
                      })
                    }
                    className="profile-input w-full rounded-lg border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-1 focus:ring-[var(--lagoon-deep)]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-[var(--sea-ink)]">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="profile-input w-full rounded-lg border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-1 focus:ring-[var(--lagoon-deep)]"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="brand-button rounded-lg px-5 py-2 text-sm font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProfileField
                label="Employee Code"
                value={employee.employeeCode}
              />
              <ProfileField
                label="Full Name"
                value={`${employee.firstName} ${employee.lastName ?? ''}`.trim()}
              />
              <ProfileField label="Email" value={employee.email} />
              <ProfileField label="Phone" value={employee.phone} />
              <ProfileField
                label="Date of Birth"
                value={employee.dateOfBirth}
              />
              <ProfileField label="Gender" value={employee.gender} />
              <ProfileField label="Joining Date" value={employee.joiningDate} />
              <ProfileField label="Salary" value={employee.salary} />
              <ProfileField label="Status" value={employee.status} />
              <ProfileField
                label="Address"
                value={employee.address}
                className="sm:col-span-2"
              />
              <ProfileField
                label="Department"
                value={employee.departmentName}
              />
              <ProfileField
                label="Designation"
                value={employee.designationTitle}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="profile-card island-shell flex items-start gap-4 rounded-2xl p-5 sm:p-7">
          <span className="profile-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white">
            <ShieldCheck aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="m-0 text-lg font-bold text-[var(--sea-ink)]">
              Administrator account
            </h2>
            <p className="mb-0 mt-1 text-sm leading-6 text-[var(--sea-ink-soft)]">
              No employee record is linked to this account. Your account details
              are shown above.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

function ProfileField({
  label,
  value,
  className = '',
}: {
  label: string
  value: string | number | null | undefined
  className?: string
}) {
  return (
    <div className={`profile-field min-w-0 rounded-xl px-4 py-3 ${className}`}>
      <p className="mb-0 text-xs font-semibold uppercase tracking-wide text-[var(--sea-ink-soft)]">
        {label}
      </p>
      <p className="mb-0 mt-1 break-words font-semibold text-[var(--sea-ink)]">
        {value || 'Not provided'}
      </p>
    </div>
  )
}

function ProfileInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--sea-ink)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="profile-input w-full rounded-lg border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-2 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-1 focus:ring-[var(--lagoon-deep)]"
      />
    </div>
  )
}
