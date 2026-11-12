import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'

import { addEmployee } from '@/server/employee.functions'
import { getDepartments } from '@/server/department.functions'
import { getDesignations } from '@/server/designation.functions'
import { getCurrentAppUser } from '@/lib/auth.functions'

export const Route = createFileRoute('/employees/new')({
  beforeLoad: async () => {
    const appUser = await getCurrentAppUser()

    if (!appUser) {
      throw redirect({ to: '/login' })
    }

    if (appUser.role !== 'ADMIN') {
      throw redirect({ to: '/dashboard' })
    }
  },

  loader: async () => {
    const [departments, designations] = await Promise.all([
      getDepartments(),
      getDesignations(),
    ])

    return { departments, designations }
  },

  component: NewEmployeePage,
})

function NewEmployeePage() {
  const navigate = useNavigate()
  const { departments, designations } = Route.useLoaderData()

  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    departmentId: '',
    designationId: '',
    joiningDate: '',
    salary: '',
    status: 'ACTIVE',
  })

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredDesignations = designations.filter(
    (designation) =>
      !form.departmentId || designation.departmentId === form.departmentId,
  )

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'departmentId' ? { designationId: '' } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await addEmployee({
        data: {
          ...form,
          phone: form.phone || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          address: form.address || undefined,
          departmentId: form.departmentId || undefined,
          designationId: form.designationId || undefined,
          salary: form.salary || undefined,
        },
      })

      await navigate({ to: '/employees' })
    } catch (err) {
      console.error(err)
      setError('Unable to add employee. Check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-2 focus:ring-[var(--lagoon)]/20'

  const labelClass = 'mb-2 block text-sm font-medium text-[var(--sea-ink)]'

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate({ to: '/employees' })}
            className="mb-4 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            ← Back to Employees
          </button>

          <h1 className="text-3xl font-bold text-[var(--sea-ink)]">
            Add New Employee
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the employee's personal and professional information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-5 shadow-sm sm:p-8"
        >
          {/* Personal Information */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[var(--sea-ink)]">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter residential address"
                  rows={3}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-[var(--chip-line)]" />

          {/* Professional Information */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-[var(--sea-ink)]">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Employee Code *</label>
                <input
                  name="employeeCode"
                  value={form.employeeCode}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter employee code"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Department</label>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Designation</label>
                <select
                  name="designationId"
                  value={form.designationId}
                  onChange={handleChange}
                  className={inputClass}
                  disabled={!filteredDesignations.length}
                >
                  <option value="">Select Designation</option>
                  {filteredDesignations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Joining Date *</label>
                <input
                  name="joiningDate"
                  type="date"
                  value={form.joiningDate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Salary</label>
                <input
                  name="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salary}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter salary"
                />
              </div>

              <div>
                <label className={labelClass}>Employment Status *</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </section>

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[var(--chip-line)] pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate({ to: '/employees' })}
              className="rounded-lg border border-[var(--chip-line)] px-6 py-3 font-medium text-[var(--sea-ink)] hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
