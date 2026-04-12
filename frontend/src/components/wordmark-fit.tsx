"use client";

import { useEffect, useRef, useState } from "react";

export function WordmarkFit({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fontSize, setFontSize] = useState(200);
  const [clipHeight, setClipHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const el = textRef.current;
      if (!container || !el) return;

      const targetWidth = container.offsetWidth;
      let low = 1;
      let high = 2000;

      while (high - low > 0.5) {
        const mid = (low + high) / 2;
        el.style.fontSize = `${mid}px`;
        if (el.scrollWidth <= targetWidth) {
          low = mid;
        } else {
          high = mid;
        }
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const style = window.getComputedStyle(el);
        ctx.font = `${style.fontWeight} ${low}px ${style.fontFamily}`;
        const metrics = ctx.measureText(text);
        const ink =
          (metrics.actualBoundingBoxAscent ?? 0) +
          (metrics.actualBoundingBoxDescent ?? 0);
        setClipHeight(Math.max(1, Math.ceil(ink)));
      }

      setFontSize(low);
    };

    const observer = new ResizeObserver(fit);
    if (containerRef.current) observer.observe(containerRef.current);
    fit();

    return () => observer.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="mb-0 w-full overflow-hidden"
      style={clipHeight !== undefined ? { height: clipHeight } : undefined}
    >
      <p
        ref={textRef}
        className={className}
        style={{
          fontSize: `${fontSize}px`,
          whiteSpace: "nowrap",
          margin: 0,
          padding: 0,
          lineHeight: 1,
          display: "block",
        }}
      >
        {text}
      </p>
    </div>
  );
}
