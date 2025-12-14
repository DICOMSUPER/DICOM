import debounce from "@/common/utils/debouce";
import guid from "@/common/utils/guid";


// Types
type Callback = (data: any) => void;
type Subscription = {
  id: string;
  callback: Callback & { clearDebounceTimeout?: () => void };
};
type Listeners = Record<string, Subscription[] | undefined>;

interface SubscriptionReturn {
  unsubscribe: () => void;
}

/**
 * Subscribe to updates.
 *
 * @param eventName - The name of the event
 * @param callback - Events callback
 * @return Observable object with unsubscribe action
 */
function subscribe(this: PubSubService, eventName: string, callback: Callback): SubscriptionReturn {
  if (this._isValidEvent(eventName)) {
    const listenerId = guid();
    const subscription: Subscription = { id: listenerId, callback };

    if (Array.isArray(this.listeners[eventName])) {
      this.listeners[eventName]!.push(subscription);
    } else {
      this.listeners[eventName] = [subscription];
    }

    return {
      unsubscribe: () => this._unsubscribe(eventName, listenerId),
    };
  } else {
    throw new Error(`Event ${eventName} not supported.`);
  }
}

/**
 * Unsubscribe from event updates.
 *
 * @param eventName - The name of the event
 * @param listenerId - The listener's id
 */
function _unsubscribe(this: PubSubService, eventName: string, listenerId: string): void {
  if (!this.listeners[eventName]) {
    return;
  }

  const listeners = this.listeners[eventName];
  if (Array.isArray(listeners)) {
    this.listeners[eventName] = listeners.filter(({ id, callback }) => {
      if (id === listenerId) {
        callback?.clearDebounceTimeout?.();
        return false;
      }
      return true;
    });
  }
}

/**
 * Check if a given event is valid.
 *
 * @param eventName - The name of the event
 * @return Event name validation
 */
function _isValidEvent(this: PubSubService, eventName: string): boolean {
  return Object.values(this.EVENTS).includes(eventName);
}

/**
 * Broadcasts changes to all subscribers.
 *
 * @param eventName - The event name
 * @param callbackProps - Properties to pass to callbacks
 */
function _broadcastEvent(this: PubSubService, eventName: string, callbackProps?: any): void {
  const hasListeners = Object.keys(this.listeners).length > 0;
  const hasCallbacks = Array.isArray(this.listeners[eventName]);

  // Dispatch DOM event
  const event = new CustomEvent(eventName, { detail: callbackProps });
  if (typeof document !== 'undefined') {
    document.body.dispatchEvent(event);
  }

  // Call subscribed callbacks
  if (hasListeners && hasCallbacks) {
    this.listeners[eventName]!.forEach(listener => {
      listener.callback(callbackProps);
    });
  }
}

/**
 * PubSub Service Class
 * Provides publish-subscribe pattern for event-driven communication
 */
export class PubSubService {
  EVENTS: Record<string, string>;
  listeners: Listeners;
  unsubscriptions: Array<() => void>;

  subscribe: (eventName: string, callback: Callback) => SubscriptionReturn;
  _broadcastEvent: (eventName: string, callbackProps?: any) => void;
  _unsubscribe: (eventName: string, listenerId: string) => void;
  _isValidEvent: (eventName: string) => boolean;

  constructor(EVENTS: Record<string, string>) {
    this.EVENTS = EVENTS;
    this.listeners = {};
    this.unsubscriptions = [];

    // Bind methods
    this.subscribe = subscribe.bind(this);
    this._broadcastEvent = _broadcastEvent.bind(this);
    this._unsubscribe = _unsubscribe.bind(this);
    this._isValidEvent = _isValidEvent.bind(this);
  }

  /**
   * Subscribe to updates with debouncing to limit callback execution frequency
   * 
   * @param eventName - The name of the event
   * @param callback - Events callback
   * @param wait - Debounce wait time in milliseconds (default: 300ms)
   * @param immediate - If true, trigger on the leading edge instead of trailing
   * @return Subscription object with unsubscribe method
   */
  subscribeDebounced(
    eventName: string,
    callback: Callback,
    wait: number = 300,
    immediate: boolean = false
  ): SubscriptionReturn {
    if (this._isValidEvent(eventName)) {
      const debouncedCallback = debounce(callback, wait, immediate);
      return this.subscribe(eventName, debouncedCallback);
    } else {
      throw new Error(`Event ${eventName} not supported.`);
    }
  }

  /**
   * Reset all subscriptions and listeners
   * Cleans up all event listeners and debounce timers
   */
  reset(): void {
    // Unsubscribe all
    this.unsubscriptions.forEach(unsub => unsub());
    this.unsubscriptions = [];

    // Clear debounce timeouts
    Object.keys(this.listeners).forEach(eventName => {
      this.listeners[eventName]?.forEach(({ callback }) => {
        callback?.clearDebounceTimeout?.();
      });
    });

    this.listeners = {};
  }

  /**
   * Creates a consumable event that can be marked as consumed
   * Useful for event chains where you want to prevent further processing
   * 
   * @param props - Properties to include in the event
   * @return Event object with consume method and isConsumed flag
   * 
   * @example
   * const event = service.createConsumableEvent({ data: 'test' });
   * if (!event.isConsumed) {
   *   event.consume();
   *   // Process event
   * }
   */
  protected createConsumableEvent<T extends Record<string, unknown>>(
    props: T
  ): T & { isConsumed: boolean; consume: () => void } {
    return {
      ...props,
      isConsumed: false,
      consume: function consume(this: { isConsumed: boolean }) {
        this.isConsumed = true;
      },
    };
  }
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use PubSubService class instead
 */
export default {
  subscribe,
  _broadcastEvent,
  _unsubscribe,
  _isValidEvent,
};