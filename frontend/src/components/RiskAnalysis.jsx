
import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  FileText,
  Sparkles,
  Copy,
  Check,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Scale,
  SearchCheck,
  ClipboardCheck,
  ShieldAlert
} from 'lucide-react'
import api from '../services/api'

function RiskAnalysis() {
  const [documents, setDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadDocuments = async () => {
    setDocumentsLoading(true)
    setError('')

    try {
      const response = await api.get('/documents')
      const data = response.data
      const docs = Array.isArray(data) ? data : data.documents || []

      setDocuments(docs)

      setDocumentId(currentId => {
        if (docs.some(doc => doc.id === currentId)) {
          return currentId
        }
        return docs.length > 0 ? docs[0].id : ''
      })
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load documents. Please check your backend connection.'
      )
    } finally {
      setDocumentsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const selectedDocument = documents.find(
    doc => doc.id === documentId
  )

  const analyzeRisks = async () => {
    if (!documentId || loading) {
      setError('Please upload and select a PDF document first.')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis('')
    setCopied(false)

    try {
      const response = await api.post(
        `/risk-analysis/${documentId}`
      )

      const data = response.data

      const result =
        data.risk_analysis ||
        data.analysis ||
        data.result ||
        data.response ||
        (typeof data === 'string'
          ? data
          : JSON.stringify(data, null, 2))

      setAnalysis(
        typeof result === 'string'
          ? result
          : JSON.stringify(result, null, 2)
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to analyze risks. Please check your backend connection.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyAnalysis = async () => {
    try {
      await navigator.clipboard.writeText(analysis)
      setCopied(true)
    } catch {
      setError('Unable to copy. Please copy the result manually.')
    }
  }

  const handleDocumentChange = (value) => {
    setDocumentId(value)
    setAnalysis('')
    setError('')
    setCopied(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Page Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
          <ShieldAlert size={17} />
          LEGAL DOCUMENT PROTECTION
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Legal Risk Analysis
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review your agreements with AI assistance to identify unclear
          terms, potentially unfavorable conditions and issues that
          may deserve closer attention.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Issue Detection
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Identify terms that may need attention.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SearchCheck size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Agreement Review
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Review conditions and unclear wording.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ClipboardCheck size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Review Findings
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Read and copy the generated analysis.
          </p>
        </div>
      </div>

      {/* Document Selection */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-900">
                Select Legal Document
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose an uploaded PDF to begin the risk review.
              </p>
            </div>

            <button
              onClick={loadDocuments}
              disabled={documentsLoading}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={documentsLoading ? 'animate-spin' : ''}
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
              onChange={(e) => handleDocumentChange(e.target.value)}
              disabled={documentsLoading || documents.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {documentsLoading
                  ? 'Loading documents...'
                  : 'Select a document'}
              </option>

              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
            </select>
          </div>

          {selectedDocument && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
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

              <ShieldCheck className="shrink-0 text-amber-600" size={21} />
            </div>
          )}

          {!documentsLoading && documents.length === 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19} />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  No documents available
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Upload a PDF before starting risk analysis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Information */}
        <div className="p-5 sm:p-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <ShieldCheck size={20} />
              AI-Assisted Document Review
            </div>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              LegalDoc AI will review the selected agreement for unclear
              terms, potentially unfavorable conditions and other issues
              that may deserve closer attention.
            </p>
          </div>

          <button
            onClick={analyzeRisks}
            disabled={loading || !documentId || documentsLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                Analyzing Document...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Analyze Legal Risks
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
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-10 text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-amber-600"
            size={34}
          />
          <h3 className="mt-4 font-semibold text-slate-800">
            Reviewing Your Agreement
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            AI is examining the document for potentially concerning terms.
            Please wait...
          </p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Risk Analysis Results
                </h3>
                <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                  {selectedDocument?.filename || 'Selected document'}
                </p>
              </div>
            </div>

            <button
              onClick={copyAnalysis}
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
              {analysis}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-500">
              Verify every finding against the original agreement.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Scale className="mt-0.5 shrink-0 text-slate-500" size={18} />
        <p className="text-xs leading-6 text-slate-500">
          AI-generated risk analysis is informational only. It does not
          establish that a clause is unlawful or legally invalid. Results
          may contain errors or omissions. Consult a qualified lawyer
          for professional legal advice.
        </p>
      </div>

    </div>
  )
}

export default RiskAnalysis
