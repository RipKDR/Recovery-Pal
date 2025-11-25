/**
 * Audio Recorder Hook
 * Handles voice journal recording with expo-av
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as ExpoFileSystem from 'expo-file-system';
import { v4 as uuid } from 'uuid';

// Type workaround for expo-file-system directory constants
const FileSystem = ExpoFileSystem as typeof ExpoFileSystem & {
  documentDirectory: string | null;
};

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  metering: number; // Audio level for waveform visualization
}

export interface AudioFile {
  id: string;
  uri: string;
  duration: number;
  createdAt: Date;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  position: number;
  duration: number;
}

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// Directory for storing voice journals (use documentDirectory for persistent storage)
const VOICE_JOURNAL_DIR = `${FileSystem.documentDirectory}voice-journals/`;

export function useAudioRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    metering: 0,
  });

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    position: 0,
    duration: 0,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize directory and permissions
  useEffect(() => {
    initializeAudio();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(VOICE_JOURNAL_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(VOICE_JOURNAL_DIR, {
          intermediates: true,
        });
      }

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  const cleanup = async () => {
    if (meteringIntervalRef.current) {
      clearInterval(meteringIntervalRef.current);
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
    }
  };

  // Start recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!permissionGranted) {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return false;
      setPermissionGranted(granted);
    }

    try {
      // Stop any existing recording
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
      }

      // Configure for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS,
        (status) => {
          if (status.isRecording) {
            setRecordingState((prev) => ({
              ...prev,
              duration: Math.floor(status.durationMillis / 1000),
              metering: status.metering ?? 0,
            }));
          }
        },
        100 // Update every 100ms
      );

      recordingRef.current = recording;
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        metering: 0,
      });

      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }, [permissionGranted]);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    if (recordingRef.current && recordingState.isRecording) {
      try {
        await recordingRef.current.pauseAsync();
        setRecordingState((prev) => ({ ...prev, isPaused: true }));
      } catch (error) {
        console.error('Failed to pause recording:', error);
      }
    }
  }, [recordingState.isRecording]);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    if (recordingRef.current && recordingState.isPaused) {
      try {
        await recordingRef.current.startAsync();
        setRecordingState((prev) => ({ ...prev, isPaused: false }));
      } catch (error) {
        console.error('Failed to resume recording:', error);
      }
    }
  }, [recordingState.isPaused]);

  // Stop recording and save
  const stopRecording = useCallback(async (): Promise<AudioFile | null> => {
    if (!recordingRef.current) return null;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const status = await recordingRef.current.getStatusAsync();

      if (!uri) return null;

      // Generate unique filename
      const id = uuid();
      const newUri = `${VOICE_JOURNAL_DIR}${id}.m4a`;

      // Move file to permanent location
      await FileSystem.moveAsync({
        from: uri,
        to: newUri,
      });

      const audioFile: AudioFile = {
        id,
        uri: newUri,
        duration: Math.floor((status.durationMillis || 0) / 1000),
        createdAt: new Date(),
      };

      recordingRef.current = null;
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        metering: 0,
      });

      // Reset audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      return audioFile;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }, []);

  // Cancel recording without saving
  const cancelRecording = useCallback(async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      } catch {}
      recordingRef.current = null;
    }

    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      metering: 0,
    });
  }, []);

  // Play audio file
  const playAudio = useCallback(async (uri: string): Promise<boolean> => {
    try {
      // Stop any existing playback
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Load and play
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPlaybackState({
              isPlaying: status.isPlaying,
              isPaused: !status.isPlaying && status.positionMillis > 0,
              position: Math.floor(status.positionMillis / 1000),
              duration: Math.floor((status.durationMillis || 0) / 1000),
            });

            // Reset when finished
            if (status.didJustFinish) {
              setPlaybackState((prev) => ({
                ...prev,
                isPlaying: false,
                position: 0,
              }));
            }
          }
        }
      );

      soundRef.current = sound;
      return true;
    } catch (error) {
      console.error('Failed to play audio:', error);
      return false;
    }
  }, []);

  // Pause playback
  const pausePlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  // Resume playback
  const resumePlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  // Stop playback
  const stopPlayback = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    }
    setPlaybackState({
      isPlaying: false,
      isPaused: false,
      position: 0,
      duration: 0,
    });
  }, []);

  // Seek to position
  const seekTo = useCallback(async (seconds: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seconds * 1000);
    }
  }, []);

  // Delete audio file
  const deleteAudioFile = useCallback(async (uri: string): Promise<boolean> => {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    } catch (error) {
      console.error('Failed to delete audio file:', error);
      return false;
    }
  }, []);

  // Format duration as mm:ss
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Recording
    recordingState,
    permissionGranted,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,

    // Playback
    playbackState,
    playAudio,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,

    // Utilities
    deleteAudioFile,
    formatDuration,
  };
}

