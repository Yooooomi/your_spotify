import Axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  CreateAxiosDefaults,
} from "axios";

export type RequestPriority = "normal" | "high";

export interface QueuedAxiosRequestConfig<D = any>
  extends AxiosRequestConfig<D> {
  priority?: RequestPriority;
  retry429MaxAttempts?: number;
}

interface QueueItem<T = any, D = any> {
  config: QueuedAxiosRequestConfig<D>;
  resolve: (value: AxiosResponse<T>) => void;
  reject: (reason?: unknown) => void;
  retry429AttemptCount: number;
}

interface QueueState {
  highPriorityQueue: QueueItem<any, any>[];
  normalPriorityQueue: QueueItem<any, any>[];
  isProcessingQueue: boolean;
}

const DEFAULT_RETRY_429_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_AFTER_MS = 1000;

function createQueueState(): QueueState {
  return {
    highPriorityQueue: [],
    normalPriorityQueue: [],
    isProcessingQueue: false,
  };
}

export class QueuedHttpClientFactory {
  constructor(
    private readonly defaultConfig: CreateAxiosDefaults = {},
    private readonly queueState: QueueState = createQueueState(),
  ) {}

  createClient(config: CreateAxiosDefaults = {}) {
    return new QueuedHttpClient(this.mergeConfig(config), this.queueState);
  }

  private mergeConfig(config: CreateAxiosDefaults): CreateAxiosDefaults {
    return {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...(this.defaultConfig.headers ?? {}),
        ...(config.headers ?? {}),
      },
    };
  }
}

export class QueuedHttpClient {
  private readonly axios;

  constructor(
    config: CreateAxiosDefaults = {},
    private readonly queueState: QueueState = createQueueState(),
  ) {
    this.axios = Axios.create(config);
  }

  static normalPriority(
    config: QueuedAxiosRequestConfig = {},
  ): QueuedAxiosRequestConfig {
    return { ...config, priority: "normal" };
  }

  static highPriority(
    config: QueuedAxiosRequestConfig = {},
  ): QueuedAxiosRequestConfig {
    return { ...config, priority: "high" };
  }

  request<T = any, D = any>(
    config: QueuedAxiosRequestConfig<D>,
  ): Promise<AxiosResponse<T>> {
    return new Promise<AxiosResponse<T>>((resolve, reject) => {
      const queueItem: QueueItem<T, D> = {
        config,
        resolve,
        reject,
        retry429AttemptCount: 0,
      };

      this.enqueue(queueItem);

      this.processQueue();
    });
  }

  get<T = any, D = any>(url: string, config?: QueuedAxiosRequestConfig<D>) {
    return this.request<T, D>({ ...config, method: "get", url });
  }

  delete<T = any, D = any>(url: string, config?: QueuedAxiosRequestConfig<D>) {
    return this.request<T, D>({ ...config, method: "delete", url });
  }

  head<T = any, D = any>(url: string, config?: QueuedAxiosRequestConfig<D>) {
    return this.request<T, D>({ ...config, method: "head", url });
  }

  options<T = any, D = any>(url: string, config?: QueuedAxiosRequestConfig<D>) {
    return this.request<T, D>({ ...config, method: "options", url });
  }

  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: QueuedAxiosRequestConfig<D>,
  ) {
    return this.request<T, D>({ ...config, method: "post", url, data });
  }

  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: QueuedAxiosRequestConfig<D>,
  ) {
    return this.request<T, D>({ ...config, method: "put", url, data });
  }

  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: QueuedAxiosRequestConfig<D>,
  ) {
    return this.request<T, D>({ ...config, method: "patch", url, data });
  }

  private processQueue() {
    if (this.queueState.isProcessingQueue) {
      return;
    }

    const next = this.dequeueNext();
    if (!next) {
      return;
    }

    this.queueState.isProcessingQueue = true;

    this.execute(next)
      .catch((error) => {
        next.reject(error);
      })
      .finally(() => {
        this.queueState.isProcessingQueue = false;
        this.processQueue();
      });
  }

  private async execute<T = any, D = any>(queueItem: QueueItem<T, D>) {
    try {
      const response = await this.axios.request<T, AxiosResponse<T>, D>(
        queueItem.config,
      );
      queueItem.resolve(response);
    } catch (error) {
      if (!this.shouldRetry429(error)) {
        throw error;
      }

      const maxAttempts =
        queueItem.config.retry429MaxAttempts ?? DEFAULT_RETRY_429_MAX_ATTEMPTS;
      if (queueItem.retry429AttemptCount >= maxAttempts) {
        throw error;
      }

      queueItem.retry429AttemptCount += 1;
      this.requeue(queueItem);

      const retryAfterMs = this.parseRetryAfterHeader(error as AxiosError);
      await this.sleep(retryAfterMs);
    }
  }

  private requeue(queueItem: QueueItem<any, any>) {
    if (queueItem.config.priority === "high") {
      this.queueState.highPriorityQueue.unshift(queueItem);
      return;
    }
    this.queueState.normalPriorityQueue.unshift(queueItem);
  }

  private enqueue(queueItem: QueueItem<any, any>) {
    if (queueItem.config.priority === "high") {
      this.queueState.highPriorityQueue.push(queueItem);
      return;
    }

    this.queueState.normalPriorityQueue.push(queueItem);
  }

  private dequeueNext() {
    return (
      this.queueState.highPriorityQueue.shift() ??
      this.queueState.normalPriorityQueue.shift()
    );
  }

  private shouldRetry429(error: unknown) {
    if (!(error instanceof AxiosError)) {
      return false;
    }

    return error.response?.status === 429;
  }

  private parseRetryAfterHeader(error: AxiosError) {
    const retryAfter = error.response?.headers?.["retry-after"];
    if (!retryAfter) {
      return DEFAULT_RETRY_AFTER_MS;
    }

    const retryAfterValue = Array.isArray(retryAfter)
      ? retryAfter[0]
      : retryAfter;

    const retryAfterAsNumber = Number(retryAfterValue);
    if (!Number.isNaN(retryAfterAsNumber)) {
      return Math.max(0, retryAfterAsNumber * 1000);
    }

    const retryAtTimestamp = Date.parse(retryAfterValue);
    if (Number.isNaN(retryAtTimestamp)) {
      return DEFAULT_RETRY_AFTER_MS;
    }

    return Math.max(0, retryAtTimestamp - Date.now());
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
