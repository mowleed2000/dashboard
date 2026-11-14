"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Exact file path copied to public directory
  const audioSrc = "/assets/dashboard/Rod Wave - LaCosa Nostra (Official Audio) - RodWave.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setHasInteracted(true);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Audio playback prevented by browser:", err));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FCFAF6] border border-[#E8E2D5] text-[#252820] text-xs shadow-xs">
      <audio ref={audioRef} src={audioSrc} loop preload="none" />
      
      <div className="flex items-center gap-1.5 font-medium text-[#5E6454]">
        <Music className={`w-3.5 h-3.5 ${isPlaying ? "text-[#E98569] animate-pulse" : "text-[#5E6454]"}`} />
        <span className="hidden md:inline truncate max-w-[130px]" title="Rod Wave - LaCosa Nostra">
          Rod Wave — Soundtrack
        </span>
      </div>

      <button
        onClick={togglePlay}
        className="p-1 rounded-full hover:bg-[#E8E2D5]/50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#E98569]"
        title={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
        aria-label={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#252820]" /> : <Play className="w-3.5 h-3.5 text-[#252820] fill-[#252820]" />}
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleMute}
          className="p-1 rounded-full hover:bg-[#E8E2D5]/50 transition-colors focus:outline-hidden"
          title={isMuted ? "Unmute" : "Mute"}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#5E6454]" /> : <Volume2 className="w-3.5 h-3.5 text-[#5E6454]" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-14 h-1 bg-[#E8E2D5] rounded-lg appearance-none cursor-pointer accent-[#E98569]"
          title={`Volume: ${Math.round(volume * 100)}%`}
          aria-label="Soundtrack Volume"
        />
      </div>
    </div>
  );
}
