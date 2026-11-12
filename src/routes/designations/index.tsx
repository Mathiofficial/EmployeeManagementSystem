import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { getCurrentAppUser } from '@/lib/auth.functions'
import { getDepartments } from '@/server/department.functions'
import {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
} from '@/server/designation.functions'

export const Route = createFileRoute('/designations/')({
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

  component: DesignationPage,
})

function DesignationPage() {
  const { departments, designations } = Route.useLoaderData()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const inputClass =
    'w-full rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-2 focus:ring-[var(--lagoon)]/20'

  function resetForm() {
    setTitle('')
    setDepartmentId('')
    setEditingId(null)
    setError('')
  }

  function handleEdit(designation: (typeof designations)[number]) {
    setEditingId(designation.id)
    setTitle(designation.title)
    setDepartmentId(designation.departmentId ?? '')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !departmentId) {
      setError('Please enter a designation and select a department.')
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        await updateDesignation({
          data: {
            id: editingId,
            title: title.trim(),
            departmentId,
          },
        })
      } else {
        await createDesignation({
          data: {
            title: title.trim(),
            departmentId,
          },
        })
      }

      resetForm()
      await router.invalidate()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save designation. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this designation?',
    )

    if (!confirmed) return

    setError('')

    try {
      await deleteDesignation({ data: { id } })
      await router.invalidate()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Unable to delete designation.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--sea-ink)]">
            Designation Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create job designations and assign them to departments.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-[var(--sea-ink)]">
            {editingId ? 'Edit Designation' : 'Add New Designation'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Designation Title *
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Software Developer"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Department *
              </label>

              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select Department</option>

                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || departments.length === 0}
                className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Designation'
                    : 'Add Designation'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[var(--chip-line)] px-6 py-3 font-semibold text-[var(--sea-ink)]"
                >
                  Cancel
                </button>
              )}
            </div>

            {departments.length === 0 && (
              <p className="text-sm text-amber-600">
                Please add a department before creating designations.
              </p>
            )}
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] shadow-sm">
          <div className="border-b border-[var(--chip-line)] p-6">
            <h2 className="text-xl font-semibold text-[var(--sea-ink)]">
              Existing Designations
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total designations: {designations.length}
            </p>
          </div>

          {designations.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No designations found. Add your first designation above.
            </div>
          ) : (
            <div className="divide-y divide-[var(--chip-line)]">
              {designations.map((designation) => {
                const department = departments.find(
                  (item) => item.id === designation.departmentId,
                )

                return (
                  <div
                    key={designation.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 dark:hover:bg-gray-800/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-[var(--sea-ink)]">
                        {designation.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Department: {department?.name ?? 'Not assigned'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(designation)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(designation.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
