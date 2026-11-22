
import { useState } from 'react'
import {
  Scale,
  LayoutDashboard,
  Upload,
  MessageSquare,
  FileText,
  Search,
  AlertTriangle,
  GitCompare,
  Menu,
  Bell,
  Plus,
  ShieldCheck,
  FolderOpen,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  X
} from 'lucide-react'

import UploadDocuments from './components/UploadDocuments'
import AIChat from './components/AIChat'
import Summarization from './components/Summarization'
import ClauseFinder from './components/ClauseFinder'
import RiskAnalysis from './components/RiskAnalysis'
import CompareDocuments from './components/CompareDocuments'
import DocumentLibrary from './components/DocumentLibrary'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Upload Documents', icon: Upload },
    { name: 'Document Library', icon: FolderOpen },
    { name: 'AI Chat', icon: MessageSquare },
    { name: 'Summarization', icon: FileText },
    { name: 'Clause Finder', icon: Search },
    { name: 'Risk Analysis', icon: AlertTriangle },
    { name: 'Compare Documents', icon: GitCompare },
  ]

  const features = [
    {
      name: 'Upload Documents',
      description: 'Upload your legal PDF files and prepare them for AI-powered analysis.',
      icon: Upload,
      color: 'blue',
      label: 'Document Management'
    },
    {
      name: 'Document Library',
      description: 'Access, organize, and manage your uploaded legal documents.',
      icon: FolderOpen,
      color: 'violet',
      label: 'Your Documents'
    },
    {
      name: 'AI Chat',
      description: 'Ask questions and get answers based on your uploaded documents.',
      icon: MessageSquare,
      color: 'emerald',
      label: 'AI Assistant'
    },
    {
      name: 'Summarization',
      description: 'Turn lengthy legal documents into clear and easy-to-understand summaries.',
      icon: FileText,
      color: 'amber',
      label: 'Quick Insights'
    },
    {
      name: 'Clause Finder',
      description: 'Find important clauses and understand what they mean.',
      icon: Search,
      color: 'cyan',
      label: 'Clause Analysis'
    },
    {
      name: 'Risk Analysis',
      description: 'Identify clauses and terms that may require additional attention.',
      icon: AlertTriangle,
      color: 'rose',
      label: 'Risk Detection'
    },
    {
      name: 'Compare Documents',
      description: 'Compare two legal documents and identify their differences.',
      icon: GitCompare,
      color: 'indigo',
      label: 'Document Comparison'
    },
  ]

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500',
    cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600',
    rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600',
  }

  const pageDescriptions = {
    Dashboard: 'Your intelligent legal document workspace',
    'Upload Documents': 'Add your legal documents for AI-powered analysis.',
    'Document Library': 'View and manage your uploaded documents.',
    'AI Chat': 'Ask questions and explore your legal documents.',
    Summarization: 'Generate clear summaries of lengthy legal documents.',
    'Clause Finder': 'Find and understand important legal clauses.',
    'Risk Analysis': 'Review clauses that may require additional attention.',
    'Compare Documents': 'Discover similarities and differences between documents.',
  }

  const openPage = (name) => {
    setActivePage(name)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#101827] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3 shadow-lg shadow-blue-600/20">
              <Scale size={25} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                LegalDoc <span className="text-blue-400">AI</span>
              </h1>
              <p className="mt-1 text-[11px] tracking-wide text-slate-400">
                LEGAL INTELLIGENCE PLATFORM
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-7">

          <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[2px] text-slate-500">
            Main Workspace
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.name

            return (
              <button
                key={item.name}
                onClick={() => openPage(item.name)}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  {item.name}
                </span>

                {isActive && (
                  <ChevronRight size={17} className="text-blue-100" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Bottom */}
        <div className="border-t border-white/10 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={19} className="text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                Secure Workspace
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              Your documents are processed for AI-assisted analysis. Avoid uploading sensitive information to this prototype unless appropriate safeguards are in place.
            </p>
          </div>

          <p className="mt-5 text-center text-[10px] tracking-wider text-slate-600">
            LEGALDOC AI © 2026
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <div className="min-h-screen lg:ml-72">

        {/* Header */}
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl md:px-8">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                  {activePage}
                </h2>
                {activePage === 'Dashboard' && (
                  <Sparkles size={17} className="text-blue-500" />
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {pageDescriptions[activePage]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Workspace
            </div>

            <button
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-150px)] p-5 md:p-8">

          {activePage === 'Dashboard' ? (
            <div className="mx-auto max-w-7xl">

              {/* Welcome Banner */}
              <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#101827] via-[#172c50] to-blue-800 p-7 text-white shadow-xl shadow-blue-950/10 md:p-10">

                <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-white/5" />
                <div className="pointer-events-none absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="relative z-10 max-w-3xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-white/10 px-3 py-2 text-xs font-semibold tracking-wide text-blue-100">
                    <Sparkles size={14} />
                    AI-POWERED LEGAL DOCUMENT ASSISTANT
                  </div>

                  <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                    Understand Legal Documents
                    <span className="block text-blue-300">
                      With Intelligence.
                    </span>
                  </h2>

                  <p className="mb-8 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                    Simplify complex legal documents with AI. Upload files,
                    ask questions, generate summaries, find clauses, analyze
                    potential risks, and compare documents in one workspace.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => openPage('Upload Documents')}
                      className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-400"
                    >
                      <Plus size={19} />
                      Upload Document
                    </button>

                    <button
                      onClick={() => openPage('Document Library')}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <FolderOpen size={18} />
                      View Library
                    </button>
                  </div>
                </div>
              </section>

              {/* Section Heading */}
              <section className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-1 w-7 rounded-full bg-blue-600" />
                    <p className="text-xs font-bold uppercase tracking-[2px] text-blue-600">
                      Workspace Tools
                    </p>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    Explore AI Features
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Choose a tool to start working with your legal documents.
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                  7 Available Tools
                </span>
              </section>

              {/* Feature Cards */}
              <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {features.map((feature) => {
                  const Icon = feature.icon

                  return (
                    <button
                      key={feature.name}
                      onClick={() => openPage(feature.name)}
                      className="group relative flex min-h-[225px] flex-col rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                    >
                      <div className="mb-5 flex items-start justify-between">
                        <div className={`rounded-2xl p-3.5 transition-all duration-300 ${colorStyles[feature.color]} group-hover:text-white`}>
                          <Icon size={24} />
                        </div>

                        <ArrowUpRight
                          size={19}
                          className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-600"
                        />
                      </div>

                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400">
                        {feature.label}
                      </p>

                      <h4 className="mb-2 text-lg font-bold text-slate-900">
                        {feature.name}
                      </h4>

                      <p className="text-sm leading-6 text-slate-500">
                        {feature.description}
                      </p>
                    </button>
                  )
                })}
              </section>

              {/* Disclaimer */}
              <section className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Important Legal Disclaimer
                  </h4>
                  <p className="mt-1 text-xs leading-6 text-amber-800">
                    LegalDoc AI provides AI-generated information for
                    assistance and educational purposes only. Its outputs
                    may contain errors or omissions and are not a substitute
                    for professional legal advice. Always verify important
                    findings with a qualified legal professional.
                  </p>
                </div>
              </section>

            </div>
          ) : activePage === 'Upload Documents' ? (
            <UploadDocuments />
          ) : activePage === 'Document Library' ? (
            <DocumentLibrary />
          ) : activePage === 'AI Chat' ? (
            <AIChat />
          ) : activePage === 'Summarization' ? (
            <Summarization />
          ) : activePage === 'Clause Finder' ? (
            <ClauseFinder />
          ) : activePage === 'Risk Analysis' ? (
            <RiskAnalysis />
          ) : activePage === 'Compare Documents' ? (
            <CompareDocuments />
          ) : null}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-500">
              © 2026 <span className="font-bold text-slate-700">LegalDoc AI.</span> All rights reserved.
            </p>

            <p className="text-xs text-slate-400">
              AI-generated information is for assistance only, not legal advice.
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default App
