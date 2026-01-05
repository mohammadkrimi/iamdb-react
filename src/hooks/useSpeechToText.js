import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useSpeechToText({
  lang = "en-US",
  continuous = false,
  interimResults = true,
} = {}) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const supported = Boolean(SpeechRecognition);

  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const init = useCallback(() => {
    if (!supported) return null;

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = continuous;
    rec.interimResults = interimResults;

    rec.onstart = () => {
      setError("");
      setListening(true);
    };

    rec.onend = () => {
      setListening(false);
    };

    rec.onerror = (e) => {
      // common: "not-allowed" when mic permission denied
      setError(e?.error || "speech_error");
      setListening(false);
    };

    rec.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text.trim());
    };

    recognitionRef.current = rec;
    return rec;
  }, [SpeechRecognition, supported, lang, continuous, interimResults]);

  useEffect(() => {
    if (!supported) return;
    const rec = init();
    return () => {
      try {
        rec?.abort?.();
      } catch {}
    };
  }, [supported, init]);

  const start = useCallback(() => {
    if (!supported) return;
    setTranscript("");
    setError("");
    try {
      recognitionRef.current?.start?.();
    } catch {
    
    }
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      recognitionRef.current?.stop?.();
    } catch {}
  }, [supported]);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (listening) stop();
    else start();
  }, [supported, listening, start, stop]);

  return useMemo(
    () => ({
      supported,
      listening,
      transcript,
      error,
      start,
      stop,
      toggle,
      setTranscript,
    }),
    [supported, listening, transcript, error, start, stop, toggle]
  );
}