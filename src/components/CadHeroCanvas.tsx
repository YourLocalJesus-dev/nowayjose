import React, { useEffect, useRef, useState } from "react";

export const CadHeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coords, setCoords] = useState({ x: 382.4, y: 194.0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || 600);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 400);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let angle = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      setCoords({ x: parseFloat(mouseX.toFixed(1)), y: parseFloat(mouseY.toFixed(1)) });
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "#1A2536";
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.translate(cx, cy);

      angle += 0.005;
      ctx.strokeStyle = "#27354A";
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 110, Math.sin(angle) * 110);
      ctx.stroke();

      const drawIsoBox = (bx: number, by: number, bw: number, bh: number, bDepth: number, label: string) => {
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 1;

        ctx.strokeRect(bx, by, bw, bh);

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + bDepth, by - bDepth * 0.6);
        ctx.lineTo(bx + bw + bDepth, by - bDepth * 0.6);
        ctx.lineTo(bx + bw, by);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(bx + bw, by);
        ctx.lineTo(bx + bw + bDepth, by - bDepth * 0.6);
        ctx.lineTo(bx + bw + bDepth, by + bh - bDepth * 0.6);
        ctx.lineTo(bx + bw, by + bh);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "#94A3B8";
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(label, bx, by - 6);
      };

      drawIsoBox(-140, -40, 60, 90, 24, "Housing Block A");
      drawIsoBox(-40, 20, 90, 50, 28, "Transit Corridor");
      drawIsoBox(80, -70, 70, 120, 26, "Rainwater Bioswale");

      ctx.strokeStyle = "#60A5FA";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-140, 70);
      ctx.lineTo(80, 70);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-140, 66);
      ctx.lineTo(-140, 74);
      ctx.moveTo(80, 66);
      ctx.lineTo(80, 74);
      ctx.stroke();

      ctx.fillStyle = "#38BDF8";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("Span: 220.0 m", -30, 66);

      ctx.restore();

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(mouseX, 0);
      ctx.lineTo(mouseX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mouseY);
      ctx.lineTo(width, mouseY);
      ctx.stroke();

      ctx.setLineDash([]);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="hero-cad-viewport">
      <canvas ref={canvasRef} className="cad-canvas-bg" />
      
      <div className="cad-corner cad-corner-tl" />
      <div className="cad-corner cad-corner-tr" />
      <div className="cad-corner cad-corner-bl" />
      <div className="cad-corner cad-corner-br" />

      <div className="cad-hud-overlay">
        <div className="cad-hud-top">
          <span>Vector Draft View</span>
          <span>Azimuth: 042°</span>
        </div>
        <div className="cad-hud-bottom">
          <span>Scale: 1:500</span>
          <span>Cursor: X: {coords.x} Y: {coords.y}</span>
        </div>
      </div>
    </div>
  );
};
