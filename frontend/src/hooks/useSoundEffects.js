import React, { useEffect, useRef, useState } from "react";
import bgmusic from "../assets/bg_music.mp3";
import sounds from "../assets/sprite_audio.mp3";

const SOUND_EVENTS = {
  CRASH: { start: 2, end: 5 },
  TAKEOFF: { start: 6, end: 8 },
  WIN: { start: 9, end: 12 },
};
const useSoundEffects = () => {
  const audioContextRef = useRef(null);
  const bgMusicSourceRef = useRef(null);
  const bgMusicBufferRef = useRef(null);
  const soundBufferRef = useRef(null);
  const gainNodeRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [isSound, setIsSound] = useState(true);
  const isSoundRef = useRef(true);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  useEffect(() =>{
    isSoundRef.current = isSound;
  },[isSound]);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new window.AudioContext();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);

    const loadAudio = async () => {
      try {
        // Load buffers
        const [bgBuffer, soundBuffer] = await Promise.all([
          fetchAudio(bgmusic),
          fetchAudio(sounds),
        ]);

        bgMusicBufferRef.current = bgBuffer;
        soundBufferRef.current = soundBuffer;
      } catch (err) {
        console.log("Error loading Audio");
      }
    };

    const fetchAudio = async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return audioContextRef.current.decodeAudioData(arrayBuffer);
    };

    loadAudio();

    return () => {
      // Cleanup
      stopMusic();
      audioContextRef.current?.close();
    };
  }, []);

  const playMusic = () => {
    if (!bgMusicBufferRef.current || bgMusicSourceRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = bgMusicBufferRef.current;
    source.loop = true;
    source.connect(gainNodeRef.current);

    const bufferDuration = bgMusicBufferRef.current.duration;
    const offset = pausedTimeRef.current % bufferDuration;

    source.start(0, offset);
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    bgMusicSourceRef.current = source;
  };

  const stopMusic = () => {
    if (!bgMusicSourceRef.current) return;

    // Calculate and store pause position
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    const bufferDuration = bgMusicBufferRef.current.duration;
    pausedTimeRef.current = elapsed % bufferDuration;

    bgMusicSourceRef.current.stop();
    bgMusicSourceRef.current.disconnect();
    bgMusicSourceRef.current = null;
  };

  const playSound = (sound) => {
    if (!isSoundRef.current || !soundBufferRef.current) return;

    const { start, end } = SOUND_EVENTS[sound];
    const source = audioContextRef.current.createBufferSource();
    source.buffer = soundBufferRef.current;
    source.connect(gainNodeRef.current);
    source.start(0, start, end - start);
  };

  const playCrash = () => playSound("CRASH");
  const playTakeoff = () => playSound("TAKEOFF");
  const playWin = () => playSound("WIN");

  const toggle = async () => {
    try {
      await audioContextRef.current.resume();
      if (playing) {
        stopMusic();
      } else {
        playMusic();
      }
      setPlaying(!playing);
    } catch (err) {
      console.error("Audio toggle failed:", err);
    }
  };
  const toggleSound = () =>{
    setIsSound(!isSound);
  }
  return {
    toggle,
    playing,
    isSound,
    toggleSound,
    playCrash,
    playTakeoff,
    playWin,
  };
};

export default useSoundEffects;
