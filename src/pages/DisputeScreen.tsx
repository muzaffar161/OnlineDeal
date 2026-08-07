import { ArrowLeft, Upload, Clock, AlertTriangle, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBadge from "@/components/StatusBadge";

const DisputeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background pb-nav">
      {/* Header */}
      <div className="gradient-danger px-5 pt-safe pb-6 rounded-b-[1.5rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <StatusBadge status="danger" label="Рассматривается" />
        </div>
        <h1 className="text-xl font-bold text-white">Спор</h1>
        <p className="text-sm text-white/60 mt-0.5">Мобильное приложение • $1,200</p>
      </div>

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-4"
      >
        <div className="bg-status-danger-muted rounded-2xl p-4 flex items-center gap-4 border border-status-danger/10">
          <div className="w-12 h-12 rounded-xl bg-status-danger/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-status-danger" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-danger">Таймер ответа</p>
            <p className="text-2xl font-bold text-status-danger font-mono mt-0.5">23:45:12</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-status-danger animate-pulse-soft" />
        </div>
      </motion.div>

      {/* Arguments */}
      <div className="px-5 space-y-3 mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          Аргументы сторон
        </h3>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card border-l-4 border-l-status-danger"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold bg-status-danger-muted text-status-danger px-2.5 py-0.5 rounded-full">Покупатель</span>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed">Работа не соответствует ТЗ. Не реализованы 3 из 5 экранов приложения. Push-уведомления не работают.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-4 shadow-card border-l-4 border-l-status-pending"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold bg-status-pending-muted text-status-pending px-2.5 py-0.5 rounded-full">Продавец</span>
          </div>
          <p className="text-sm text-card-foreground leading-relaxed">Все экраны реализованы. Push-уведомления не входили в ТЗ. Предоставляю скриншоты.</p>
        </motion.div>
      </div>

      {/* Evidence */}
      <div className="px-5 mb-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          Доказательства
        </h3>
        <div className="space-y-2">
          {[
            { name: "screenshots.zip", size: "2.4 MB", icon: "📁" },
            { name: "ТЗ_приложение.pdf", size: "540 KB", icon: "📄" },
          ].map((file) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-card"
            >
              <span className="text-xl">{file.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.size}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upload Button */}
      <div className="px-5">
        <button className="w-full flex items-center justify-center gap-2 gradient-danger text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.97] shadow-[0_4px_16px_-2px_hsl(0_72%_51%_/_0.25)]">
          <Upload className="w-5 h-5" />
          Загрузить доказательства
        </button>
      </div>
    </div>
  );
};

export default DisputeScreen;
