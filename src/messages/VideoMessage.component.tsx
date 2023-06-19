export interface VideoMessageProps {
  url: string;
}

export const VideoMessage: React.FC<VideoMessageProps> = ({ url }) => (
  <video controls style={{ paddingTop: 8, paddingBottom: 8 }}>
    <source src={url} type="video/mp4" />
    <track kind="captions" />
  </video>
);
