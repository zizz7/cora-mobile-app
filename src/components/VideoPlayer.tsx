/**
 * VideoPlayer — wraps expo-video's useVideoPlayer hook in a component.
 *
 * expo-av is deprecated in SDK 54. This component replaces <Video> from expo-av
 * with <VideoView> from expo-video, while keeping the same simple API surface.
 *
 * Usage:
 *   <VideoPlayer uri="https://..." style={styles.media} loop />
 */
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { VideoView, useVideoPlayer, VideoContentFit } from 'expo-video';

interface VideoPlayerProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  /** Whether the video should loop. Default: false */
  loop?: boolean;
  /** Whether to show native playback controls. Default: true */
  nativeControls?: boolean;
  /** How the video should be resized to fit its container. Default: 'cover' */
  contentFit?: VideoContentFit;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  style,
  loop = false,
  nativeControls = true,
  contentFit = 'cover',
}) => {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = loop;
  });

  return (
    <VideoView
      player={player}
      style={style}
      nativeControls={nativeControls}
      contentFit={contentFit}
    />
  );
};
