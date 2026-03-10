import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-3 text-xl font-bold tracking-tight animate-[fadeIn_0.6s_ease-out]">
            <div>
              Zor IK <span className="opacity-60 font-light text-lg">ID</span>
            </div>
          </div>

          <div className="space-y-4 max-w-xl animate-[fadeIn_0.8s_ease-out_0.2s] fill-mode-[forwards]">
            <blockquote className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
                İnsan kaynakları yönetimi, bir şirketin kalbidir.
              </h2>
              <h2 className="text-xl text-white/60 font-light leading-relaxed">
                Çalışan deneyimini ve operasyonel verimliliği Zor IK ile en üst
                düzeye çıkarın.
              </h2>
              <footer className="text-sm text-white/60 uppercase tracking-widest pt-4 flex items-center gap-2">
                — Zor IK Yönetim Paneli
              </footer>
            </blockquote>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-blue-500">500+</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">
                  Aktif Şirket
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-indigo-500">10K+</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">
                  Çalışan
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-emerald-500">50K+</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">
                  İzin Talebi
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 animate-[fadeIn_1s_ease-out_0.4s] fill-mode-[forwards]">
            <span>•</span>
            <span>HUMAN RESOURCES MANAGEMENT SYSTEM</span>
          </div>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
