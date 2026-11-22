
import { useRef, useState } from 'react'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  FileUp,
  X,
  ShieldCheck,
  LoaderCircle,
  RefreshCw,
  FileCheck2
} from 'lucide-react'
import api from '../services/api'

function UploadDocuments() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const inputRef = useRef(null)

  const MAX_FILE_SIZE = 20 * 1024 * 1024

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false

    const isPDF =
      selectedFile.type === 'application/pdf' ||
      selectedFile.name.toLowerCase().endsWith('.pdf')

    if (!isPDF) {
      setError('Invalid file format. Please select a PDF document.')
      return false
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 20 MB. Please select a smaller PDF.')
      return false
    }

    setFile(selectedFile)
    setError('')
    setMessage('')
    setResult(null)

    return true
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile) {
      validateFile(selectedFile)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)

    const droppedFile = event.dataTransfer.files?.[0]

    if (droppedFile) {
      validateFile(droppedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError('')
    setMessage('')
    setResult(null)

    try {
      const response = await api.post('/upload', formData)

      setResult(response.data)
      setMessage('Your document was uploaded successfully!')
      setFile(null)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Upload failed. Please check that the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="mx-auto max-w-5xl">

      {/* Page Heading */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-7 rounded-full bg-blue-600" />
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
            Document Management
          </p>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Upload Legal Documents
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Upload your legal PDF documents to unlock intelligent AI-powered
          analysis, summarization, and document insights.
        </p>
      </div>

      {/* Upload Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Card Header */}
        <div className="border-b border-slate-100 px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileUp size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Add a New Document
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Select or drag your PDF file below.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6 md:p-8">

          <div
            onDragEnter={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setDragActive(false)
            }}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 md:p-12 ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/40'
            }`}
          >

            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <Upload size={34} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {dragActive
                ? 'Drop your document here'
                : 'Drag and drop your PDF here'}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Or browse your computer to select a file.
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="legal-pdf-upload"
            />

            <label
              htmlFor="legal-pdf-upload"
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FolderIcon />
              Browse Files
            </label>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <FileText size={15} className="text-blue-600" />
                PDF format only
              </span>

              <span className="hidden h-3 w-px bg-slate-300 sm:block" />

              <span>Maximum file size: 20 MB</span>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-white p-3 text-blue-600 shadow-sm">
                    <FileText size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PDF Document · {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={removeFile}
                  disabled={loading}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                  aria-label="Remove selected file"
                >
                  <X size={19} />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle size={20} className="animate-spin" />
                Uploading Document...
              </>
            ) : (
              <>
                <Upload size={19} />
                Upload Document
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Your selected document will be sent to the LegalDoc AI backend for processing.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle size={22} className="mt-0.5 shrink-0 text-emerald-600" />

          <div>
            <h3 className="text-sm font-bold text-emerald-800">
              Upload Successful!
            </h3>
            <p className="mt-1 text-sm text-emerald-700">
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertCircle size={22} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <h3 className="text-sm font-bold text-red-800">
              Upload Error
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {result && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center gap-3 border-b border-slate-100 p-5">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <FileCheck2 size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Document Processing Details
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Your uploaded document information
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                File Name
              </p>
              <p className="mt-2 break-all text-sm font-bold text-slate-900">
                {result.document?.filename || 'Uploaded document'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Total Pages
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {result.document?.pages ?? '—'}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Text Chunks
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-600">
                {result.document?.chunks ?? '—'}
              </p>
            </div>

          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <p className="flex items-center gap-2 text-xs text-emerald-700">
              <ShieldCheck size={16} />
              Document successfully added to your current workspace.
            </p>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <FileText size={21} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Supported Documents
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Upload PDF agreements, contracts, rental documents, and other legal files.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Upload Guidelines
            </h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This prototype uses temporary in-memory document storage. Avoid uploading confidential legal documents.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}

function FolderIcon() {
  return <FileUp size={18} />
}

export default UploadDocuments
