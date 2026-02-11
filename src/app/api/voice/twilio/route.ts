import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/db";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";
import { retrieveContext, buildContextPrompt } from "@/lib/rag";
import { logApiUsage } from "@/lib/api-usage";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const speechResult = formData.get("SpeechResult") as string | null;
    const callSid = formData.get("CallSid") as string;
    const from = formData.get("From") as string;

    const twiml = new VoiceResponse();

    if (!speechResult) {
      twiml.say(
        {
          voice: "Polly.Joanna",
        },
        "Hello, I'm BenefitGuard, your healthcare insurance assistant. How can I help you today?"
      );

      twiml.gather({
        input: ["speech"],
        action: "/api/voice/twilio",
        method: "POST",
        speechTimeout: "auto",
        language: "en-US",
      });

      return new NextResponse(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const user = await prisma.user.findFirst({
      where: { phone: from },
    });

    let contextPrompt = "";
    if (user) {
      try {
        const context = await retrieveContext(
          speechResult,
          user.id,
          user.state
        );
        contextPrompt = buildContextPrompt(context);
      } catch (error) {
        console.error("RAG error in voice:", error);
      }
    }

    const systemPromptWithContext = contextPrompt
      ? `${SYSTEM_PROMPT}\n\nIMPORTANT: You are speaking on a phone call. Keep responses concise and conversational. Avoid long lists or complex formatting.\n\n--- RELEVANT CONTEXT ---\n${contextPrompt}`
      : `${SYSTEM_PROMPT}\n\nIMPORTANT: You are speaking on a phone call. Keep responses concise and conversational. The caller may not have an account yet.`;

    const voiceStartTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPromptWithContext },
        { role: "user", content: speechResult },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    logApiUsage({
      endpoint: "voice",
      model: "gpt-4-turbo-preview",
      inputTokens: completion.usage?.prompt_tokens || 0,
      outputTokens: completion.usage?.completion_tokens || 0,
      durationMs: Date.now() - voiceStartTime,
      userId: user?.id,
    }).catch(() => {});

    const response =
      completion.choices[0]?.message?.content ||
      "I apologize, I had trouble understanding. Could you please repeat that?";

    twiml.say(
      {
        voice: "Polly.Joanna",
      },
      response
    );

    twiml.gather({
      input: ["speech"],
      action: "/api/voice/twilio",
      method: "POST",
      speechTimeout: "auto",
      language: "en-US",
    });

    twiml.say(
      {
        voice: "Polly.Joanna",
      },
      "I didn't hear anything. Goodbye!"
    );

    if (user) {
      let conversation = await prisma.conversation.findFirst({
        where: {
          userId: user.id,
          title: `Phone Call ${callSid.slice(-8)}`,
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: user.id,
            title: `Phone Call ${callSid.slice(-8)}`,
          },
        });
      }

      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            role: "user",
            content: `[Voice] ${speechResult}`,
          },
          {
            conversationId: conversation.id,
            role: "assistant",
            content: response,
          },
        ],
      });
    }

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Twilio voice error:", error);

    const twiml = new VoiceResponse();
    twiml.say(
      {
        voice: "Polly.Joanna",
      },
      "I apologize, but I'm experiencing technical difficulties. Please try again later or use our web chat at benefit guard dot com."
    );

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
