
import streamlit as st
import tempfile
import os
import sys
from dotenv import load_dotenv

# ---------------- CONFIGURATION ----------------

st.set_page_config(
    page_title="LegalDoc AI",
    page_icon="⚖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

# Load Streamlit Cloud secrets if available
try:
    if "GROQ_API_KEY" in st.secrets:
        os.environ["GROQ_API_KEY"] = str(st.secrets["GROQ_API_KEY"])

    if "GROQ_MODEL" in st.secrets:
        os.environ["GROQ_MODEL"] = str(st.secrets["GROQ_MODEL"])
except Exception:
    pass

sys.path.insert(0, BACKEND_DIR)
import rag


# ---------------- CUSTOM CSS ----------------

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.stApp {
    background: #f5f8fc;
}

header[data-testid="stHeader"] {
    background: #f5f8fc;
}

.block-container {
    max-width: 1500px;
    padding: 1.5rem 2rem 3rem 2rem;
}

/* Sidebar */

section[data-testid="stSidebar"] {
    background: #101a2b;
    min-width: 285px;
}

section[data-testid="stSidebar"] * {
    color: #dbeafe;
}

section[data-testid="stSidebar"] .stRadio label {
    background: transparent;
    border-radius: 12px;
    padding: 12px 14px;
    margin-bottom: 7px;
    font-weight: 600;
}

section[data-testid="stSidebar"] .stRadio label:hover {
    background: #1d2c43;
}

section[data-testid="stSidebar"] .stRadio [data-testid="stMarkdownContainer"] p {
    font-size: 15px;
}

section[data-testid="stSidebar"] .stRadio div[role="radiogroup"] {
    gap: 5px;
}

section[data-testid="stSidebar"] .stRadio div[role="radiogroup"] label > div:first-child {
    display: none;
}

/* Headings */

h1, h2, h3 {
    color: #111c32 !important;
    font-weight: 800 !important;
}

p {
    color: #64748b;
}

/* Hero */

.hero {
    background: linear-gradient(115deg, #111c32 0%, #172f5c 55%, #1e40af 100%);
    padding: 55px 48px;
    border-radius: 25px;
    color: white;
    margin: 22px 0 35px 0;
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.14);
}

.hero h1 {
    color: white !important;
    font-size: clamp(32px, 4vw, 56px);
    line-height: 1.2;
    font-weight: 800;
    margin: 25px 0;
}

.hero h1 span {
    color: #8ec5ff;
}

.hero p {
    color: #dbeafe;
    font-size: 17px;
    line-height: 1.8;
    max-width: 850px;
}

.hero-badge {
    display: inline-block;
    padding: 10px 17px;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 30px;
    color: #eff6ff;
    font-size: 13px;
    font-weight: 700;
}

/* Metric cards */

div[data-testid="stMetric"] {
    background: white;
    padding: 22px;
    border: 1px solid #e2e8f0;
    border-radius: 17px;
    box-shadow: 0 4px 14px rgba(15,23,42,0.04);
}

div[data-testid="stMetricLabel"] {
    color: #64748b;
    font-weight: 600;
}

div[data-testid="stMetricValue"] {
    color: #172554;
    font-weight: 800;
}

/* Buttons */

.stButton > button,
.stDownloadButton > button {
    background: #2563eb;
    color: white !important;
    border: none;
    border-radius: 10px;
    min-height: 44px;
    font-weight: 700;
    padding: 8px 20px;
    transition: 0.2s;
}

.stButton > button:hover,
.stDownloadButton > button:hover {
    background: #1d4ed8;
    border: none;
    color: white !important;
    box-shadow: 0 5px 15px rgba(37,99,235,0.2);
}

/* Inputs */

.stTextInput input,
.stTextArea textarea,
.stSelectbox div[data-baseweb="select"] {
    border-radius: 10px;
}

[data-testid="stFileUploader"] {
    background: white;
    padding: 20px;
    border: 1px dashed #93c5fd;
    border-radius: 15px;
}

/* Containers */

div[data-testid="stExpander"] {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
}

hr {
    border-color: #e2e8f0;
}

.section-label {
    color: #2563eb;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 3px;
    margin: 30px 0 15px 0;
}

.feature-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 17px;
    padding: 22px;
    min-height: 150px;
    box-shadow: 0 4px 12px rgba(15,23,42,0.035);
}

