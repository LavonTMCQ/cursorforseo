'use client'

import { useState } from 'react'
import { trpc } from '../../lib/trpc/client'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createProjectDirect = async (data: { name: string; domain: string }) => {
    try {
      const response = await fetch('/api/test-create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const project = await response.json()
      console.log('Project created successfully:', project)
      onSuccess()
      onClose()
      setName('')
      setDomain('')
      setIsSubmitting(false)
    } catch (error) {
      console.error('Error creating project:', error)
      alert(`Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !domain.trim()) return

    setIsSubmitting(true)

    try {
      // Ensure domain has protocol and is valid
      let formattedDomain = domain.trim()
      if (!formattedDomain.startsWith('http://') && !formattedDomain.startsWith('https://')) {
        formattedDomain = `https://${formattedDomain}`
      }

      // Validate URL format
      try {
        new URL(formattedDomain)
      } catch (urlError) {
        alert('Please enter a valid domain URL')
        setIsSubmitting(false)
        return
      }

      const payload = {
        name: name.trim(),
        domain: formattedDomain,
      }

      console.log('Creating project with payload:', payload)
      await createProjectDirect(payload)
    } catch (error) {
      console.error('Error in form submission:', error)
      alert('An error occurred while submitting the form')
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="modern-card max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-slate-700 mb-2">
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My E-commerce Store"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="project-domain" className="block text-sm font-medium text-slate-700 mb-2">
              Website Domain
            </label>
            <input
              id="project-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., mystore.com or https://mystore.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter your website URL. We'll add https:// if needed.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={isSubmitting || !name.trim() || !domain.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
