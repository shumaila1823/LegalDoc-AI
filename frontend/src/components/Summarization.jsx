
import { useEffect, useState } from 'react'
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  LoaderCircle,
  RefreshCw,
  FileCheck,
  AlertCircle,
  WandSparkles,
  ShieldCheck
} from 'lucide-react'
import api from '../services/api'

function Summarization() {
  const [documents, setDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadDocuments = async () => {
    setLoadingDocuments(true)
    setError('')

    try {
      const response = await api.get('/documents')
      const data = response.data
      const list = Array.isArray(data) ? data : data.documents || []

      setDocuments(list)

      setDocumentId((current) =>
        list.some((doc) => doc.id === current)
          ? current
          : list[0]?.id || ''
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load documents. Please check your backend.'
      )
    } finally {
      setLoadingDocuments(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const selectedDocument = documents.find(
    (doc) => doc.id === documentId
  )

  const generateSummary = async () => {
    if (!documentId || loading) return

    setLoading(true)
    setError('')
    setSummary('')
    setCopied(false)

    try {
      const response = await api.post(`/summarize/${documentId}`)
      const data = response.data

      const result =
        data.summary ||
        data.response ||
        data.result ||
        (typeof data === 'string'
          ? data
          : JSON.stringify(data, null, 2))

      setSummary(result)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to generate summary. Please check your backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
    } catch {
      setError('Unable to copy. Please select and copy the summary manually.')
    }
  }

  const handleDocumentChange = (e) => {
    setDocumentId(e.target.value)
    setSummary('')
    setCopied(false)
    setError('')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Page Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <WandSparkles size={17} />
          AI DOCUMENT TOOLS
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Document Summarization
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Transform lengthy legal documents into clear, structured summaries
          using AI.
        </p>
      </div>

      {/* Information Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">PDF Documents</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Select an uploaded legal PDF.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Sparkles size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">AI Summaries</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Generate an easy-to-read overview.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileCheck size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">Quick Review</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Copy your generated summary.
          </p>
        </div>
      </div>

      {/* Document Selection */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-900">
                Select Your Document
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose a document from your library to summarize.
              </p>
            </div>

            <button
              onClick={loadDocuments}
              disabled={loadingDocuments}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={loadingDocuments ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Legal Document
            </label>

            <select
              value={documentId}
              onChange={handleDocumentChange}
              disabled={loadingDocuments || documents.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingDocuments
                  ? 'Loading documents...'
                  : 'Select a document'}
              </option>

              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          {selectedDocument && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <FileText size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-semibold text-slate-800">
                  {selectedDocument.filename}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedDocument.pages ?? '—'} pages
                </p>
              </div>

              <ShieldCheck className="shrink-0 text-indigo-600" size={21} />
            </div>
          )}

          {!loadingDocuments && documents.length === 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19} />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  No documents available
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Upload a PDF document before generating a summary.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-3 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:px-6">
          <p className="text-xs text-slate-500">
            Your selected document will be processed by the AI service.
          </p>

          <button
            onClick={generateSummary}
            disabled={loading || !documentId}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-10 text-center">
          <LoaderCircle className="mx-auto animate-spin text-indigo-600" size={34} />
          <h3 className="mt-4 font-semibold text-slate-800">
            Analyzing Your Document
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            AI is preparing a summary. Please wait...
          </p>
        </div>
      )}

      {/* Generated Summary */}
      {summary && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileCheck size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  AI Generated Summary
                </h3>
                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                  {selectedDocument?.filename || 'Selected document'}
                </p>
              </div>
            </div>

            <button
              onClick={copySummary}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? <Check size={17} className="text-emerald-600" /> : <Copy size={17} />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>

          <div className="p-5 sm:p-7">
            <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
              {summary}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-500">
              Review the original document to verify important legal details.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-slate-500" size={18} />
        <p className="text-xs leading-6 text-slate-500">
          LegalDoc AI provides AI-generated summaries for informational purposes only.
          Summaries may omit important legal details and are not a substitute for
          professional legal advice.
        </p>
      </div>

    </div>
  )
}

export default Summarization
