import Anthropic from "@anthropic-ai/sdk";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Please add your API key to .env.local"
    );
  }
  return new Anthropic({ apiKey });
}

interface GenerateEmailParams {
  coachName: string;
  coachSchool: string;
  coachSport: string;
  coachDivision?: string;
  coachRole?: string;
  athleteName: string;
  athleteSport?: string;
  athletePosition?: string;
  athleteGpa?: string;
  athleteHeight?: string;
  athleteKeyStats?: string;
  athleteHighlights?: string;
  athleteBio?: string;
  tone: "professional" | "casual" | "enthusiastic" | "follow-up";
  additionalContext?: string;
}

function sanitizeUserInput(input: string): string {
  return input
    .replace(/\b(ignore|disregard|forget)\b.*\b(instructions?|above|previous|prompt)\b/gi, "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 500);
}

export async function generateEmail(params: GenerateEmailParams) {
  const sanitizedContext = params.additionalContext
    ? sanitizeUserInput(params.additionalContext)
    : undefined;

  const toneGuide = {
    professional:
      "Write in a formal, professional tone. Be respectful and concise.",
    casual:
      "Write in a friendly, conversational tone while maintaining respect.",
    enthusiastic:
      "Write with energy and genuine excitement about the program and opportunity.",
    "follow-up":
      "Write a brief, polite follow-up referencing a previous email. Keep it short.",
  };

  const prompt = `Generate a recruiting email from a student-athlete to a college coach.

COACH INFO:
- Name: ${params.coachName}
- School: ${params.coachSchool}
- Sport: ${params.coachSport}
${params.coachDivision ? `- Division: ${params.coachDivision}` : ""}
${params.coachRole ? `- Role: ${params.coachRole}` : ""}

ATHLETE INFO:
- Name: ${params.athleteName}
${params.athleteSport ? `- Sport: ${params.athleteSport}` : ""}
${params.athletePosition ? `- Position: ${params.athletePosition}` : ""}
${params.athleteGpa ? `- GPA: ${params.athleteGpa}` : ""}
${params.athleteHeight ? `- Height: ${params.athleteHeight}` : ""}
${params.athleteKeyStats ? `- Key Stats: ${params.athleteKeyStats}` : ""}
${params.athleteHighlights ? `- Highlights: ${params.athleteHighlights}` : ""}
${params.athleteBio ? `- Bio: ${params.athleteBio}` : ""}

TONE: ${toneGuide[params.tone]}
${sanitizedContext ? `\nADDITIONAL CONTEXT: ${sanitizedContext}` : ""}

REQUIREMENTS:
- Generate both a subject line and email body
- Address the coach by name
- Mention specific details about their program/school
- Include relevant athletic and academic achievements
- Express genuine interest in the program
- Include a call to action (visit, phone call, etc.)
- Keep the email between 150-300 words
- Be authentic and personal, not generic

Return the response in this exact JSON format:
{"subject": "Your subject line here", "body": "Your email body here"}`;

  const client = getClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  try {
    const parsed = JSON.parse(content.text);
    return { subject: parsed.subject as string, body: parsed.body as string };
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { subject: parsed.subject as string, body: parsed.body as string };
    }
    throw new Error("Failed to parse AI response");
  }
}
