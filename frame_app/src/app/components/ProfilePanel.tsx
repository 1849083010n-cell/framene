import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Smartphone, Wifi, Clock, X } from 'lucide-react';
import { webAccountsApi } from '@/services/frameNe/webAccounts';
import type { DeviceAccount } from '@/services/frameNe/webAccounts';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const [accounts, setAccounts] = useState<DeviceAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      webAccountsApi.list().then(r => setAccounts(r.items)).catch(() => setAccounts([]));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20"
          />

          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-20 right-8 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* 标题 */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="text-sm font-medium">已绑定设备</span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* 设备信息 */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <h4 className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  设备信息
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <Wifi className="w-3.5 h-3.5 text-green-500" />
                  <span>网络状态：<span className="text-green-600">已连接</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>FrameNe Web v1.0</span>
                </div>
              </div>

              {/* 绑定账号列表 */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <h4 className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  关联账号 ({accounts.length})
                </h4>
                {accounts.length > 0 ? (
                  <div className="space-y-1.5">
                    {accounts.map((acc) => (
                      <div key={acc.id} className="flex items-center gap-2 p-2 bg-white rounded-lg">
                        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {acc.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{acc.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{acc.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground text-center py-2">
                    暂无关联账号
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
