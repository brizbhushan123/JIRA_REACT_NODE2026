import { AsyncLocalStorage } from "async_hooks";

export interface RequestContextType {
  role?: string;
  clientId?: string;
  userId?: string;
  apiKey?: string;
  sessionId?: number | string;
  instanceId?: number | string;
  templateId?: number | string;
  candidateId?: number | string;
  language?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextType>();

class RequestContext {
  run(data: RequestContextType, callback: () => void): void {
    asyncLocalStorage.run(data, callback);
  }

  getStore(): RequestContextType {
    return asyncLocalStorage.getStore() || {};
  }

  set<K extends keyof RequestContextType>(
    key: K,
    value: RequestContextType[K]
  ): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  get<K extends keyof RequestContextType>(
    key: K
  ): RequestContextType[K] | undefined {
    return asyncLocalStorage.getStore()?.[key];
  }

  getAll(): RequestContextType | undefined {
    return asyncLocalStorage.getStore();
  }

  clear(): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      Object.keys(store).forEach((key) => {
        delete store[key as keyof RequestContextType];
      });
    }
  }
}

export const context = new RequestContext();