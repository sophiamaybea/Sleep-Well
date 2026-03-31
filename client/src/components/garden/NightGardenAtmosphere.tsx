export function NightGardenAtmosphere() {
  return (
    <div className="night-garden-atmosphere fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <div className="absolute top-[-5%] right-[15%] w-[500px] h-[500px] rounded-full animate-moonpulse"
        style={{ background: "radial-gradient(circle, rgba(140, 200, 210, 0.1) 0%, rgba(42, 107, 110, 0.04) 40%, transparent 70%)" }} />
      <div className="absolute top-[12%] left-[8%] w-2 h-2 rounded-full animate-firefly-1" style={{background: "rgba(196, 162, 77, 0.7)", boxShadow: "0 0 10px rgba(196, 162, 77, 0.5)"}} />
      <div className="absolute top-[25%] right-[12%] w-1.5 h-1.5 rounded-full animate-firefly-2" style={{background: "rgba(196, 162, 77, 0.55)", boxShadow: "0 0 8px rgba(196, 162, 77, 0.35)"}} />
      <div className="absolute top-[45%] left-[20%] w-1 h-1 rounded-full animate-firefly-3" style={{background: "rgba(220, 195, 110, 0.45)", boxShadow: "0 0 6px rgba(220, 195, 110, 0.3)"}} />
      <div className="absolute top-[60%] right-[25%] w-2 h-2 rounded-full animate-firefly-4" style={{background: "rgba(196, 162, 77, 0.45)", boxShadow: "0 0 10px rgba(196, 162, 77, 0.35)"}} />
      <div className="absolute top-[35%] left-[75%] w-1.5 h-1.5 rounded-full animate-firefly-5" style={{background: "rgba(220, 195, 110, 0.35)", boxShadow: "0 0 7px rgba(220, 195, 110, 0.25)"}} />
      <div className="absolute top-[70%] left-[40%] w-1 h-1 rounded-full animate-firefly-6" style={{background: "rgba(196, 162, 77, 0.5)", boxShadow: "0 0 6px rgba(196, 162, 77, 0.3)"}} />
      <svg className="absolute bottom-0 left-0 w-full h-48 opacity-[0.05]" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="currentColor">
        <path d="M0 200 L0 140 Q50 100 80 130 Q100 80 130 120 Q160 60 200 110 Q240 70 280 100 Q310 50 350 90 Q380 40 420 80 Q460 30 500 70 Q530 20 570 60 Q600 10 650 50 Q700 30 750 70 Q800 20 850 60 Q900 40 950 80 Q1000 30 1050 70 Q1100 50 1150 90 Q1180 60 1200 100 L1200 200Z" className="text-teal-700" />
      </svg>
      <div className="absolute bottom-0 left-[5%] animate-sway">
        <svg width="30" height="80" viewBox="0 0 30 80" className="opacity-[0.07] text-teal-400" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 80 Q15 60 15 40" />
          <path d="M15 55 Q5 45 3 35 Q2 28 8 30 Q12 32 15 45" />
          <path d="M15 40 Q25 30 27 20 Q28 13 22 15 Q18 17 15 30" />
          <path d="M15 30 Q10 20 8 10 Q7 4 12 8 Q14 12 15 22" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-[8%] animate-sway-slow">
        <svg width="40" height="100" viewBox="0 0 40 100" className="opacity-[0.06] text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 100 Q20 75 20 45" />
          <path d="M20 70 Q8 58 5 45 Q3 36 10 40 Q15 43 20 58" />
          <path d="M20 55 Q32 42 35 30 Q37 22 30 25 Q25 28 20 42" />
          <path d="M20 42 Q12 30 10 18 Q9 10 15 15 Q18 20 20 32" />
          <ellipse cx="20" cy="40" rx="6" ry="3" className="text-teal-300" fill="currentColor" opacity="0.15" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-[35%] animate-sway-fast">
        <svg width="20" height="60" viewBox="0 0 20 60" className="opacity-[0.06] text-teal-400" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M10 60 Q10 45 10 25" />
          <path d="M10 40 Q4 32 3 24 Q2 18 7 22 Q9 25 10 35" />
          <path d="M10 30 Q16 22 17 14 Q18 8 13 12 Q11 15 10 25" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-[30%] animate-sway">
        <svg width="25" height="70" viewBox="0 0 25 70" className="opacity-[0.05] text-teal-500" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M12 70 Q12 55 12 30" />
          <path d="M12 50 Q5 40 4 30 Q3 22 9 27 Q11 30 12 42" />
          <path d="M12 38 Q19 28 20 18 Q21 11 16 15 Q14 18 12 30" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-[60%] animate-sway-slow">
        <svg width="18" height="50" viewBox="0 0 18 50" className="opacity-[0.06] text-teal-400" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M9 50 Q9 35 9 15" />
          <circle cx="9" cy="12" r="5" fill="currentColor" opacity="0.12" />
          <circle cx="9" cy="12" r="3" fill="currentColor" opacity="0.08" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-20">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42, 107, 110, 0.06) 0%, transparent 100%)" }} />
      </div>
    </div>
  );
}
