import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Info,
  BatteryCharging,
  X
} from "lucide-react";
import { AppNotification } from "../types";

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none font-mono">
      {notifications.map((notif) => {
        const renderIcon = () => {
          switch (notif.type) {
            case "security":
              return <ShieldAlert className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />;
            case "success":
              return <CheckCircle2 className="w-4 h-4 text-[#121212] shrink-0 stroke-[2.5]" />;
            case "battery":
              return <BatteryCharging className="w-4 h-4 text-[#121212] shrink-0 stroke-[2.5]" />;
            default:
              return <Info className="w-4 h-4 text-[#121212] shrink-0 stroke-[2.5]" />;
          }
        };

        const renderBg = () => {
          switch (notif.type) {
            case "security":
              return "bg-[#FF5A36] text-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212]";
            case "success":
              return "bg-[#54F28D] text-[#121212] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212]";
            case "battery":
              return "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212]";
            default:
              return "bg-[#FFFFFF] text-[#121212] border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212]";
          }
        };

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3 flex items-start justify-between gap-3 text-xs transition-all ${renderBg()}`}
          >
            <div className="flex items-start gap-2 min-w-0">
              <div className="mt-0.5">{renderIcon()}</div>
              <div className="min-w-0">
                <div className="font-black uppercase text-xs">{notif.title}</div>
                <div className="text-[11px] font-bold mt-0.5 leading-tight">{notif.message}</div>
              </div>
            </div>
            <button
              onClick={() => onDismiss(notif.id)}
              className="p-0.5 hover:bg-[#121212] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
