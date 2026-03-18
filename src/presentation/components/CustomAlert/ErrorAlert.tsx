// ../../core/Alert/ErrorAlert.tsx
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import './ErrorAlert.css'

type ErrorAlertProps = {
  message: string;
  className?: string;
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div role="alert" className="alert">
      <FaExclamationTriangle className="alert-icon" aria-hidden="true" />
      <span className="alert-text">{message}</span>
    </div>
  );
};

export default ErrorAlert;
