import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setVideoAvailability, updateProgress } from "../../../features/learning/learningSlice";
import { Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import { useYouTubePlayer } from "../../../hooks/useYouTubePlayer";

type Props = {
  lessonId: string;
  video?: string;
  title?: string;
  description?: string;
};

export default function VideoPlayer({ lessonId, video }: Props) {
  const [isWide, setIsWide] = useState(false);
  const dispatch = useAppDispatch();
  const progress = useAppSelector((state) => state.learning.progress[lessonId]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  
  const progressRef = useRef(progress);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const stopSampling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startSampling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p || !p.getCurrentTime) return;
      const currentTime = Math.floor(p.getCurrentTime());
      const duration = Math.ceil(p.getDuration());

      setCurrentSeconds(currentTime);
      setTotalDuration(duration);

      if (duration > 0 && video) {
        dispatch(updateProgress({ videoId: video, second: currentTime, duration }));
      }
    }, 1000);
  }, [dispatch, video]);

  const onPlayerReady = useCallback((player: any) => {
    dispatch(setVideoAvailability({ lessonId, available: true }));
    
    const startSeconds = progressRef.current?.lastWatchedSec || 0;
    
    if (video) {
      player.cueVideoById({
        videoId: video,
        startSeconds: startSeconds
      });
      setCurrentSeconds(startSeconds);
    }
    
    // We can't get duration immediately after cueing, 
    // so we'll wait for the next state change or a small delay
    setTimeout(() => {
      if (player.getDuration) {
        setTotalDuration(Math.ceil(player.getDuration()));
      }
    }, 1000);
  }, [dispatch, lessonId, video]);

  const onPlayerStateChange = useCallback((state: number) => {
    if (state === 1) { // Playing
      setIsPlaying(true);
      startSampling();
    } else {
      setIsPlaying(false);
      stopSampling();
    }
  }, [startSampling, stopSampling]);

  const onPlayerError = useCallback(() => {
    dispatch(setVideoAvailability({ lessonId, available: false }));
    stopSampling();
  }, [dispatch, lessonId, stopSampling]);

  const { containerRef, playerRef, isReady, loadError } = useYouTubePlayer({
    videoId: video,
    onReady: onPlayerReady,
    onStateChange: onPlayerStateChange,
    onError: onPlayerError
  });

  useEffect(() => {
    return () => stopSampling();
  }, [stopSampling]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedPct = x / rect.width;
    const seekTime = Math.floor(clickedPct * totalDuration);
    playerRef.current.seekTo(seekTime, true);
    setCurrentSeconds(seekTime);
  }, [totalDuration, playerRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let pct = (e.clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    setHoverPct(pct);
  }, [totalDuration]);

  const handleMouseLeave = useCallback(() => {
    setHoverPct(null);
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying, playerRef]);

  const toggleWide = useCallback(() => setIsWide((prev) => !prev), []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current || !isReady) return;

      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          const curLeft = playerRef.current.getCurrentTime();
          playerRef.current.seekTo(Math.max(0, curLeft - 5), true);
          break;
        case "ArrowRight":
          e.preventDefault();
          const curRight = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          playerRef.current.seekTo(Math.min(duration, curRight + 5), true);
          break;
        case "KeyF":
          e.preventDefault();
          toggleWide();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReady, togglePlay, toggleWide, playerRef]);

  const formatTime = (sec: number) => {
    const mathSec = Math.floor(sec);
    const m = Math.floor(mathSec / 60);
    const s = mathSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const playbackPct = totalDuration > 0 ? (currentSeconds / totalDuration) * 100 : 0;
  const isVideoCompleted = isReady && !loadError && totalDuration > 0 && playbackPct >= 90;
  const displayPlaybackPct = Math.round(playbackPct);

  return (
    <>
      {isWide && (
        <div 
          className="fixed inset-0 z-[9998] bg-black/95 backdrop-blur-md animate-in fade-in duration-300 h-screen w-screen" 
          onClick={toggleWide} 
        />
      )}

      <div className={`transition-all duration-300 ease-in-out ${isWide ? "fixed inset-0 z-[9999] flex flex-col py-4 sm:py-8" : "max-w-4xl mx-auto"}`}>
        {isWide && (
          <div className="shrink-0 w-full max-w-6xl mx-auto flex items-center justify-between px-4 mb-4">
            <span className="text-white/40 text-xs font-bold tracking-widest uppercase">Studio Mode</span>
          </div>
        )}

        <div
          className={`overflow-hidden relative group flex flex-col ${isWide ? "flex-1 min-h-0 w-full max-w-6xl mx-auto rounded-xl shadow-2xl shadow-black/50" : "bg-card border border-border rounded-2xl shadow-2xl"}`}
        >
          <div className={`relative bg-black shrink-0 ${isWide ? "flex-1" : "aspect-video"}`}>
            <div className="w-full h-full overflow-hidden">
              <div ref={containerRef} className="w-full h-full" />
            </div>
            {!isReady && !loadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse z-10 pointer-events-none">
                <span className="text-sm text-slate-300">Memuat Video...</span>
              </div>
            )}
            {loadError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm px-6 text-center text-white border border-white/10 shadow-2xl shadow-black/40">
                <div className="max-w-sm space-y-2">
                  <p className="font-black text-white">Tidak dapat mengakses video</p>
                  <p className="text-sm text-slate-300">Cek jaringan, firewall, atau pembatasan akses ke YouTube.</p>
                  <p className="text-sm text-slate-300">Progress video tidak akan ditandai tuntas sampai video berhasil dimuat.</p>
                </div>
              </div>
            )}
          </div>

          {!isWide && (
            <VideoControls
              isWide={isWide}
              isPlaying={isPlaying}
              currentSeconds={currentSeconds}
              totalDuration={totalDuration}
              hoverPct={hoverPct}
              playbackPct={playbackPct}
              isVideoCompleted={isVideoCompleted}
              displayPlaybackPct={displayPlaybackPct}
              onTogglePlay={togglePlay}
              onToggleWide={toggleWide}
              onSeek={handleSeek}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              formatTime={formatTime}
            />
          )}
        </div>

        {isWide && (
          <div className="shrink-0 w-full max-w-6xl mx-auto mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-xl">
            <VideoControls
              isWide={isWide}
              isPlaying={isPlaying}
              currentSeconds={currentSeconds}
              totalDuration={totalDuration}
              hoverPct={hoverPct}
              playbackPct={playbackPct}
              isVideoCompleted={isVideoCompleted}
              displayPlaybackPct={displayPlaybackPct}
              onTogglePlay={togglePlay}
              onToggleWide={toggleWide}
              onSeek={handleSeek}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              formatTime={formatTime}
            />
          </div>
        )}
      </div>
    </>
  );
}

