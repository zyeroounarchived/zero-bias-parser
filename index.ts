import fs from 'fs';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import 'dotenv/config';

// Helper function to pause execution
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("Reading raw PDF binary...");
  const dataBuffer = fs.readFileSync('resume.pdf');

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);
  
  // We'll stick to the model your dashboard showed you querying
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.8-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          candidate_summary: { type: SchemaType.STRING, description: "A 2-sentence summary. Do NOT use names or gender pronouns." },
          matched_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Technical skills explicitly found in the resume." },
          readiness_score: { type: SchemaType.INTEGER, description: "Score out of 10 based on overall technical strength." },
          bias_flags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List any implicit bias triggers found (e.g., specific university names, age indicators)." }
        },
        required: ["candidate_summary", "matched_skills", "readiness_score", "bias_flags"]
      }
    }
  });

  const prompt = "You are an impartial technical recruiter. Evaluate this candidate based ONLY on the attached resume. Strip all demographic data (name, gender, university).";

  const maxRetries = 4;
  
  // The Exponential Backoff Loop
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`\nAttempt ${i + 1} of ${maxRetries}: Streaming to Google...`);
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: dataBuffer.toString('base64'), mimeType: 'application/pdf' } }
      ]);
      
      console.log("\n--- FINAL STRUCTURED OUTPUT ---");
      console.log(result.response.text());
      return; // Exit the script upon success
      
    } catch (error: any) {
      if (error.status === 503) {
        const waitTime = (2 ** i) * 1000; // 1s, 2s, 4s, 8s
        console.log(`Server overloaded (503). Backing off for ${waitTime / 1000} seconds...`);
        await delay(waitTime);
      } else {
        console.error("Failed with a critical error:", error);
        return;
      }
    }
  }
  
  console.log("\nFailed after maximum retries. The free tier is completely slammed. Grab a coffee and try in 10 minutes.");
}

main().catch(console.error);