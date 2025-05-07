"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ErrorAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  isOpen,
  onClose,
  title = "Đã xảy ra lỗi",
  message,
  buttonText = "Đóng",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="destructive" onClick={onClose}>
            {buttonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook để gọi ErrorAlert động
interface ErrorAlertPayload {
  title?: string;
  message: string;
  buttonText?: string;
}

export function useErrorAlert() {
  const [error, setError] = React.useState<ErrorAlertPayload | null>(null);

  const showError = ({ title, message, buttonText }: ErrorAlertPayload) => {
    setError({ title, message, buttonText });
  };

  const closeError = () => {
    setError(null);
  };

  const ErrorAlertComponent = () =>
    error ? (
      <ErrorAlert
        isOpen={!!error}
        onClose={closeError}
        title={error.title}
        message={error.message}
        buttonText={error.buttonText}
      />
    ) : null;

  return { showError, ErrorAlertComponent };
}
