import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { getCurrentAppUser } from '@/lib/auth.functions'
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/server/department.functions'

export const Route = createFileRoute('/departments/')({
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
    return await getDepartments()
  },

  component: DepartmentPage,
})

function DepartmentPage() {
  const departments = Route.useLoaderData()
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const inputClass =
    'w-full rounded-lg border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-3 text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)] focus:ring-2 focus:ring-[var(--lagoon)]/20'

  function resetForm() {
    setName('')
    setDescription('')
    setEditingId(null)
    setError('')
  }

  function handleEdit(department: (typeof departments)[number]) {
    setEditingId(department.id)
    setName(department.name)
    setDescription(department.description ?? '')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter a department name.')
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        await updateDepartment({
          data: {
            id: editingId,
            name: name.trim(),
            description: description.trim() || undefined,
          },
        })
      } else {
        await createDepartment({
          data: {
            name: name.trim(),
            description: description.trim() || undefined,
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
          : 'Unable to save department. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this department?',
    )

    if (!confirmed) return

    setError('')

    try {
      await deleteDepartment({ data: { id } })
      await router.invalidate()
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Unable to delete department.',
      )
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--sea-ink)]">
            Department Management
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create and manage your organization's departments.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-[var(--sea-ink)]">
            {editingId ? 'Edit Department' : 'Add New Department'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Department Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Human Resources"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter department description"
                rows={3}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Department'
                    : 'Add Department'}
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
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] shadow-sm">
          <div className="border-b border-[var(--chip-line)] p-6">
            <h2 className="text-xl font-semibold text-[var(--sea-ink)]">
              Existing Departments
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Total departments: {departments.length}
            </p>
          </div>

          {departments.length === 0 ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
              No departments found. Add your first department above.
            </div>
          ) : (
            <div className="divide-y divide-[var(--chip-line)]">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-gray-50 dark:hover:bg-gray-800/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-[var(--sea-ink)]">
                      {department.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {department.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(department)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(department.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
