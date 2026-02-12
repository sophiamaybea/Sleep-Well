import noiseTexture from "@/assets/noise.png";

export default function NoiseOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none opacity-[0.03] mix-blend-overlay">
      <div 
        className="absolute inset-0 animate-noise"
        style={{
          backgroundImage: `url(${noiseTexture})`,
          backgroundSize: '200px 200px'
        }}
      />
    </div>
  );
}
