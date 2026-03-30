import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Bug, GitBranch, Palette, Leaf, DollarSign, PenTool, Shield, Settings } from 'lucide-react';

const AGENTS = [
  { id: 'conductor', icon: Terminal, label: 'Conductor' },
  { id: 'genius_coder', icon: Cpu, label: 'Genius' },
  { id: 'fix_debug', icon: Bug, label: 'Fix' },
  { id: 'gitops', icon: GitBranch, label: 'GitOps' },
  { id: 'visual', icon: Palette, label: 'Visual' },
  { id: 'garden', icon: Leaf, label: 'Garden' },
  { id: 'monetisation', icon: DollarSign, label: 'Money' },
  { id: 'literary', icon: PenTool, label: 'Lit' },
  { id: 'qa', icon: Shield, label: 'QA' },
  { id: 'keeper', icon: Settings, label: 'Keeper' },
];

export const EICCommandBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('conductor');
  const [input, setInput] = useState('');

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] bg-[#0d1e2d]/90 backdrop-blur-md border-b border-[#c4a24d]/30 text-[#f0eeea] font-serif">
      <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                selectedAgent === agent.id ? 'bg-[#c4a24d] text-[#0d1e2d]' : 'hover:bg-[#f0eeea]/10'
              }`}
            >
              <agent.icon size={14} />
              <span>{agent.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center bg-[#0d1e2d] rounded-lg border border-[#c4a24d]/20 px-3">
          <input
            type="text"
            placeholder={`Command ${selectedAgent}...`}
            className="w-full bg-transparent py-1.5 text-sm focus:outline-none placeholder-[#f0eeea]/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button className="bg-[#c4a24d] text-[#0d1e2d] px-4 py-1 rounded-lg text-sm font-bold hover:brightness-110">
          Run
        </button>
      </div>
    </div>
  );
};
