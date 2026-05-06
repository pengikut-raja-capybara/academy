import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateProgress } from "../../features/learning/learningSlice";
import { Play, Pause, Maximize } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.learning.progress[lessonId]);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

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

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current?.parentElement?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const playbackPct = totalDuration > 0 ? Math.round((currentSeconds / totalDuration) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl relative group">
        <div className="aspect-video relative bg-black">
          {/* 1. Dedicated Player Container */}
          <div ref={containerRef} className="w-full h-full scale-[1.01]"></div>

          {/* 2. React-managed Overlays */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10">
              <span className="text-muted-foreground font-medium">Memuat Cinema...</span>
            </div>
          )}
        </div>

        {/* --- PREMIUM CUSTOM CONTROLS --- */}
        <div className="py-2 px-4 bg-card border-t border-border space-y-2 select-none">
          {/* Top: Interactive Seek Bar */}
          <div onClick={handleSeek} className="group/bar h-2 bg-muted rounded-full overflow-hidden cursor-pointer relative">
            <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${playbackPct}%` }} />
            <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover/bar:opacity-100 bg-primary/10 transition-opacity" />
          </div>

          {/* Bottom: Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-muted-foreground hover:text-primary transition-colors active:scale-90">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              {/* Time Display */}
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-tighter">
                <span className="text-primary">{formatTime(currentSeconds)}</span>
                <span className="text-muted-foreground/30">/</span>
                <span className="text-muted-foreground">{formatTime(totalDuration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">{Math.round(playbackPct)}% Selesai</div>
              <button onClick={toggleFullscreen} className="text-muted-foreground hover:text-primary transition-colors">
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