.feature-icon {
    font-size: 27px;
    margin-bottom: 12px;
}

.feature-title {
    color: #172554;
    font-weight: 800;
    font-size: 16px;
    margin-bottom: 7px;
}

.feature-description {
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
}

.sidebar-brand {
    font-size: 25px;
    font-weight: 800;
    color: white;
    padding: 15px 0 4px 0;
}

.sidebar-subtitle {
    color: #94a3b8;
    font-size: 12px;
    letter-spacing: 1px;
}

.secure-box {
    background: #1b2638;
    border: 1px solid #334155;
    padding: 17px;
    border-radius: 16px;
    margin-top: 35px;
}

.footer-text {
    color: #64748b;
    text-align: center;
    font-size: 12px;
    padding-top: 25px;
}

@media (max-width: 768px) {
    .block-container {
        padding: 1rem;
    }

    .hero {
        padding: 30px 23px;
    }

    .hero h1 {
        font-size: 32px;
    }
}
</style>
""", unsafe_allow_html=True)


# ---------------- NAVIGATION DATA ----------------

pages = [
    "Dashboard",
    "Upload Documents",
    "Document Library",
    "AI Chat",
    "Summarization",
    "Clause Finder",
    "Risk Analysis",
    "Compare Documents"
]

icons = {
    "Dashboard": "▦",
    "Upload Documents": "⇧",
    "Document Library": "▱",
    "AI Chat": "◉",
    "Summarization": "▤",
    "Clause Finder": "⌕",
    "Risk Analysis": "⬡",
    "Compare Documents": "⇄"
}


# IMPORTANT: Use a separate key for navigation.
# Never assign directly to navigation_choice after creating the radio widget.

if "navigation_choice" not in st.session_state:
    st.session_state.navigation_choice = "Dashboard"


def set_navigation(destination):
    st.session_state.navigation_choice = destination


# ---------------- SIDEBAR ----------------

st.sidebar.markdown("""
<div class="sidebar-brand">
    ⚖️ LegalDoc <span style="color:#60a5fa">AI</span>
</div>
<div class="sidebar-subtitle">LEGAL INTELLIGENCE PLATFORM</div>
<br>
<hr>
<p style="font-size:12px;letter-spacing:3px;font-weight:800;color:#64748b">
MAIN WORKSPACE
</p>
""", unsafe_allow_html=True)

page = st.sidebar.radio(
    "Navigation",
    pages,
    format_func=lambda p: f"{icons[p]}   {p}",
    key="navigation_choice"
)

st.sidebar.markdown("""
<div class="secure-box">
    <strong>🛡️ Secure Workspace</strong>
    <p style="color:#94a3b8;font-size:13px;line-height:1.8;margin-top:12px">
    Your documents are processed for AI-assisted analysis.
    Avoid uploading sensitive information to this prototype
    unless appropriate safeguards are in place.
    </p>
</div>
<div class="footer-text">LEGALDOC AI © 2026</div>
""", unsafe_allow_html=True)


# ---------------- HELPERS ----------------

def get_documents():
    return list(rag.documents.values())


def show_result(title, result):
    st.subheader(title)
    st.markdown(result)

    st.download_button(
        "⬇ Download Result",
        data=result,
        file_name="legaldoc_ai_result.txt",
        mime="text/plain"
    )


def compare_documents(doc1_id, doc2_id):

    if rag.client is None:
        raise RuntimeError("Groq API key is missing.")

    doc1 = rag.documents[doc1_id]
    doc2 = rag.documents[doc2_id]

    chunks1 = [
        x for x in rag.chunks
        if x["document_id"] == doc1_id
    ]

    chunks2 = [
        x for x in rag.chunks
        if x["document_id"] == doc2_id
    ]

    context1 = "\n".join(
        f"Page {x['page']}: {x['text']}" for x in chunks1
    )

    context2 = "\n".join(
        f"Page {x['page']}: {x['text']}" for x in chunks2
    )

    prompt = f"""
