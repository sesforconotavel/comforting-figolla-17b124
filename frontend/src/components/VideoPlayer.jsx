import React from "react";

// Converts common video links (YouTube, Vimeo, Google Drive) into an embeddable URL.
function getEmbed(url) {
  if (!url) return null;
  const u = url.trim();

  // YouTube
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };

  // Vimeo
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };

  // Google Drive
  const gd = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gd) return { type: "iframe", src: `https://drive.google.com/file/d/${gd[1]}/preview` };

  // Direct video file
  return { type: "video", src: u };
}

export default function VideoPlayer({ url, index = 0 }) {
  const embed = getEmbed(url);
  if (!embed) return null;

  if (embed.type === "iframe") {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }} data-testid={`detail-video-${index}`}>
        <iframe
          src={embed.src}
          title={`video-${index}`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video src={embed.src} controls playsInline preload="metadata"
      className="w-full rounded-xl bg-black" data-testid={`detail-video-${index}`} />
  );
}
