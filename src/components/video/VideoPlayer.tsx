import { useEffect, useRef, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProgress } from "../../features/learning/learningSlice";
import { Play, Pause, Maximize2, Minimize2 } from "lucide-react";

type Props = {
  lessonId: string;
  video?: string;
  title?: string;
  description?: string;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export default function VideoPlayer({ lessonId, video }: Props) {
  const [isWide, setIsWide] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.learning.progress[lessonId]);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [hoverPct, setHoverPct] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const createPlayer = () => {
      if (!mounted || !containerRef.current || !window.YT || !window.YT.Player) return;

      // YouTube API will take care of the ref

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "100%",
        width: "100%",
        videoId: video,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          iv_load_policy: 3,
          fs: 0,
          showinfo: 0,
          autohide: 1,
        },
        events: {
          onReady: () => {
            if (mounted) {
              setIsReady(true);
              const duration = Math.ceil(playerRef.current.getDuration());
              setTotalDuration(duration);
              if (mounted && playerRef.current && progress?.lastWatchedSec) {
                // Some browsers require play call before seek/pause works reliably
                playerRef.current.playVideo();
                playerRef.current.seekTo(progress.lastWatchedSec, true);
                setCurrentSeconds(progress.lastWatchedSec);
                setTimeout(() => {
                  playerRef.current.pauseVideo();
                }, 300);
              }
            }
          },
          onStateChange: (e: any) => {
            if (e.data === 1) {
              setIsPlaying(true);
              startSampling();
            } else {
              setIsPlaying(false);
              stopSampling();
            }
          },
          onError: () => {
            console.error("YouTube Player Error");
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        createPlayer();
      };
    } else {
      // Small timeout to ensure DOM is ready after remount
      const timeout = setTimeout(createPlayer, 50);
      return () => clearTimeout(timeout);
    }

    function startSampling() {
      if (intervalRef.current) return;
      intervalRef.current = window.setInterval(() => {
        const p = playerRef.current;
        if (!p || !p.getCurrentTime) return;
        const currentTime = Math.floor(p.getCurrentTime());
        const duration = Math.ceil(p.getDuration());

        if (mounted) {
          setCurrentSeconds(currentTime);
          setTotalDuration(duration);
        }

        if (duration > 0 && video) {
          dispatch(updateProgress({ videoId: video, second: currentTime, duration }));
        }
      }, 1000); // Sample every 1 second for smoother UI
    }

    function stopSampling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      mounted = false;
      stopSampling();
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [video, dispatch]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedPct = x / rect.width;
    const seekTime = Math.floor(clickedPct * totalDuration);
    playerRef.current.seekTo(seekTime, true);
    setCurrentSeconds(seekTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let pct = (e.clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    setHoverPct(pct);
  };

  const handleMouseLeave = () => {
    setHoverPct(null);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleWide = useCallback(() => setIsWide((prev) => !prev), []);

  // Close on Escape
  useEffect(() => {
    if (!isWide) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsWide(false);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isWide]);

  const formatTime = (sec: number) => {
    const mathSec = Math.floor(sec);
    const m = Math.floor(mathSec / 60);
    const s = mathSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const playbackPct = totalDuration > 0 ? (currentSeconds / totalDuration) * 100 : 0;

  // Watch progress
  const minPct = totalDuration;
  const isVideoCompleted = playbackPct >= minPct;
  const displayPlaybackPct = Math.round(playbackPct);

  /* ─── Shared Controls Bar ──────────────────────── */
  const controlsBar = (
    <div className={`flex flex-col gap-2 py-2 px-4 select-none border-t ${isWide ? "border-white/10 bg-black/80" : "border-border bg-card"}`}>
      {/* Seek Bar */}
      <div className="relative py-2 -my-2 group/bar cursor-pointer" onClick={handleSeek} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className={`h-2 rounded-full overflow-hidden relative ${isWide ? "bg-white/30" : "bg-gray-700"}`}>
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            style={{ width: `${playbackPct || 0}%` }}
          />
          <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover/bar:opacity-100 bg-white/20 transition-opacity" />
        </div>

        {/* Hover Tooltip */}
        {hoverPct !== null && totalDuration > 0 && (
          <div
            className="absolute bottom-full mb-1 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10"
            style={{ left: `${hoverPct * 100}%` }}
          >
            {formatTime(hoverPct * totalDuration)}
          </div>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3 sm:gap-5">
          <button 
            onClick={togglePlay} 
            className={`p-1.5 sm:p-2 rounded-full transition-all active:scale-90 ${isWide ? "text-white hover:bg-white/10" : "text-primary hover:bg-primary/10"}`}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          
          <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs tracking-wide">
            <span className={isWide ? "text-white" : "text-foreground"}>{formatTime(currentSeconds)}</span>
            <span className={isWide ? "text-white/40" : "text-muted-foreground/50"}>/</span>
            <span className={isWide ? "text-white/60" : "text-muted-foreground"}>{formatTime(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Learning Progress Indicator */}
          <div className="flex items-center gap-2.5">
            <div className={`hidden sm:block w-16 h-1 rounded-full overflow-hidden ${isWide ? "bg-white/10" : "bg-muted"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isVideoCompleted ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}
                style={{ width: `${playbackPct}%` }}
              />
            </div>
            <div
              className={`px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                isVideoCompleted
                  ? isWide
                    ? "text-green-400 bg-green-400/10"
                    : "text-green-600 bg-green-600/10 dark:text-green-400 dark:bg-green-400/10"
                  : isWide
                    ? "text-white/70"
                    : "text-muted-foreground"
              }`}
            >
              {isVideoCompleted ? "Tuntas" : `${displayPlaybackPct}%`}
            </div>
          </div>

          <div className={`w-px h-4 ${isWide ? "bg-white/10" : "bg-border"}`} />

          <button
            onClick={toggleWide}
            className={`p-1.5 sm:p-2 rounded-full transition-all ${isWide ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
            title={isWide ? "Mode Normal" : "Mode Cinema"}
          >
            {isWide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop overlay */}
      {isWide && <div className="fixed inset-0 z-[9998] bg-black/90 animate-in fade-in duration-300" onClick={toggleWide} />}

      {/* Single container: inline by default, fixed overlay when cinema */}
      <div className={`transition-all duration-300 ease-in-out ${isWide ? "fixed inset-0 z-[9999] flex flex-col py-4 sm:py-8" : "max-w-4xl mx-auto"}`}>
        {/* Cinema top bar */}
        {isWide && (
          <div className="shrink-0 w-full max-w-6xl mx-auto flex items-center justify-between px-4 mb-4">
            <span className="text-white/40 text-xs font-bold tracking-widest uppercase">Studio Mode</span>
          </div>
        )}

        {/* Video card */}
        <div
          className={`overflow-hidden relative group ${isWide ? "flex-1 min-h-0 w-full max-w-6xl mx-auto rounded-xl shadow-2xl shadow-black/50" : "bg-card border border-border rounded-2xl shadow-2xl"}`}
        >
          <div className={`relative bg-black ${isWide ? "w-full h-full" : "aspect-video"}`}>
            <div ref={containerRef} className="w-full h-full scale-[1.01]" />
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
                <span className="text-muted-foreground font-medium">Memuat Video...</span>
              </div>
            )}
          </div>

          {/* Controls inside card when normal mode */}
          {!isWide && controlsBar}
        </div>

        {/* Controls floating at bottom when cinema */}
        {isWide && <div className="shrink-0 w-full max-w-6xl mx-auto mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-xl">{controlsBar}</div>}
      </div>
    </>
  );
}
