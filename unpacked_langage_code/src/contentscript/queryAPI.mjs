import OpenAI from "openai/index.mjs";
import config from './apiConfig.json';
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY, // Replace with your OpenAI API key in the apiConfig.json file
    dangerouslyAllowBrowser: true,
  });

const termArray = z.object({
    original_terms: z.array(z.string()),
    english_terms: z.array(z.string()),
  });


export async function getVocabTerms(transcript_text) {
    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
            { role: "system", content: "For the following text, output 10 key nouns or verb terms and their English translations. Exclude common stop words or non-essential terms from your selection. Exclude text within brackets [], music captions, and any other non-dialogue text." },
            {
                role: "user",
                content: transcript_text
            },
        ],
          response_format: zodResponseFormat(termArray, "termList"),
    });

    const termList = completion.choices[0].message;
    const originalTerms = termList.parsed.original_terms;
    const englishTerms = termList.parsed.english_terms;

    return { originalTerms, englishTerms };
} 

// getVocabTerms();
