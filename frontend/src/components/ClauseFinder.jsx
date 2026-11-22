
import { useEffect, useState } from 'react'
import {
  Search,
  FileText,
  Sparkles,
  Copy,
  Check,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Scale,
  BookOpen,
  FileSearch
} from 'lucide-react'
import api from '../services/api'

function ClauseFinder() {
  const [documents, setDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [result, setResult] = useState('')
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

  const handleDocumentChange = (e) => {
    setDocumentId(e.target.value)
    setResult('')
    setCopied(false)
    setError('')
  }

  const findClauses = async () => {
    if (!documentId || loading) return

    setLoading(true)
    setError('')
    setResult('')
    setCopied(false)

    try {
      const response = await api.post(`/clauses/${documentId}`)
      const data = response.data

      const clauseResult =
        data.clauses ||
        data.result ||
        data.analysis ||
        data.response ||
        (typeof data === 'string'
          ? data
          : JSON.stringify(data, null, 2))

      setResult(
        typeof clauseResult === 'string'
          ? clauseResult
          : JSON.stringify(clauseResult, null, 2)
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to find clauses. Please check your backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
    } catch {
      setError('Unable to copy. Please copy the result manually.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
          <Scale size={17} />
          LEGAL DOCUMENT INTELLIGENCE
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Legal Clause Finder
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Identify important clauses, understand agreement sections and
          review key legal terms with AI assistance.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileSearch size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Clause Detection
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Find important sections in legal PDFs.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <BookOpen size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Easy Explanation
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Understand clauses in simpler language.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Page References
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Review page references when provided by AI.
          </p>
        </div>
      </div>

      {/* Document Selection */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-900">
                Choose Legal Document
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Select an uploaded PDF for clause analysis.
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed"
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
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
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

              <ShieldCheck className="shrink-0 text-blue-600" size={21} />
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
                  Upload a PDF first to use the Clause Finder.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Action */}
        <div className="bg-slate-50/70 p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Search size={20} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Find Important Clauses
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Ask LegalDoc AI to identify important sections of your
                agreement, explain their meaning and provide page references
                where available.
              </p>
            </div>
          </div>

          <button
            onClick={findClauses}
            disabled={loading || !documentId}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                Finding Clauses...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Find Legal Clauses
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-10 text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-blue-600"
            size={34}
          />
          <h3 className="mt-4 font-semibold text-slate-800">
            Analyzing Legal Clauses
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            AI is reviewing your document. Please wait...
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileCheckIcon />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Clause Analysis Results
                </h3>
                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                  {selectedDocument?.filename || 'Selected document'}
                </p>
              </div>
            </div>

            <button
              onClick={copyResult}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {copied ? (
                <Check size={17} className="text-emerald-600" />
              ) : (
                <Copy size={17} />
              )}
              {copied ? 'Copied!' : 'Copy Results'}
            </button>
          </div>

          <div className="p-5 sm:p-7">
            <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
              {result}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-500">
              Verify extracted clauses and page references against the original PDF.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-slate-500" size={18} />
        <p className="text-xs leading-6 text-slate-500">
          AI-generated clause analysis is for informational purposes only.
          It may contain errors or omit important legal details and is not
          a substitute for professional legal advice.
        </p>
      </div>

    </div>
  )
}

function FileCheckIcon() {
  return <FileText size={22} />
}

export default ClauseFinder