Compare these two legal documents.

DOCUMENT 1: {doc1['filename']}
{context1[:18000]}

DOCUMENT 2: {doc2['filename']}
{context2[:18000]}

Explain:
1. Key similarities.
2. Important differences.
3. Differences in dates, amounts, parties and obligations.
4. Clauses deserving closer review.
5. Overall comparison summary.

Use simple language, mention page numbers where possible,
and do not invent information.
This is informational assistance, not legal advice.
"""

    response = rag.client.chat.completions.create(
        model=rag.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return response.choices[0].message.content


def page_header(title, subtitle):
    st.markdown(f"""
    <div style="margin-bottom:25px">
        <h1 style="margin-bottom:5px">{title}</h1>
        <p style="font-size:15px">{subtitle}</p>
    </div>
    """, unsafe_allow_html=True)


# ---------------- TOP HEADER ----------------

col1, col2 = st.columns([5, 1])

with col1:
    st.caption("LEGALDOC AI  /  INTELLIGENT WORKSPACE")

with col2:
    st.markdown(
        "<div style='text-align:right;color:#059669;font-weight:700'>● Workspace</div>",
        unsafe_allow_html=True
    )

st.divider()


# ---------------- DASHBOARD ----------------

if page == "Dashboard":

    documents = get_documents()

    st.markdown("""
    <div class="hero">
        <div class="hero-badge">
            ✧ &nbsp; AI-POWERED LEGAL DOCUMENT ASSISTANT
        </div>
        <h1>
            Understand Legal Documents<br>
            <span>With Intelligence.</span>
        </h1>
        <p>
        Simplify complex legal documents with AI. Upload files, ask questions,
        generate summaries, find clauses, analyze potential risks, and compare
        documents in one workspace.
        </p>
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    with col1:
        st.button(
            "＋ Upload Document",
            use_container_width=True,
            on_click=set_navigation,
            args=("Upload Documents",)
        )

    with col2:
        st.button(
            "▱ View Library",
            use_container_width=True,
            on_click=set_navigation,
            args=("Document Library",)
        )

    st.markdown(
        '<div class="section-label">WORKSPACE OVERVIEW</div>',
        unsafe_allow_html=True
    )

    a, b, c = st.columns(3)

    with a:
        st.metric("Uploaded Documents", len(documents))

    with b:
        st.metric("Total Pages", sum(d["pages"] for d in documents))

    with c:
        st.metric("Total Text Chunks", sum(d["chunks"] for d in documents))

    st.markdown(
        '<div class="section-label">WORKSPACE TOOLS</div>',
        unsafe_allow_html=True
    )

    features = [
        ("📤", "Upload Documents", "Upload and process legal PDF files."),
        ("📁", "Document Library", "Manage your uploaded documents."),
        ("💬", "AI Chat", "Ask questions and get document-based answers."),
        ("📝", "Summarization", "Generate clear legal document summaries."),
        ("🔎", "Clause Finder", "Find and understand important clauses."),
        ("🛡️", "Risk Analysis", "Identify terms that deserve closer review."),
        ("⚖️", "Compare Documents", "Compare two legal documents.")
    ]

    rows = [st.columns(3), st.columns(3), st.columns(1)]

    for index, item in enumerate(features):
        icon, title, description = item
        row_index = index // 3
        col_index = index % 3

        with rows[row_index][col_index]:
            st.markdown(f"""
            <div class="feature-card">
                <div class="feature-icon">{icon}</div>
                <div class="feature-title">{title}</div>
                <div class="feature-description">{description}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown(
        '<div class="footer-text">LegalDoc AI | Powered by Groq | Informational assistance only</div>',
        unsafe_allow_html=True
    )


# ---------------- UPLOAD DOCUMENTS ----------------

elif page == "Upload Documents":

    page_header(
        "📤 Upload Documents",
        "Add legal PDF documents to your intelligent workspace."
    )

    uploaded_file = st.file_uploader(
        "Choose your legal PDF document",
        type=["pdf"]
    )

    if uploaded_file:

        st.write("Selected file:", uploaded_file.name)
        st.write(
            f"File size: {uploaded_file.size / (1024 * 1024):.2f} MB"
        )

        if uploaded_file.size > 20 * 1024 * 1024:
            st.error("File size must not exceed 20 MB.")

        elif st.button("Upload and Process Document"):

            existing = [
                d for d in get_documents()
                if d["filename"] == uploaded_file.name
            ]

            if existing:
                st.warning(
                    "A document with this filename is already uploaded."
                )

            else:
                temp_path = None

                try:
                    with tempfile.NamedTemporaryFile(
                        delete=False,
                        suffix=".pdf"
                    ) as temp_file:

                        temp_file.write(uploaded_file.getvalue())
                        temp_path = temp_file.name

                    result = rag.add_document(
                        temp_path,
                        uploaded_file.name
                    )

                    st.success("Document uploaded successfully!")

                    st.metric("Pages", result["pages"])
                    st.metric("Text Chunks", result["chunks"])

                except Exception as e:
                    st.error(f"Upload failed: {str(e)}")

                finally:
                    if temp_path and os.path.exists(temp_path):
                        os.remove(temp_path)


# ---------------- DOCUMENT LIBRARY ----------------

elif page == "Document Library":

    page_header(
        "📁 Document Library",
        "View and manage your uploaded legal documents."
    )

    documents = get_documents()

    if not documents:
        st.info("No documents uploaded yet.")

    else:
        st.metric("Total Documents", len(documents))

        for document in documents:

            with st.expander(f"📄 {document['filename']}"):

                a, b, c = st.columns(3)

                a.metric("Pages", document["pages"])
                b.metric("Chunks", document["chunks"])
                c.write(f"ID: {document['id']}")

                if st.button(
                    "🗑 Delete Document",
                    key=f"delete_{document['id']}"
                ):

                    rag.remove_document(document["id"])
                    st.success("Document deleted.")
                    st.rerun()


# ---------------- AI CHAT ----------------

elif page == "AI Chat":

    page_header(
        "💬 AI Legal Assistant",
        "Ask questions about your uploaded documents."
    )

    documents = get_documents()

    if not documents:
        st.warning("Please upload a document first.")

    else:

        selected = st.selectbox(
            "Select a document",
            documents,
            format_func=lambda d: d["filename"]
        )

        chat_key = f"chat_history_{selected['id']}"

        if chat_key not in st.session_state:
            st.session_state[chat_key] = []

        if st.button("Clear Chat"):
            st.session_state[chat_key] = []
            st.rerun()

        for message in st.session_state[chat_key]:

            with st.chat_message(message["role"]):
                st.markdown(message["content"])

                if message.get("sources"):
                    with st.expander("View Sources"):
                        for source in message["sources"]:
                            st.write(
                                f"{source['filename']} — Page {source['page']}"
                            )
                            st.caption(source["text"])

        question = st.chat_input(
            "Ask something about your document..."
        )

        if question:

            st.session_state[chat_key].append({
                "role": "user",
                "content": question
            })

            with st.chat_message("user"):
                st.markdown(question)

            with st.chat_message("assistant"):

                with st.spinner("Analyzing your document..."):

                    try:
                        result = rag.ask_question(
                            question,
                            selected["id"]
                        )

                        st.markdown(result["answer"])

                        with st.expander("View Sources"):
                            for source in result["sources"]:
                                st.write(
                                    f"{source['filename']} — Page {source['page']}"
                                )
                                st.caption(source["text"])

                        st.session_state[chat_key].append({
                            "role": "assistant",
                            "content": result["answer"],
                            "sources": result["sources"]
                        })

                    except Exception as e:
                        st.error(str(e))


# ---------------- SUMMARIZATION ----------------

elif page == "Summarization":

    page_header(
        "📝 Document Summarization",
        "Turn lengthy legal documents into understandable summaries."
    )

    documents = get_documents()

    if not documents:
        st.warning("Upload a document first.")

    else:

        selected = st.selectbox(
            "Select document",
            documents,
            format_func=lambda d: d["filename"]
        )

        if st.button("✧ Generate Summary"):

            with st.spinner("Generating summary..."):

                try:
                    result = rag.analyze_document(
                        selected["id"],
                        "Create a comprehensive summary of this legal document. "
                        "Include the parties, purpose, important terms, dates, "
                        "financial obligations and key conditions."
                    )

                    show_result("Document Summary", result)

                except Exception as e:
                    st.error(str(e))


# ---------------- CLAUSE FINDER ----------------

elif page == "Clause Finder":

    page_header(
        "🔎 Legal Clause Finder",
        "Discover and understand important clauses in your documents."
    )

    documents = get_documents()

    if not documents:
        st.warning("Upload a document first.")

    else:

        selected = st.selectbox(
            "Select document",
            documents,
            format_func=lambda d: d["filename"]
        )

        if st.button("Find and Explain Clauses"):

            with st.spinner("Finding legal clauses..."):

                try:
                    result = rag.analyze_document(
                        selected["id"],
                        "Identify the important legal clauses in this document. "
                        "Explain each clause in simple language and mention "
                        "the relevant page number."
                    )

                    show_result("Clause Analysis", result)

                except Exception as e:
                    st.error(str(e))


# ---------------- RISK ANALYSIS ----------------

elif page == "Risk Analysis":

    page_header(
        "🛡️ Legal Risk Analysis",
        "Review clauses and terms that may need additional attention."
    )

    documents = get_documents()

    if not documents:
        st.warning("Upload a document first.")

    else:

        selected = st.selectbox(
            "Select document",
            documents,
            format_func=lambda d: d["filename"]
        )

        if st.button("Analyze Document Risks"):

            with st.spinner("Reviewing document..."):

                try:
                    result = rag.analyze_document(
                        selected["id"],
                        "Review this legal document for clauses or terms "
                        "that may deserve closer attention. Look for unclear "
                        "obligations, payment conditions, penalties, termination "
                        "conditions, missing details and unusual responsibilities. "
                        "For each finding, explain why it may matter and cite "
                        "the page number. Do not assume a clause is legally "
                        "invalid merely because it is unusual."
                    )

                    show_result("Risk Analysis Report", result)

                except Exception as e:
                    st.error(str(e))


# ---------------- COMPARE DOCUMENTS ----------------

elif page == "Compare Documents":

    page_header(
        "⚖️ Compare Documents",
        "Analyze similarities and differences between two legal documents."
    )

    documents = get_documents()

    if len(documents) < 2:
        st.warning("Upload at least two documents to compare.")

    else:

        options = {
            d["filename"] + " (" + d["id"][:8] + ")": d["id"]
            for d in documents
        }

        names = list(options.keys())

        col1, col2 = st.columns(2)

        with col1:
            doc1_name = st.selectbox(
                "First document",
                names,
                key="compare_doc1"
            )

        with col2:
            doc2_name = st.selectbox(
                "Second document",
                names,
                index=1,
                key="compare_doc2"
            )

        if st.button("⚖️ Compare Documents"):

            doc1_id = options[doc1_name]
            doc2_id = options[doc2_name]

            if doc1_id == doc2_id:
                st.error("Please select two different documents.")

            else:

                with st.spinner("Comparing documents..."):

                    try:
                        result = compare_documents(
                            doc1_id,
                            doc2_id
                        )

                        show_result(
                            "Document Comparison Report",
                            result
                        )

                    except Exception as e:
                        st.error(str(e))


# ---------------- FOOTER ----------------

st.divider()

st.markdown(
    '<div class="footer-text">© 2026 LegalDoc AI | AI-Powered Legal Intelligence | Informational assistance only</div>',
    unsafe_allow_html=True
)
