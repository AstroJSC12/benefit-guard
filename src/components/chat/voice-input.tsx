"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscription, disabled }: VoiceInputProps) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [levels, setLevels] = useState<number[]>([0, 0, 0, 0, 0]);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAnalyser();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Listen for keyboard shortcut toggle (⌘⇧M)
  useEffect(() => {
    const handleToggle = () => {
      if (disabled) return;
      handleClick();
    };
    window.addEventListener("bg:toggle-voice", handleToggle);
    return () => window.removeEventListener("bg:toggle-voice", handleToggle);
  });

  const stopAnalyser = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const updateLevels = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 5 frequency bands for the 5 bars
    const bandSize = Math.floor(dataArray.length / 5);
    const newLevels = Array.from({ length: 5 }, (_, i) => {
      const start = i * bandSize;
      const slice = dataArray.slice(start, start + bandSize);
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      // Normalize to 0-1 range with a minimum so bars are always slightly visible
      return Math.max(0.15, avg / 255);
    });

    setLevels(newLevels);
    animationRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const startRecording = async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for waveform visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stopAnalyser();
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });

        // Don't send if too small (user clicked stop immediately)
        if (audioBlob.size < 1000) {
          setState("idle");
          setLevels([0, 0, 0, 0, 0]);
          return;
        }

        setState("transcribing");
        setLevels([0, 0, 0, 0, 0]);

        try {
          const extension = mimeType.includes("webm") ? "webm" : "m4a";
          const formData = new FormData();
          formData.append("audio", audioBlob, `recording.${extension}`);

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Transcription failed");

          const data = await response.json();
          if (data.text?.trim()) {
            onTranscription(data.text.trim());
          }
        } catch (err) {
          console.error("Transcription error:", err);
          setError("Couldn't transcribe. Try again.");
        } finally {
          setState("idle");
        }
      };

      mediaRecorder.start(250); // Collect data every 250ms
      setState("recording");

      // Start waveform animation
      updateLevels();
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied. Check your browser permissions.");
      setState("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClick = () => {
    if (state === "idle") {
      startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
    // Do nothing if transcribing — let it finish
  };

  return (
    <div className="relative flex items-center">
      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full mb-2 right-0 bg-destructive text-destructive-foreground text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">
          {error}
        </div>
      )}

      {state === "recording" ? (
        // Recording state: waveform bars + stop button
        <div className="flex items-center gap-2 bg-destructive/10 rounded-full pl-3 pr-1 py-1 animate-in fade-in duration-200">
          {/* Live waveform bars */}
          <div className="flex items-center gap-[3px] h-6">
            {levels.map((level, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-destructive transition-all duration-75"
                style={{
                  height: `${Math.max(4, level * 24)}px`,
                }}
              />
            ))}
          </div>

          {/* Recording time indicator dot */}
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />

          {/* Stop button */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-destructive/20"
            onClick={handleClick}
          >
            <Square className="w-3.5 h-3.5 text-destructive fill-destructive" />
          </Button>
        </div>
      ) : (
        // Idle or transcribing state: single button
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`h-[60px] w-10 rounded-lg ${
            state === "transcribing"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          disabled={disabled || state === "transcribing"}
          onClick={handleClick}
          title={state === "transcribing" ? "Transcribing..." : "Voice input"}
        >
          {state === "transcribing" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  );
}
