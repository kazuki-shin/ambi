import { NextResponse } from 'next/server';
// import { v4 as uuidv4 } from 'uuid';
// import { createSession } from '@/lib/session';

export async function GET() {
  console.log("NEXT_PUBLIC_AGENT_ID:", process.env.NEXT_PUBLIC_AGENT_ID);
  console.log("ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY);
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.NEXT_PUBLIC_AGENT_ID}`,
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("ElevenLabs API Error:", response.status, response.statusText, errorBody);
      throw new Error(
        `Failed to get signed URL from ElevenLabs: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID;
    const apiKeyExists = !!process.env.ELEVENLABS_API_KEY;
    return NextResponse.json(
      {
        error: "Failed to generate signed URL",
        details: `Agent ID: ${agentId}, API Key Exists: ${apiKeyExists}`,
        originalError: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
