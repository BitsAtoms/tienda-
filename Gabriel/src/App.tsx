/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Monitor, 
  MonitorPlay, 
  Gamepad2, 
  Database, 
  Box, 
  DoorOpen, 
  Plus, 
  Trash2, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Store3D from './components/Store3D';
import { ASSET_TEMPLATES } from './constants';
import { useStoreState } from './hooks/useStoreState';

const IconMap: Record<string, any> = {
  Monitor,
  MonitorPlay,
  Gamepad2,
  Database,
  Box,
  DoorOpen
};

export default function App() {
  const {
    assets,
    selectedId,
    setSelectedId,
    selectedAsset,
    moveAsset,
    updateAssetPosition,
    rotateAsset,
    addAsset,
    deleteAsset
  } = useStoreState();

  const selectedTemplate = selectedAsset 
    ? ASSET_TEMPLATES.find(t => t.id === selectedAsset.templateId) 
    : null;

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white font-sans overflow-hidden">
      {/* Sidebar: Asset Library */}
      <aside className="w-80 flex flex-col border-r border-white/10 p-6 bg-[#0a0a0a]">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              FUTURE<span className="text-pink-500">SHOE</span>_
            </h1>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="System Ready" />
          </div>
          <p className="text-xs text-white/50 uppercase tracking-[0.2em]">Store Designer v1.1</p>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          <section>
            <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-bold flex items-center gap-2">
              <Plus className="w-3 h-3" /> Insert Objects
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {ASSET_TEMPLATES.map((template) => {
                const Icon = IconMap[template.icon];
                return (
                  <button
                    key={template.id}
                    onClick={() => addAsset(template.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-white/80 group-hover:scale-110 transition-transform">
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-[10px] text-white/30 uppercase">{template.width}x{template.height} Units</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {selectedAsset && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-[10px] uppercase tracking-widest text-pink-500 font-bold mb-1">
                    Selected Object
                  </h2>
                  <p className="text-sm font-bold text-white">{selectedTemplate?.name}</p>
                </div>
                <button 
                  onClick={() => deleteAsset(selectedAsset.id)}
                  className="p-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="block text-[8px] uppercase text-white/30 mb-1">POS X</span>
                  <span className="font-mono">{selectedAsset.x}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-lg">
                  <span className="block text-[8px] uppercase text-white/30 mb-1">POS Y</span>
                  <span className="font-mono">{selectedAsset.y}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => rotateAsset(selectedAsset.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Rotate 90°
                </button>
              </div>
            </motion.section>
          )}
        </div>

        <footer className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-[10px] text-blue-400/80 leading-relaxed uppercase">
              14.4m x 2.8m Area<br/>
              0.5m² Grid Resolution
            </p>
          </div>
        </footer>
      </aside>

      {/* Main Content: 3D Scene */}
      <main className="flex-1 relative p-4 flex flex-col">
        <div className="flex-1 relative">
          <Store3D 
            assets={assets} 
            selectedId={selectedId} 
            setSelectedId={setSelectedId}
            onMoveAsset={updateAssetPosition}
          />
        </div>

        {/* Floating Controls for Movement */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 rounded-3xl bg-[#141414]/90 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <ControlBtn 
                  icon={RotateCcw} 
                  onClick={() => rotateAsset(selectedAsset.id)} 
                  className="bg-pink-500 text-white w-12 h-12" 
                />
                <div className="px-2">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Selected Asset</p>
                  <p className="text-xs font-bold text-white/80">{selectedTemplate?.name}</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10 mx-1" />
              
              <div className="flex flex-col gap-2">
                <button 
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold transition-all border border-white/5 active:scale-95"
                  onClick={() => setSelectedId(null)}
                >
                  DESELECT_
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ControlBtn({ icon: Icon, onClick, className = "" }: { icon: any, onClick: () => void, className?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-90 ${className}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
