import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";
import { retrieveContext, buildContextPrompt } from "@/lib/rag";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Please sign in to continue" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, conversationId } = await request.json();

    if (!message || !conversationId) {
      return new Response(
        JSON.stringify({ error: "Missing required information. Please refresh and try again." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanity check: don't process empty or excessively long messages
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please enter a message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (trimmedMessage.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Message is too long. Please shorten your message." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: "This conversation no longer exists. Please start a new chat." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: message,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { state: true, zipCode: true },
    });

    // RAG retrieval: fetch relevant context from user documents and knowledge base
    // This is non-critical - if it fails, we continue without context
    let contextPrompt = "";
    try {
      const context = await retrieveContext(
        trimmedMessage,
        session.user.id,
        user?.state
      );
      contextPrompt = buildContextPrompt(context);
      console.log(`RAG retrieved: ${context.userDocuments.length} doc chunks, ${context.knowledgeBase.length} KB entries`);
      context.userDocuments.forEach((d, i) => {
        console.log(`  Doc[${i}] sim=${d.similarity.toFixed(3)} src="${d.source}" preview="${d.content.substring(0, 120)}..."`);
      });
      context.knowledgeBase.forEach((kb, i) => {
        console.log(`  KB[${i}]  sim=${kb.similarity.toFixed(3)} src="${kb.source}"${kb.sourceUrl ? " url=✓" : ""}`);
      });
    } catch (ragError) {
      // RAG failure is not fatal - log and continue with base knowledge
      console.error("RAG retrieval error (non-fatal):", ragError);
    }

    const systemPromptWithContext = contextPrompt
      ? `${SYSTEM_PROMPT}\n\n=== THE USER'S ACTUAL PLAN DOCUMENTS AND KNOWLEDGE BASE ===\nUse the following information to answer the user's question. Cite specific details. For user documents, include [View Source] links. For laws and regulations, include [Official Source] links. Both link types are provided in the context below.\n\n${contextPrompt}`
      : SYSTEM_PROMPT;

    const chatHistory = conversation.messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const messages = [
      { role: "system" as const, content: systemPromptWithContext },
      ...chatHistory,
      { role: "user" as const, content: trimmedMessage },
    ];

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 1500,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          // Save to DB — but don't kill the stream if this fails
          try {
            await prisma.message.create({
              data: {
                conversationId,
                role: "assistant",
                content: fullResponse,
              },
            });

            if (conversation.title === "New Conversation" && fullResponse) {
              const titleSummary = message.slice(0, 50);
              await prisma.conversation.update({
                where: { id: conversationId },
                data: { title: titleSummary + (message.length > 50 ? "..." : "") },
              });
            }
          } catch (dbError) {
            console.error("Failed to save assistant message to DB:", dbError);
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    // Provide user-friendly error without leaking internal details
    return new Response(
      JSON.stringify({ 
        error: "Sorry, we couldn't process your message right now. Please try again." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
