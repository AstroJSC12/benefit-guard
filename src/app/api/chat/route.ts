import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";
import { retrieveContext, buildContextPrompt } from "@/lib/rag";
import { logApiUsage } from "@/lib/api-usage";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Please sign in to continue" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, conversationId, image } = await request.json();

    if ((!message && !image) || !conversationId) {
      return new Response(
        JSON.stringify({ error: "Missing required information. Please refresh and try again." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanity check: don't process empty or excessively long messages
    const trimmedMessage = (message || "").trim();
    if (trimmedMessage.length === 0 && !image) {
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

    // Validate image if provided (must be a data URI, max ~4MB base64)
    if (image) {
      if (!image.startsWith("data:image/")) {
        return new Response(
          JSON.stringify({ error: "Invalid image format. Please try a different image." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (image.length > 5_500_000) {
        return new Response(
          JSON.stringify({ error: "Image is too large. Please use a smaller screenshot." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
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
        content: message || "[Image]",
        ...(image ? { imageUrl: image } : {}),
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatHistory = conversation.messages.map((m: any) => {
      if (m.imageUrl && m.role === "user") {
        // Multimodal message from history — include the image
        return {
          role: m.role as "user",
          content: [
            ...(m.content && m.content !== "[Image]" ? [{ type: "text" as const, text: m.content }] : []),
            { type: "image_url" as const, image_url: { url: m.imageUrl, detail: "high" as const } },
          ],
        };
      }
      return {
        role: m.role as "user" | "assistant",
        content: m.content,
      };
    });

    // Build the current user message — multimodal if image attached
    type TextPart = { type: "text"; text: string };
    type ImagePart = { type: "image_url"; image_url: { url: string; detail: "high" } };
    type ContentPart = TextPart | ImagePart;

    let userContent: string | ContentPart[];
    if (image) {
      const parts: ContentPart[] = [];
      if (trimmedMessage) {
        parts.push({ type: "text", text: trimmedMessage });
      } else {
        parts.push({ type: "text", text: "Please analyze this image from my insurance document. Describe what you see and explain any important details." });
      }
      parts.push({ type: "image_url", image_url: { url: image, detail: "high" } });
      userContent = parts;
    } else {
      userContent = trimmedMessage;
    }

    const messages = [
      { role: "system" as const, content: systemPromptWithContext },
      ...chatHistory,
      { role: "user" as const, content: userContent },
    ];

    const chatStartTime = Date.now();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
      stream_options: { include_usage: true },
      temperature: 0.3,
      max_tokens: 1500,
    });

    const encoder = new TextEncoder();
    let fullResponse = "";
    let streamUsage: { prompt_tokens: number; completion_tokens: number } | null = null;

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
            // The final chunk contains usage data when stream_options.include_usage is set
            if (chunk.usage) {
              streamUsage = {
                prompt_tokens: chunk.usage.prompt_tokens,
                completion_tokens: chunk.usage.completion_tokens,
              };
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
              const titleSource = trimmedMessage || "Image conversation";
              const titleSummary = titleSource.slice(0, 50);
              await prisma.conversation.update({
                where: { id: conversationId },
                data: { title: titleSummary + (titleSource.length > 50 ? "..." : "") },
              });
            }
          } catch (dbError) {
            console.error("Failed to save assistant message to DB:", dbError);
          }

          // Log API usage (fire-and-forget)
          logApiUsage({
            endpoint: "chat",
            model: "gpt-4o",
            inputTokens: streamUsage?.prompt_tokens || 0,
            outputTokens: streamUsage?.completion_tokens || 0,
            durationMs: Date.now() - chatStartTime,
            userId: session.user.id,
          }).catch(() => {});

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
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error("Chat error message:", errMsg);
    if (errStack) console.error("Chat error stack:", errStack);
    return new Response(
      JSON.stringify({ 
        error: errMsg || "Sorry, we couldn't process your message right now. Please try again." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
