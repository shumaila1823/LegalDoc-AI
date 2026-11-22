
import { useEffect, useState } from 'react'
import {
  GitCompare,
  FileText,
  Sparkles,
  Copy,
  Check,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Download,
  ShieldCheck,
  Files,
  FileCheck,
  Scale
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import api from '../services/api'

function CompareDocuments() {
  const [documents, setDocuments] = useState([])
  const [document1, setDocument1] = useState('')
  const [document2, setDocument2] = useState('')
  const [comparison, setComparison] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadDocuments = async () => {
    setFetching(true)
    setError('')

    try {
      const response = await api.get('/documents')
      const data = response.data
      const list = Array.isArray(data) ? data : data.documents || []

      setDocuments(list)

      setDocument1(current =>
        list.some(doc => doc.id === current)
          ? current
          : list[0]?.id || ''
      )

      setDocument2(current =>
        list.some(doc => doc.id === current) &&
        current !== (list[0]?.id || '')
          ? current
          : list.find(doc => doc.id !== (list[0]?.id || ''))?.id || ''
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load documents. Check your backend connection.'
      )
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const getFilename = (id) =>
    documents.find(doc => doc.id === id)?.filename || 'Select a document'

  const handleSelectionChange = (setter, value) => {
    setter(value)
    setComparison('')
    setCopied(false)
    setError('')
  }

  const compareDocuments = async () => {
    if (!document1 || !document2) {
      setError('Please select two documents.')
      return
    }

    if (document1 === document2) {
      setError('Please select two different documents.')
      return
    }

    setLoading(true)
    setError('')
    setComparison('')
    setCopied(false)

    try {
      const response = await api.post('/compare', {
        document_id_1: document1,
        document_id_2: document2
      })

      const data = response.data

      const result =
        data.comparison ||
        data.result ||
        data.analysis ||
        data.response ||
        (typeof data === 'string'
          ? data
          : JSON.stringify(data, null, 2))

      setComparison(
        typeof result === 'string'
          ? result
          : JSON.stringify(result, null, 2)
      )
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to compare documents. Please check your selections and backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyComparison = async () => {
    try {
      await navigator.clipboard.writeText(comparison)
      setCopied(true)
    } catch {
      setError('Unable to copy. Please copy the comparison manually.')
    }
  }

  // Generate and download PDF report
  const downloadPDF = () => {
    if (!comparison) {
      setError('Please generate a comparison before downloading.')
      return
    }

    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      let y = 20

      const addPageIfNeeded = (height = 8) => {
        if (y + height > pageHeight - 20) {
          pdf.addPage()
          y = 20
        }
      }

      // Report heading
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(23)
      pdf.text('LegalDoc AI', margin, y)
      y += 11

      pdf.setFontSize(15)
      pdf.text('Legal Document Comparison Report', margin, y)
      y += 12

      pdf.setDrawColor(170, 170, 170)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 10

      // Document information
      pdf.setFontSize(11)

      pdf.setFont('helvetica', 'bold')
      pdf.text('Document A:', margin, y)
      pdf.setFont('helvetica', 'normal')

      const firstName = pdf.splitTextToSize(
        getFilename(document1),
        maxWidth - 28
      )
      pdf.text(firstName, margin + 28, y)
      y += Math.max(7, firstName.length * 5)

      pdf.setFont('helvetica', 'bold')
      pdf.text('Document B:', margin, y)
      pdf.setFont('helvetica', 'normal')

      const secondName = pdf.splitTextToSize(
        getFilename(document2),
        maxWidth - 28
      )
      pdf.text(secondName, margin + 28, y)
      y += Math.max(7, secondName.length * 5)

      pdf.setFont('helvetica', 'bold')
      pdf.text('Report Date:', margin, y)
      pdf.setFont('helvetica', 'normal')
      pdf.text(new Date().toLocaleDateString(), margin + 28, y)
      y += 12

      pdf.setDrawColor(170, 170, 170)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 10

      // Comparison findings
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('Comparison Findings', margin, y)
      y += 10

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)

      const paragraphs = comparison.split('\n')

      paragraphs.forEach(paragraph => {
        if (!paragraph.trim()) {
          y += 3
          return
        }

        const lines = pdf.splitTextToSize(paragraph, maxWidth)
        const lineHeight = 5

        addPageIfNeeded(lines.length * lineHeight + 3)

        pdf.text(lines, margin, y)
        y += lines.length * lineHeight + 3
      })

      // Legal disclaimer
      y += 6
      addPageIfNeeded(25)

      pdf.setDrawColor(170, 170, 170)
      pdf.line(margin, y, pageWidth - margin, y)
      y += 8

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.text('Legal Disclaimer', margin, y)
      y += 7

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)

      const disclaimer =
        'This AI-generated comparison is for informational purposes only. ' +
        'It is not legal advice and does not establish that any clause is unlawful. ' +
        'Verify all findings against the original documents and consult a qualified lawyer.'

      const disclaimerLines = pdf.splitTextToSize(
        disclaimer,
        maxWidth
      )

      addPageIfNeeded(disclaimerLines.length * 5 + 5)
      pdf.text(disclaimerLines, margin, y)

      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages()

      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)

        pdf.text(
          `LegalDoc AI | Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      pdf.save('LegalDoc-AI-Comparison-Report.pdf')
    } catch (err) {
      console.error(err)
      setError('Unable to generate the PDF report. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-600">
          <GitCompare size={17} />
          DOCUMENT INTELLIGENCE
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Compare Legal Documents
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Compare two legal agreements with AI assistance and discover
          important differences in their terms and conditions.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Files size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            Two Documents
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Select two uploaded PDF agreements.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <GitCompare size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            AI Comparison
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Identify similarities and differences.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileCheck size={20} />
          </div>
          <h3 className="font-semibold text-slate-800">
            PDF Report
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Copy or download your comparison.
          </p>
        </div>
      </div>

      {/* Document Selection */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-bold text-slate-900">
                Select Documents
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose two different documents for comparison.
              </p>
            </div>

            <button
              onClick={loadDocuments}
              disabled={fetching}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={fetching ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {/* Document A */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <FileText size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold">Document A</p>
                  <p className="text-xs text-blue-600">First agreement</p>
                </div>
              </div>

              <select
                value={document1}
                onChange={e =>
                  handleSelectionChange(setDocument1, e.target.value)
                }
                disabled={fetching || documents.length === 0}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed"
              >
                <option value="">Select first document</option>

                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename}
                  </option>
                ))}
              </select>

              <p className="mt-2 break-all text-xs text-slate-500">
                {getFilename(document1)}
              </p>
            </div>

            {/* Document B */}
            <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-purple-700">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                  <FileText size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold">Document B</p>
                  <p className="text-xs text-purple-600">Second agreement</p>
                </div>
              </div>

              <select
                value={document2}
                onChange={e =>
                  handleSelectionChange(setDocument2, e.target.value)
                }
                disabled={fetching || documents.length === 0}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-50 disabled:cursor-not-allowed"
              >
                <option value="">Select second document</option>

                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename}
                  </option>
                ))}
              </select>

              <p className="mt-2 break-all text-xs text-slate-500">
                {getFilename(document2)}
              </p>
            </div>

          </div>

          {/* Selection Summary */}
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Comparison Overview
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-600">
                  DOCUMENT A
                </p>
                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {getFilename(document1)}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-white text-purple-600 shadow-sm">
                <GitCompare size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-purple-600">
                  DOCUMENT B
                </p>
                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {getFilename(document2)}
                </p>
              </div>
            </div>

            <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
              {documents.length} document(s) currently available.
            </p>
          </div>

          {documents.length < 2 && !fetching && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19} />
              <p className="text-sm leading-6 text-amber-800">
                Upload at least two PDF documents using the Upload Documents
                page. Then return here and click Refresh.
              </p>
            </div>
          )}

          {document1 && document1 === document2 && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-600" size={19} />
              <p className="text-sm text-amber-800">
                Please select two different documents.
              </p>
            </div>
          )}
        </div>

        {/* Compare Button */}
        <div className="bg-slate-50/70 p-5 sm:p-6">
          <p className="mb-4 text-xs leading-5 text-slate-500">
            LegalDoc AI will examine both selected documents and generate
            a comparison report.
          </p>

          <button
            onClick={compareDocuments}
            disabled={
              loading ||
              fetching ||
              documents.length < 2 ||
              !document1 ||
              !document2 ||
              document1 === document2
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={19} />
                Comparing Documents...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Compare Documents
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
        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-10 text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-purple-600"
            size={34}
          />
          <h3 className="mt-4 font-semibold text-slate-800">
            Comparing Your Documents
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            AI is examining both agreements. Please wait...
          </p>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <GitCompare size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Comparison Report
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  AI-generated comparison of your selected documents
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyComparison}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
              >
                {copied ? (
                  <Check size={17} className="text-emerald-600" />
                ) : (
                  <Copy size={17} />
                )}
                {copied ? 'Copied!' : 'Copy Report'}
              </button>

              <button
                onClick={downloadPDF}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex-none"
              >
                <Download size={17} />
                Download PDF
              </button>
            </div>
          </div>

          <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-white p-3">
              <p className="text-xs font-bold text-blue-600">DOCUMENT A</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {getFilename(document1)}
              </p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-white p-3">
              <p className="text-xs font-bold text-purple-600">DOCUMENT B</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {getFilename(document2)}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="whitespace-pre-wrap break-words text-sm leading-8 text-slate-700">
              {comparison}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
            <p className="text-xs text-slate-500">
              Verify important differences against both original documents.
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <Scale className="mt-0.5 shrink-0 text-slate-500" size={18} />
        <p className="text-xs leading-6 text-slate-500">
          AI-generated comparisons are for informational purposes only.
          They may contain errors or omissions and are not legal advice.
          Verify all important findings against the original documents
          and consult a qualified lawyer.
        </p>
      </div>

    </div>
  )
}

export default CompareDocuments
