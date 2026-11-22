
import { useEffect, useRef, useState } from 'react'
import {
  Send,
  Bot,
  User,
  MessageSquare,
  FileText,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Trash2,
  LoaderCircle,
  AlertCircle,
  BookOpen,
  ShieldCheck
} from 'lucide-react'
import api from '../services/api'

function AIChat() {
  const [documents, setDocuments] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  const messagesEndRef = useRef(null)

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
        'Unable to load documents. Check your backend connection.'
      )
    } finally {
      setLoadingDocuments(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages, loading])

  const handleDocumentChange = (e) => {
    setDocumentId(e.target.value)
    setMessages([])
    setError('')
  }

  const sendMessage = async (e, suggestedQuestion = null) => {
    e?.preventDefault()

    const userQuestion = (suggestedQuestion || question).trim()

    if (!userQuestion || !documentId || loading) return

    setMessages((previous) => [
      ...previous,
      { role: 'user', content: userQuestion }
    ])

    setQuestion('')
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/chat', {
        document_id: documentId,
        question: userQuestion
      })

      const data = response.data

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: data.answer || data.response || JSON.stringify(data),
          sources: Array.isArray(data.sources) ? data.sources : []
        }
      ])
    } catch (err) {
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content:
            err.response?.data?.detail ||
            'Unable to get an answer. Please check your backend connection.',
          sources: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    if (loading) return
    setMessages([])
    setQuestion('')
    setError('')
  }

  const copyResponse = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      setError('Unable to copy this response.')
    }
  }

  const selectedDocument = documents.find(
    (doc) => doc.id === documentId
  )

  const suggestions = [
    'What is the monthly rent in this agreement?',
    'What are the responsibilities of the tenant?',
    'When does this agreement expire?',
    'What is the security deposit amount?'
  ]

  return (
    <div className="mx-auto max-w-6xl">

      {/* Page Heading */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1 w-7 rounded-full bg-blue-600" />
          <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
            Intelligent Document Assistant
          </p>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          AI Legal Assistant
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ask questions, understand legal terms, and find answers directly
          from your uploaded documents.
        </p>
      </div>

      {/* Document Selection */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FileText size={22} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Select Your Legal Document
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose the document you want to discuss.
              </p>
            </div>
          </div>

          <button
            onClick={loadDocuments}
            disabled={loadingDocuments}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loadingDocuments ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        <select
          value={documentId}
          onChange={handleDocumentChange}
          disabled={loadingDocuments || documents.length === 0}
          className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 disabled:opacity-60"
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

        {selectedDocument && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-emerald-700">
            <ShieldCheck size={15} />
            <span>
              Selected: {selectedDocument.filename}
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium">
              {selectedDocument.pages ?? '—'} pages
            </span>
          </div>
        )}

        {!loadingDocuments && documents.length === 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
            <AlertCircle size={17} />
            No documents found. Upload a PDF first.
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Chat Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-5 md:px-7">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-600/20">
              <Bot size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                LegalDoc AI Assistant
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI document assistant
              </p>
            </div>
          </div>

          <button
            onClick={clearChat}
            disabled={messages.length === 0 || loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            Clear Chat
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/70 p-5 md:p-7">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="mx-auto max-w-2xl py-10 text-center">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
                <Sparkles size={36} />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                How can I help you today?
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                Ask questions about your selected legal document. I'll
                retrieve relevant information and provide answers based
                on its content.
              </p>

              {documentId && (
                <div className="mt-8">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Try asking
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={(e) => sendMessage(e, suggestion)}
                        disabled={loading}
                        className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 disabled:opacity-50"
                      >
                        <span className="flex items-start gap-2">
                          <MessageSquare
                            size={16}
                            className="mt-0.5 shrink-0 text-blue-500"
                          />
                          {suggestion}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Conversation Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >

              {message.role === 'assistant' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Bot size={19} />
                </div>
              )}

              <div className={`max-w-[88%] md:max-w-[78%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}>

                <div className={`rounded-2xl px-4 py-3.5 text-sm leading-7 shadow-sm ${
                  message.role === 'user'
                    ? 'rounded-tr-sm bg-blue-600 text-white'
                    : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'
                }`}>
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {/* Source References */}
                {message.role === 'assistant' &&
                  message.sources?.length > 0 && (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-blue-800">
                        <BookOpen size={15} />
                        Source References
                      </div>

                      <div className="space-y-1.5">
                        {message.sources.map((source, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <FileText size={14} className="text-blue-500" />
                            <span>
                              {source.filename || selectedDocument?.filename || 'Source document'}
                              {' · '}
                              Page {source.page ?? source.page_number ?? 'Reference unavailable'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Copy Answer */}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyResponse(message.content, index)}
                    className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check size={14} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy response
                      </>
                    )}
                  </button>
                )}

              </div>

              {message.role === 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                  <User size={19} />
                </div>
              )}

            </div>
          ))}

          {/* Thinking Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Bot size={19} />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin text-blue-600" />
                LegalDoc AI is analyzing your document...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="border-t border-slate-100 bg-white p-4 md:p-5"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">

            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                documentId
                  ? 'Ask anything about your legal document...'
                  : 'Select a document to start chatting...'
              }
              disabled={!documentId || loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={!question.trim() || !documentId || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            LegalDoc AI may make mistakes. Verify important information
            against the original document.
          </p>
        </form>

      </div>

      {/* Disclaimer */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-amber-700" />

        <p className="text-xs leading-6 text-amber-800">
          AI-generated responses are for informational assistance only.
          They may contain errors and are not a substitute for qualified
          legal advice.
        </p>
      </div>

    </div>
  )
}

export default AIChat
