
import os
import re
from uuid import uuid4

from dotenv import load_dotenv
from groq import Groq
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

documents = {}
chunks = []
vectorizer = None
chunk_vectors = None


def extract_pdf(file_path):
    reader = PdfReader(file_path)
    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({
                "page": page_number,
                "text": text
            })

    return pages


def split_text(text, chunk_size=1000, overlap=200):
    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return []

    result = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        result.append(text[start:end])

        if end >= len(text):
            break

        start = end - overlap

    return result


def rebuild_index():
    global vectorizer, chunk_vectors

    if not chunks:
        vectorizer = None
        chunk_vectors = None
        return

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=30000,
        sublinear_tf=True
    )

    chunk_vectors = vectorizer.fit_transform(
        [item["text"] for item in chunks]
    )


def add_document(file_path, filename):
    global chunks

    pages = extract_pdf(file_path)

    if not pages:
        raise ValueError("No readable text found in this PDF.")

    document_id = str(uuid4())
    document_chunks = []

    for page in pages:
        page_chunks = split_text(page["text"])

        for chunk in page_chunks:
            document_chunks.append({
                "document_id": document_id,
                "filename": filename,
                "page": page["page"],
                "text": chunk
            })

    documents[document_id] = {
        "id": document_id,
        "filename": filename,
        "pages": len(pages),
        "chunks": len(document_chunks)
    }

    chunks.extend(document_chunks)
    rebuild_index()

    return documents[document_id]


def remove_document(document_id):
    global chunks

    if document_id not in documents:
        return False

    del documents[document_id]

    chunks = [
        item for item in chunks
        if item["document_id"] != document_id
    ]

    rebuild_index()
    return True



def retrieve_documents(question, document_id=None, top_k=5):
    if not chunks:
        return []

    # First, select chunks from the requested document
    if document_id:
        candidate_chunks = [
            item for item in chunks
            if item["document_id"] == document_id
        ]
    else:
        candidate_chunks = chunks

    if not candidate_chunks:
        return []

    if vectorizer is None or chunk_vectors is None:
        return candidate_chunks[:top_k]

    # Calculate similarity against the indexed chunks
    query_vector = vectorizer.transform([question])

    similarities = cosine_similarity(
        query_vector, chunk_vectors
    ).flatten()

    # Match scores with the selected document chunks
    scored_results = []

    for index, item in enumerate(chunks):
        if document_id and item["document_id"] != document_id:
            continue

        score = similarities[index]

        if score > 0:
            scored_results.append((score, item))

    scored_results.sort(key=lambda x: x[0], reverse=True)

    # Return the best matching chunks
    if scored_results:
        return [
            item for score, item in scored_results[:top_k]
        ]

    # Fallback: provide document chunks when no keyword match exists
    return candidate_chunks[:top_k]



def generate_answer(question, retrieved_chunks):
    if client is None:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Please configure your .env file."
        )

    if not retrieved_chunks:
        return (
            "I could not find relevant information in the uploaded "
            "documents. Please try another question."
        )

    context = ""

    for item in retrieved_chunks:
        context += (
            f"\nDocument: {item['filename']}\n"
            f"Page: {item['page']}\n"
            f"Content: {item['text']}\n"
        )

    prompt = f"""
You are LegalDoc AI, a legal document assistant.

Answer the user's question using only the supplied document context.
Do not invent legal facts or clauses.
If the answer is not present, say so clearly.
Cite the document name and page number for each relevant claim.
Explain complex legal language in simple words.
You are not a substitute for a qualified lawyer.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Answer accurately using the provided document context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content


def ask_question(question, document_id=None):
    results = retrieve_documents(question, document_id)

    answer = generate_answer(question, results)

    sources = [
        {
            "filename": item["filename"],
            "page": item["page"],
            "text": item["text"][:300]
        }
        for item in results
    ]

    return {
        "answer": answer,
        "sources": sources
    }


def analyze_document(document_id, task):
    if client is None:
        raise RuntimeError("GROQ_API_KEY is missing.")

    if document_id not in documents:
        raise ValueError("Document not found.")

    document_chunks = [
        item for item in chunks
        if item["document_id"] == document_id
    ]

    context = "\n".join(
        f"Page {item['page']}: {item['text']}"
        for item in document_chunks
    )

    prompt = f"""
You are LegalDoc AI.

Task: {task}

Analyze the following uploaded legal document.
Use simple, clear language.
Do not invent information.
Mention page numbers wherever possible.
This is informational assistance, not legal advice.

DOCUMENT:
{context[:40000]}
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    return response.choices[0].message.content
