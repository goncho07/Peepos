declare module 'react-hot-toast' {
  import { ReactNode } from 'react';

  export interface ToastOptions {
    id?: string;
    icon?: ReactNode;
    duration?: number;
    ariaProps?: {
      role: 'status' | 'alert';
      'aria-live': 'assertive' | 'off' | 'polite';
    };
    className?: string;
    style?: React.CSSProperties;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    iconTheme?: {
      primary: string;
      secondary: string;
    };
  }

  export interface Toast {
    type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    id: string;
    message: string | ReactNode;
    icon?: ReactNode;
    duration?: number;
    pauseDuration: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    ariaProps: {
      role: 'status' | 'alert';
      'aria-live': 'assertive' | 'off' | 'polite';
    };
    style?: React.CSSProperties;
    className?: string;
    iconTheme?: {
      primary: string;
      secondary: string;
    };
    createdAt: number;
    visible: boolean;
    height?: number;
  }

  export interface ToasterProps {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }

  export const toast: {
    (message: string | ReactNode, options?: ToastOptions): string;
    success: (message: string | ReactNode, options?: ToastOptions) => string;
    error: (message: string | ReactNode, options?: ToastOptions) => string;
    loading: (message: string | ReactNode, options?: ToastOptions) => string;
    custom: (jsx: ReactNode, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId?: string) => void;
    promise: <T>(
      promise: Promise<T>,
      msgs: {
        loading: string | ReactNode;
        success: string | ReactNode | ((data: T) => string | ReactNode);
        error: string | ReactNode | ((error: any) => string | ReactNode);
      },
      options?: ToastOptions
    ) => Promise<T>;
  };

  export const Toaster: React.FC<ToasterProps>;
  export default toast;
}