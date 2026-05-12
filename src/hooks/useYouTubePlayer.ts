import { useEffect, useRef, useState, useCallback } from "react";

// Module-level flag to prevent inserting the YouTube API script more than once per session
let ytScriptLoading = false;
let ytReadyCallbacks: (() => void)[] = [];

function ensureYouTubeApiLoaded(onReady: () => void) {
  if (window.YT?.Player) {
    onReady();
    return;
  }

  ytReadyCallbacks.push(onReady);

  if (ytScriptLoading) return;
  
  // Check if script tag already exists but API not ready
  const existingTag = document.querySelector('script[src*="youtube.com/iframe_api"]');
  if (existingTag) {
    ytScriptLoading = true;
    return;
  }

  ytScriptLoading = true;

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.onerror = () => {
    console.error("Failed to load YouTube IFrame API script");
    ytScriptLoading = false;
    // We don't clear callbacks here, maybe they'll work on next attempt
  };

  const firstScriptTag = document.getElementsByTagName("script")[0];
  if (firstScriptTag && firstScriptTag.parentNode) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    document.head.appendChild(tag);
  }

  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (prev) prev();
    const callbacks = ytReadyCallbacks.splice(0);
    callbacks.forEach((cb) => cb());
  };
}

type YouTubePlayerStateChangeEvent = {
  data: number;
};

type YouTubePlayer = {
  destroy: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getIframe: () => HTMLIFrameElement;
};

type YouTubePlayerOptions = {
  height: string;
  width: string;
  videoId?: string;
  playerVars: Record<string, number>;
  events: {
    onReady: () => void;
    onStateChange: (event: YouTubePlayerStateChangeEvent) => void;
    onError: () => void;
  };
};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: (() => void) | null;
  }
}

interface UseYouTubePlayerProps {
  videoId?: string;
  onReady?: (player: YouTubePlayer) => void;
  onStateChange?: (state: number) => void;
  onError?: () => void;
}

export function useYouTubePlayer({ videoId, onReady, onStateChange, onError }: UseYouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const onReadyRef = useRef(onReady);
  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReadyRef.current = onReady;
    onStateChangeRef.current = onStateChange;
    onErrorRef.current = onError;
  }, [onReady, onStateChange, onError]);

  const readyTimeoutRef = useRef<number | null>(null);
  const apiPollRef = useRef<number | null>(null);

  const clearReadyTimeout = useCallback(() => {
    if (readyTimeoutRef.current !== null) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }
  }, []);

  const clearApiPoll = useCallback(() => {
    if (apiPollRef.current !== null) {
      clearInterval(apiPollRef.current);
      apiPollRef.current = null;
    }
  }, []);

  const markUnavailable = useCallback(() => {
    setLoadError(true);
    setIsReady(false);
    onErrorRef.current?.();
    playerRef.current?.destroy?.();
  }, []);

  useEffect(() => {
    let mounted = true;

    const finalizePlayerCreation = () => {
      if (!mounted || !containerRef.current || !window.YT?.Player) return false;

      clearReadyTimeout();
      clearApiPoll();

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 0,
          disablekb: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (mounted) {
              clearReadyTimeout();
              clearApiPoll();
              setIsReady(true);
              setLoadError(false);
              if (playerRef.current) {
                onReadyRef.current?.(playerRef.current);
              }
            }
          },
          onStateChange: (e: YouTubePlayerStateChangeEvent) => {
            if (mounted) {
              onStateChangeRef.current?.(e.data);
            }
          },
          onError: () => {
            if (!mounted) return;
            clearReadyTimeout();
            clearApiPoll();
            markUnavailable();
          },
        },
      });

      readyTimeoutRef.current = window.setTimeout(() => {
        if (!mounted || isReady || loadError) return;
        markUnavailable();
      }, 15000);

      return true;
    };

    const tryCreatePlayer = () => {
      if (finalizePlayerCreation()) return;

      clearApiPoll();
      apiPollRef.current = window.setInterval(() => {
        if (!mounted) {
          clearApiPoll();
          return;
        }
        if (finalizePlayerCreation()) {
          clearApiPoll();
        }
      }, 200);
    };

    ensureYouTubeApiLoaded(() => {
      if (mounted) tryCreatePlayer();
    });

    return () => {
      mounted = false;
      clearReadyTimeout();
      clearApiPoll();
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying player:", e);
        }
      }
    };
  }, [videoId, markUnavailable, clearApiPoll, clearReadyTimeout]);

  return { containerRef, playerRef, isReady, loadError };
}
