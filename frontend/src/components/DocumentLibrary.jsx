
import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  RefreshCw,
  Trash2,
  LoaderCircle,
  AlertCircle,
  FolderOpen,
  Search,
  Files,
  FileCheck2,
  Layers3,
  ShieldCheck,
  X,
  Database
} from 'lucide-react'
import api from '../services/api'

function DocumentLibrary() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadDocuments = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await api.get('/documents')
      const data = response.data

      const list = Array.isArray(data)
        ? data
        : data.documents || []

      setDocuments(list)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load documents. Check your backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const deleteDocument = async (documentId, filename) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${filename}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setDeleting(documentId)
    setError('')
    setMessage('')

    try {
      await api.delete(`/documents/${documentId}`)

      setDocuments((current) =>
        current.filter((doc) => doc.id !== documentId)
      )

      setMessage(`"${filename}" was deleted successfully.`)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to delete this document. Please try again.'
      )
    } finally {
      setDeleting('')
    }
  }

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      (doc.filename || 'Untitled PDF')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  }, [documents, searchTerm])

  const totalPages = documents.reduce(
    (total, doc) => total + (Number(doc.pages) || 0),
    0
  )

  const totalChunks = documents.reduce(
    (total, doc) => total + (Number(doc.chunks) || 0),
    0
  )

  return (
    <div className="mx-auto max-w-7xl">

      {/* Page Heading */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1 w-7 rounded-full bg-blue-600" />
            <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
              Document Management
            </p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Document Library
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage, search, and organize your uploaded legal documents.
          </p>
        </div>

        <button
          onClick={loadDocuments}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Library
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Uploaded Documents
              </p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {documents.length}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Total PDF files
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-3.5 text-blue-600">
              <Files size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Pages
              </p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {totalPages}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Pages processed
              </p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-3.5 text-violet-600">
              <FileCheck2 size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Text Chunks
              </p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {totalChunks}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Available for AI retrieval
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-3.5 text-emerald-600">
              <Layers3 size={25} />
            </div>
          </div>
        </div>

      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <h4 className="text-sm font-bold text-red-800">
              Something went wrong
            </h4>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {message && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <FileCheck2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-800">
              Action completed
            </h4>
            <p className="mt-1 text-sm text-emerald-700">{message}</p>
          </div>

          <button
            onClick={() => setMessage('')}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Main Library Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Library Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 md:px-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FolderOpen size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Your Documents
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {documents.length} document{documents.length !== 1 ? 's' : ''} in your workspace
              </p>
            </div>
          </div>

          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            PDF Library
          </span>
        </div>

        {/* Search */}
        <div className="border-b border-slate-100 p-5 md:px-7">
          <div className="relative max-w-xl">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search documents by filename..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-16 text-slate-500">
            <LoaderCircle className="animate-spin text-blue-600" size={35} />
            <p className="text-sm font-medium">
              Loading your document library...
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-5 rounded-2xl bg-slate-100 p-5 text-slate-400">
              <FolderOpen size={38} />
            </div>

            <h4 className="text-lg font-bold text-slate-800">
              Your library is empty
            </h4>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              You haven't uploaded any documents yet. Upload a PDF to start
              building your legal document library.
            </p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Search size={35} className="mb-4 text-slate-300" />

            <h4 className="font-bold text-slate-800">
              No matching documents
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Try another filename or clear your search.
            </p>

            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 transition hover:bg-slate-50/80 md:px-7"
              >

                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="shrink-0 rounded-2xl bg-blue-50 p-3.5 text-blue-600">
                    <FileText size={25} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="break-all text-sm font-bold text-slate-900 md:text-base">
                      {doc.filename || 'Untitled PDF'}
                    </h4>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FileCheck2 size={14} className="text-blue-500" />
                        {doc.pages ?? '—'} pages
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Layers3 size={14} className="text-violet-500" />
                        {doc.chunks ?? '—'} text chunks
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    deleteDocument(
                      doc.id,
                      doc.filename || 'this document'
                    )
                  }
                  disabled={deleting === doc.id || !doc.id}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting === doc.id ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting === doc.id ? 'Deleting...' : 'Delete'}
                </button>

              </div>
            ))}

          </div>
        )}

        {/* Bottom Information */}
        {!loading && documents.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

      </div>

      {/* Storage Notice */}
      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
          <Database size={21} />
        </div>

        <div>
          <h4 className="text-sm font-bold text-amber-900">
            Temporary Storage Notice
          </h4>

          <p className="mt-1 text-xs leading-6 text-amber-800">
            Documents are currently stored in backend memory. They may be lost
            when the backend restarts. Persistent database storage will be
            added in a later development step.
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <ShieldCheck size={21} className="mt-0.5 shrink-0 text-emerald-600" />

        <div>
          <h4 className="text-sm font-bold text-slate-800">
            Document Workspace
          </h4>

          <p className="mt-1 text-xs leading-6 text-slate-500">
            This prototype provides document management and AI-assisted
            processing. It does not yet provide production-grade access
            controls or confidential document storage.
          </p>
        </div>
      </div>

    </div>
  )
}

export default DocumentLibrary
