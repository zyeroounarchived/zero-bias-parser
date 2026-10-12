Zero-Bias AI Resume Pipeline

Deterministic, PII-scrubbing candidate evaluation using multimodal LLMs, strict schema validation, and exponential backoff.
The Problem

Standard AI resume parsers fail in three critical ways:

    Brittle Extraction: Traditional OCR and libraries like pdf-parse break on multi-column layouts and custom fonts.

    Unpredictable Output: LLMs hallucinate keys or return conversational filler ("Here is your JSON:") that breaks downstream applications.

    Fragile Pipelines: Free-tier or high-traffic API wrappers crash the entire application when they hit rate limits or 503 server errors.

The Architecture

This pipeline evaluates technical candidates objectively by entirely bypassing text-extraction middleware and forcing strict data contracts.

    Native Multimodal Streaming: Streams raw PDF binaries directly to gemini-3.8-flash, leveraging native vision/document processing to eliminate OCR layout errors.

    Schema Validation: Uses Google's native SchemaType object definitions to force the LLM into a functional straightjacket, guaranteeing a predictable JSON response matrix.

    Ethical Guardrails: Aggressive system prompting redacts all demographic data (names, university prestige, geographic location, graduation years) to surface purely technical capability.

    Self-Healing Execution: Wraps the network request in an asynchronous exponential backoff loop, allowing the script to absorb 503 Service Unavailable spikes and auto-retry without breaking the runtime.

Tech Stack

    Language: TypeScript

    AI Provider: @google/generative-ai (Native SDK)

    Model: gemini-3.8-flash

    Execution: tsx for direct TypeScript compilation

Pipeline Demonstration

The system gracefully handles API rate-limiting via exponential backoff before returning the sanitized, strictly-typed Zod/Schema matrix:
Bash

Reading raw PDF binary...

Attempt 1 of 4: Streaming to Google...
Server overloaded (503). Backing off for 1 seconds...

Attempt 2 of 4: Streaming to Google...
Server overloaded (503). Backing off for 2 seconds...

Attempt 3 of 4: Streaming to Google...

--- FINAL STRUCTURED OUTPUT ---
{
  "candidate_summary": "This candidate is an early-stage business analytics student with foundational capabilities in data analysis, requirements gathering, and reporting. Practical exposure includes cleaning structured datasets in Excel and managing documentation workflows during student-level projects.",
  "matched_skills": [
    "Python",
    "R",
    "MySQL",
    "MS Excel",
    "SQL Querying",
    "Data Visualization"
  ],
  "readiness_score": 4,
  "bias_flags": [
    "Name indicating cultural/ethnic origin",
    "Specific universities and schools mentioned",
    "Graduation years revealing candidate age",
    "Specific geographic locations listed"
  ]
}

Local Development

    Clone the repository and install dependencies:

Bash

npm install @google/generative-ai dotenv
npm install --save-dev typescript @types/node tsx

    Configure your environment variables in a .env file:

Plaintext

GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

    Place a target PDF in the root directory named resume.pdf.

    Execute the pipeline:

Bash

npx tsx index.ts