const VideoControls = memo(({
  isWide,
  isPlaying,
  currentSeconds,
  totalDuration,
  hoverPct,
  playbackPct,
  isVideoCompleted,
  displayPlaybackPct,
  onTogglePlay,
  onToggleWide,
  onSeek,
  onMouseMove,
  onMouseLeave,
  formatTime
}: any) => (
  <div className={`flex flex-col gap-2 py-2 px-4 select-none border-t ${isWide ? "border-white/10 bg-black/80" : "border-border bg-card"}`}>
    <div className="relative py-2 -my-2 group/bar cursor-pointer" onClick={onSeek} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      <div className={`h-2 rounded-full overflow-hidden relative ${isWide ? "bg-white/30" : "bg-gray-700"}`}>
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          style={{ width: `${playbackPct || 0}%` }}
        />
        <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover/bar:opacity-100 bg-white/20 transition-opacity" />
      </div>

      {hoverPct !== null && totalDuration > 0 && (
        <div
          className="absolute bottom-full mb-1 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10"
          style={{ left: `${hoverPct * 100}%` }}
        >
          {formatTime(hoverPct * totalDuration)}
        </div>
      )}
    </div>

    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-3 sm:gap-5">
        <button onClick={onTogglePlay} className={`p-1.5 sm:p-2 rounded-full transition-all active:scale-90 ${isWide ? "text-white hover:bg-white/10" : "text-primary hover:bg-primary/10"}`}>
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>

        <div className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs tracking-wide">
          <span className={isWide ? "text-white" : "text-foreground"}>{formatTime(currentSeconds)}</span>
          <span className={isWide ? "text-white/40" : "text-muted-foreground/50"}>/</span>
          <span className={isWide ? "text-white/60" : "text-muted-foreground"}>{formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
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
          onClick={onToggleWide}
          className={`p-1.5 sm:p-2 rounded-full transition-all ${isWide ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
          title={isWide ? "Mode Normal" : "Mode Studio"}
        >
          {isWide ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </div>
  </div>
));
