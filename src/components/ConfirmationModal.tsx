import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Info, HelpCircle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "warning",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getColorTheme = () => {
    switch (type) {
      case "danger":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
          bgIcon: "bg-rose-50 border border-rose-100",
          btnConfirm: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          bgIcon: "bg-blue-50 border border-blue-100",
          btnConfirm: "bg-blue-900 hover:bg-blue-800 text-white focus:ring-blue-800",
        };
      case "warning":
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-amber-600" />,
          bgIcon: "bg-amber-50 border border-amber-100",
          btnConfirm: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
        };
    }
  };

  const theme = getColorTheme();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Wrapper */}
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative transform overflow-hidden rounded-2xl bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-slate-100"
          >
            {/* Close button */}
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-50 p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:mx-0 sm:h-10 sm:w-10 ${theme.bgIcon}`}>
                {theme.icon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 whitespace-pre-wrap">
                    {message}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs sm:w-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btnConfirm}`}
              >
                {confirmText}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
