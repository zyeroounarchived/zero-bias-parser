# Zero-Bias Resume Pipeline

A tool that reads a PDF resume and returns a short evaluation based only on the candidate's skills. Names, universities, locations, and graduation years are left out of the score.

## Example

Input: a PDF resume.

Output:

```json
{
  "candidate_summary": "Early-stage business analytics student with foundational skills in data analysis and reporting. Has cleaned datasets in Excel and managed documentation in student projects.",
  "matched_skills": ["Python", "R", "MySQL", "MS Excel", "SQL Querying", "Data Visualization"],
  "readiness_score": 4,
  "bias_flags": [
    "Name indicating cultural/ethnic origin",
    "Specific universities mentioned",
    "Graduation years revealing age",
    "Geographic locations listed"
  ]
}
```

The `bias_flags` field lists the personal details found in the resume and excluded from the evaluation.

## Why it exists

| Common problem | How this tool handles it |
|---|---|
| Resume scanners misread multi-column layouts and unusual fonts | The PDF goes directly to a model that reads it as a document, with no text extraction step |
| AI output is inconsistent and often not valid JSON | Every response must follow a fixed schema |
| Names, schools, and locations can influence scoring | These details are excluded from scoring and reported in `bias_flags` |
| A busy server or rate limit stops the program | Failed requests are retried automatically with increasing delays |

## How it works

1. Reads `resume.pdf` from the project folder.
2. Sends it to Google's Gemini model.
3. The model scores technical skills only and lists any personal details it ignored.
4. If the server is busy (a 503 error), the program waits 1 second, then 2, then 4, and tries again, up to 4 attempts.

## Setup

You need [Node.js](https://nodejs.org) and a [Google AI API key](https://aistudio.google.com/apikey).

Install dependencies:

```bash
npm install @google/generative-ai dotenv
npm install --save-dev typescript @types/node tsx
```

Create a `.env` file in the project folder:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Place a resume named `resume.pdf` in the same folder, then run:

```bash
npx tsx index.ts
```

## Built with

TypeScript, `@google/generative-ai`, Gemini (`gemini-3.8-flash`), and `tsx`.

## Limitations

- The score is meant to support a hiring decision, not make it.
- Reducing bias is not the same as removing it. Review results with a person.
- Resumes contain personal data. Do not commit real resumes or your `.env` file. Add both to `.gitignore`.
