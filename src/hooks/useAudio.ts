import { useState, useRef, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// ─── TTS 朗读 ────────────────────────────────────────────────────
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, rate: number = 0.9) => {
    // 停止当前朗读
    Speech.stop();
    setIsSpeaking(true);

    Speech.speak(text, {
      language: 'en-US',
      rate,          // 0.1 ~ 1.0，0.9 接近正常语速
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}

// ─── 录音 + 回放 ─────────────────────────────────────────────────
export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // 请求麦克风权限
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setDurationMs(0);
      setRecordingUri(null);

      // 计时
      timerRef.current = setInterval(() => {
        setDurationMs(prev => prev + 100);
      }, 100);

      return true;
    } catch (e) {
      console.error('Failed to start recording:', e);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      if (uri) setRecordingUri(uri);

      // 恢复音频模式（允许播放）
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      return uri;
    } catch (e) {
      console.error('Failed to stop recording:', e);
      setIsRecording(false);
      return null;
    }
  }, []);

  const playRecording = useCallback(async (uri?: string) => {
    const target = uri || recordingUri;
    if (!target) return;
    try {
      // 卸载旧的 sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: target },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.error('Failed to play recording:', e);
      setIsPlaying(false);
    }
  }, [recordingUri]);

  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    recordingUri,
    durationMs,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
  };
}
