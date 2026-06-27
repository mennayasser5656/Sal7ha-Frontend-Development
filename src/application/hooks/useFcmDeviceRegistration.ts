"use client";

import { useCallback, useEffect, useState } from "react";
import type { MessagePayload } from "firebase/messaging";
import {
  getWebPushRegistrationState,
  registerWebPushDevice,
  subscribeToForegroundMessages,
  type WebPushRegistrationState,
} from "@/infrastructure/services/firebase-messaging.service";

interface UseFcmDeviceRegistrationOptions {
  autoRegister?: boolean;
  listenForForegroundMessages?: boolean;
  onForegroundMessage?: (payload: MessagePayload) => void;
}

export function useFcmDeviceRegistration({
  autoRegister = false,
  listenForForegroundMessages = false,
  onForegroundMessage,
}: UseFcmDeviceRegistrationOptions = {}) {
  const [state, setState] = useState<WebPushRegistrationState>({
    status: "checking",
  });

  const refreshState = useCallback(() => {
    setState(getWebPushRegistrationState());
  }, []);

  const register = useCallback(async (requestPermission = true) => {
    setState({ status: "registering" });
    const result = await registerWebPushDevice({ requestPermission });
    setState(result);
    return result;
  }, []);

  useEffect(() => {
    refreshState();

    if (autoRegister) {
      void register(false);
    }
  }, [autoRegister, refreshState, register]);

  useEffect(() => {
    if (!listenForForegroundMessages) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let active = true;

    void subscribeToForegroundMessages((payload) => {
      onForegroundMessage?.(payload);
    }).then((nextUnsubscribe) => {
      if (active) {
        unsubscribe = nextUnsubscribe;
      } else {
        nextUnsubscribe();
      }
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [listenForForegroundMessages, onForegroundMessage]);

  return {
    state,
    register,
    refreshState,
  };
}
