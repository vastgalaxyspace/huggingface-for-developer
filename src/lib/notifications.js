const TOAST_EVENT = 'innoai:toast';

export const notify = (message, type = 'info') => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type,
      },
    })
  );
};

export const notificationEventName = TOAST_EVENT;
