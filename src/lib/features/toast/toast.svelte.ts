export type ToastColor = "green" | "red" | "yellow" | "blue";

export interface ToastAction {
  label: string;
  icon?: string;
  variant?: "default" | "accent";
  onClick: () => void;
}

export interface ToastOptions {
  message: string;
  color: ToastColor;
  duration?: number;
  actions?: ToastAction[];
}

interface ToastItem extends Required<Omit<ToastOptions, "actions">> {
  id: number;
  actions: ToastAction[];
  exiting: boolean;
}

const EXIT_MS = 200;

let nextId = 0;

function createToastStore() {
  const toasts = $state<ToastItem[]>([]);
  const timers = new Map<number, ReturnType<typeof setTimeout>>();

  function removeFromDom(id: number) {
    clearTimeout(timers.get(id));
    timers.delete(id);
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.splice(idx, 1);
  }

  function animateOut(id: number) {
    const toast = toasts.find((t) => t.id === id);
    if (!toast) return;
    toast.exiting = true;
    setTimeout(() => removeFromDom(id), EXIT_MS);
  }

  function showToast(opts: ToastOptions): number {
    const id = nextId++;
    const duration = opts.duration ?? 3000;
    const item: ToastItem = {
      id,
      message: opts.message,
      color: opts.color,
      duration,
      actions: opts.actions ?? [],
      exiting: false,
    };
    toasts.push(item);

    if (duration > 0) {
      timers.set(
        id,
        setTimeout(() => animateOut(id), duration),
      );
    }

    return id;
  }

  function updateToast(id: number, changes: Partial<ToastOptions>) {
    const toast = toasts.find((t) => t.id === id);
    if (!toast) return;
    if (changes.message !== undefined) toast.message = changes.message;
    if (changes.color !== undefined) toast.color = changes.color;
    if (changes.actions !== undefined) toast.actions = changes.actions;
    if (changes.duration !== undefined) {
      toast.duration = changes.duration;
      toast.exiting = false;
      clearTimeout(timers.get(id));
      if (changes.duration > 0) {
        timers.set(
          id,
          setTimeout(() => animateOut(id), changes.duration!),
        );
      }
    }
  }

  function dismissToast(id: number) {
    animateOut(id);
  }

  return {
    get toasts() {
      return toasts;
    },
    showToast,
    updateToast,
    dismissToast,
  };
}

export const toastStore = createToastStore();

export function showToast(opts: ToastOptions): number {
  return toastStore.showToast(opts);
}

export function updateToast(id: number, changes: Partial<ToastOptions>) {
  toastStore.updateToast(id, changes);
}

export function dismissToast(id: number) {
  toastStore.dismissToast(id);
}
