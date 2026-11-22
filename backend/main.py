
import os
import tempfile

import rag
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag import (
    documents,
    add_document,
    remove_document,
    ask_question,
    analyze_document
)

app = FastAPI(
    title="LegalDoc AI API",
    description="AI-powered legal document assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=3000)
    document_id: str | None = None


class CompareRequest(BaseModel):
    document_id_1: str
    document_id_2: str


@app.get("/")
def home():
    return {
        "message": "Welcome to LegalDoc AI API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    content = await file.read()

    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 20 MB."
        )

    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        result = add_document(temp_path, file.filename)
        return {
            "message": "Document uploaded successfully",
            "document": result
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Could not process PDF: {str(error)}"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/documents")
def get_documents():
    return list(documents.values())


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    success = remove_document(document_id)

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    return {"message": "Document deleted successfully"}


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        return ask_question(
            request.question,
            request.document_id
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.post("/summarize/{document_id}")
def summarize(document_id: str):
    try:
        result = analyze_document(
            document_id,
            "Summarize this document. Include its purpose, important points, parties, obligations, dates, and key terms."
        )

        return {"summary": result}

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/clauses/{document_id}")
def find_clauses(document_id: str):
    try:
        result = analyze_document(
            document_id,
            "Identify and explain the important clauses in this document. Include their page numbers."
        )

        return {"clauses": result}

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/risk-analysis/{document_id}")
def risk_analysis(document_id: str):
    try:
        result = analyze_document(
            document_id,
            "Review this document for potentially concerning, unclear, one-sided, or risky clauses. Explain why each may deserve attention. Do not claim that a clause is illegal without sufficient basis."
        )

        return {"risk_analysis": result}

    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/compare")
def compare_documents(request: CompareRequest):
    if request.document_id_1 not in documents:
        raise HTTPException(status_code=404, detail="First document not found.")

    if request.document_id_2 not in documents:
        raise HTTPException(status_code=404, detail="Second document not found.")

    if request.document_id_1 == request.document_id_2:
        raise HTTPException(status_code=400, detail="Please select two different documents.")

    if rag.client is None:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing.")

    doc1_chunks = [
        item for item in rag.chunks
        if item["document_id"] == request.document_id_1
    ]

    doc2_chunks = [
        item for item in rag.chunks
        if item["document_id"] == request.document_id_2
    ]

    context1 = "\n".join(
        f"Page {item['page']}: {item['text']}"
        for item in doc1_chunks
    )

    context2 = "\n".join(
        f"Page {item['page']}: {item['text']}"
        for item in doc2_chunks
    )

    prompt = f"""
Compare these two legal documents.

DOCUMENT 1:
{context1[:18000]}

DOCUMENT 2:
{context2[:18000]}

Explain:
1. Main similarities
2. Important differences
3. Differences in obligations and rights
4. Important changes in dates, amounts, or conditions
5. Clauses that deserve closer review

Use clear headings and simple language.
Do not invent information.
Mention page numbers where possible.
This is informational assistance, not legal advice.
"""

    try:
        response = rag.client.chat.completions.create(
            model=rag.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        return {
            "comparison": response.choices[0].message.content
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Comparison failed: {str(error)}"
        )
