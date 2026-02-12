/**
 * Real-time service for handling Server-Sent Events (SSE)
 * Provides live updates for webhook events and order changes
 */

export interface WebhookEvent {
  id: string;
  source: string;
  shopDomain?: string;
  topic: string;
  payloadSummary?: string;
  status: "processed" | "failed" | "pending";
  createdAt?: string;
  processedAt?: string;
  error?: string;
}

export interface OrderUpdate {
  orderId: string;
  channelOrderId: string;
  status: string;
  updateType: string;
  updatedAt?: string;
}

export interface RealtimeEvent {
  type: "webhook_event" | "order_update";
  data: WebhookEvent | OrderUpdate;
}

export type EventCallback = (event: RealtimeEvent) => void;

class RealtimeService {
  private eventSource: EventSource | null = null;
  private callbacks: Set<EventCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnected = false;

  /**
   * Connect to the SSE endpoint
   */
  connect(): void {
    if (this.eventSource && this.eventSource.readyState === EventSource.OPEN) {
      console.log("Realtime service already connected");
      return;
    }

    try {
      // Get auth token from localStorage or cookies
      const token = this.getAuthToken();
      if (!token) {
        console.warn("No auth token available for realtime connection");
        return;
      }

      const url = `/api/webhooks/events/stream`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log("Realtime service connected");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          this.notifyCallbacks(data);
        } catch (error) {
          console.error("Error parsing realtime event:", error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error("Realtime service error:", error);
        this.isConnected = false;
        this.handleReconnect();
      };
    } catch (error) {
      console.error("Error creating EventSource:", error);
    }
  }

  /**
   * Disconnect from the SSE endpoint
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(callback: EventCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Get connection status
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string | null {
    // Try to get token from localStorage first
    const token = localStorage.getItem("auth_token");
    if (token) return token;

    // Try to get from cookies (server-side auth)
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "auth_token") {
        return value;
      }
    }

    return null;
  }

  /**
   * Notify all callbacks with the event
   */
  private notifyCallbacks(event: RealtimeEvent): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in realtime callback:", error);
      }
    });
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// React hook for using the realtime service
import { useEffect, useState, useCallback } from "react";

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    // Subscribe to connection status changes
    const checkConnection = () => {
      setIsConnected(realtimeService.isConnectionActive());
    };

    const interval = setInterval(checkConnection, 1000);

    // Connect to the service
    realtimeService.connect();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const subscribe = useCallback((callback: EventCallback) => {
    return realtimeService.subscribe(callback);
  }, []);

  const subscribeToWebhookEvents = useCallback((callback: (event: WebhookEvent) => void) => {
    return realtimeService.subscribe((event: RealtimeEvent) => {
      if (event.type === "webhook_event") {
        setLastEvent(event);
        callback(event.data as WebhookEvent);
      }
    });
  }, [realtimeService]);

  const subscribeToOrderUpdates = useCallback((callback: (event: OrderUpdate) => void) => {
    return realtimeService.subscribe((event: RealtimeEvent) => {
      if (event.type === "order_update") {
        setLastEvent(event);
        callback(event.data as OrderUpdate);
      }
    });
  }, [realtimeService]);

  return {
    isConnected,
    lastEvent,
    subscribe,
    subscribeToWebhookEvents,
    subscribeToOrderUpdates,
    connect: () => realtimeService.connect(),
    disconnect: () => realtimeService.disconnect(),
  };
}
