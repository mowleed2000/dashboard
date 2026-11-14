"use client";

import React from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export function AudioPlayer() {
  const { isPlaying, togglePlay, isMuted, toggleMute, volume, setVolume, track } = useAudio();

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FCFAF6] border border-[#E8E2D5] text-[#252820] text-xs shadow-xs">
      {/* Rod Wave Album Art Thumbnail */}
      <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-[#E8E2D5] bg-[#252820]">
        <img
          src={track.coverUrl}
          alt={track.artist}
          className="w-full h-full object-cover"
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E98569] animate-ping" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 font-medium text-[#5E6454]">
        <span className="hidden sm:inline truncate max-w-[140px]" title={`${track.artist} - ${track.title}`}>
          {track.artist} • {track.title}
        </span>
      </div>

      <button
        onClick={togglePlay}
        className="p-1 rounded-full hover:bg-[#E8E2D5]/50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#E98569]"
        title={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
        aria-label={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 text-[#252820]" />
        ) : (
          <Play className="w-3.5 h-3.5 text-[#252820] fill-[#252820]" />
        )}
      </button>

      <div className="hidden md:flex items-center gap-1.5">
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
          }}
          className="w-12 h-1 bg-[#E8E2D5] rounded-lg appearance-none cursor-pointer accent-[#E98569]"
          title={`Volume: ${Math.round(volume * 100)}%`}
          aria-label="Soundtrack Volume"
        />
      </div>
    </div>
  );
}

