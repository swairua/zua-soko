import React from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

// Base Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg ${sizeClasses[size]} w-full mx-4 shadow-xl max-h-screen overflow-y-auto`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Alert Modal Component (replaces browser alerts)
export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
}: AlertModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-100";
      case "warning":
        return "bg-yellow-100";
      case "error":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={`w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {getIcon()}
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`${showCancel ? 'flex-1' : 'w-full'} ${getConfirmButtonColor()} text-white py-2 px-4 rounded-lg transition-colors font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Confirmation Modal Component (replaces window.confirm)
export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}: Omit<AlertModalProps, "showCancel">) {
  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      type={type}
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      showCancel={true}
    />
  );
}

// Custom hook for using modals
export function useModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  return { isOpen, openModal, closeModal };
}

// Custom hook for alert modals
export function useAlertModal() {
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    onConfirm?: () => void
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      showCancel: false,
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "info" | "success" | "warning" | "error" = "warning"
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      showCancel: true,
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    ...modalState,
    showAlert,
    showConfirm,
    closeModal,
  };
}

export default Modal;
