export type RequestPriority = "normal" | "high";

interface HttpClientRequestConfig {
  method: string;
  url: string;
  data?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  priority?: RequestPriority;
  retry429MaxAttempts?: number;
  /**
   * Fail with a RateLimitedError instead of waiting when the server asks to
   * wait longer than this (Retry-After). Use it for requests a user is
   * actively waiting on, so they get an error instead of a hanging request.
   */
  maxRetryAfterMs?: number;
}

interface HttpClientResponse<T> {
  status: number;
  statusText: string;
  data: T;
}

interface QueueItem<T = any> {
  config: HttpClientRequestConfig;
  resolve: (value: HttpClientResponse<T>) => void;
  reject: (reason?: unknown) => void;
  retry429AttemptCount: number;
}

interface QueueState {
  highPriorityQueue: QueueItem<any>[];
  normalPriorityQueue: QueueItem<any>[];
  isProcessingQueue: boolean;
  rateLimitedUntil: number;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: string;

  constructor(options: { status: number; statusText: string; body: string }) {
    super(
      `HTTP error! status: ${options.status}, statusText: ${options.statusText}, body: ${options.body}`,
    );
    this.status = options.status;
    this.statusText = options.statusText;
    this.body = options.body;
  }
}

export class RateLimitedError extends HttpError {
  public readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super({
      status: 429,
      statusText: "Too Many Requests",
      body: `Rate limited, retry after ${Math.ceil(retryAfterMs / 1000)}s`,
    });
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Longest Retry-After a user-facing request is allowed to wait for before
 * failing with a RateLimitedError.
 */
export const USER_FACING_MAX_RETRY_AFTER_MS = 10_000;

const DEFAULT_RETRY_429_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_AFTER_MS = 1000;

function getRateLimitRemainingMs(queueState: QueueState) {
  return Math.max(0, queueState.rateLimitedUntil - Date.now());
}

function exceedsMaxRetryAfter(
  config: HttpClientRequestConfig,
  delayMs: number,
) {
  return (
    config.maxRetryAfterMs !== undefined && delayMs > config.maxRetryAfterMs
  );
}

function createQueueState(): QueueState {
  return {
    highPriorityQueue: [],
    normalPriorityQueue: [],
    isProcessingQueue: false,
    rateLimitedUntil: 0,
  };
}

export class QueuedHttpClientFactory {
  private readonly queueState: QueueState = createQueueState();

  constructor(
    private readonly options: {
      baseURL: string;
      headers: Record<string, string>;
    },
  ) {}

  getRateLimitRemainingMs() {
    return getRateLimitRemainingMs(this.queueState);
  }

  createClient(headers: Record<string, string>) {
    const mergedHeaders = { ...this.options.headers, ...headers };
    return new QueuedHttpClient(
      this.options.baseURL,
      mergedHeaders,
      this.queueState,
    );
  }
}

export class QueuedHttpClient {
  constructor(
    private readonly baseURL: string,
    private readonly headers: Record<string, string>,
    private readonly queueState: QueueState = createQueueState(),
  ) {}

  request<T = any>(
    config: HttpClientRequestConfig,
  ): Promise<HttpClientResponse<T>> {
    return new Promise<HttpClientResponse<T>>((resolve, reject) => {
      const remainingMs = getRateLimitRemainingMs(this.queueState);
      if (exceedsMaxRetryAfter(config, remainingMs)) {
        reject(new RateLimitedError(remainingMs));
        return;
      }

      const queueItem: QueueItem<T> = {
        config: {
          ...config,
          headers: { ...this.headers, ...config.headers },
          url: config.url.startsWith("http")
            ? config.url
            : this.baseURL + config.url,
        },
        resolve,
        reject,
        retry429AttemptCount: 0,
      };

      this.enqueue(queueItem);

      this.processQueue();
    });
  }

  get<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "get", url });
  }

  delete<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "delete", url });
  }

  head<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "head", url });
  }

  options<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "options", url });
  }

  post<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "post", url });
  }

  put<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "put", url });
  }

  patch<T = any>(url: string, config?: Partial<HttpClientRequestConfig>) {
    return this.request<T>({ ...config, method: "patch", url });
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

  private async execute<T = any>(queueItem: QueueItem<T>) {
    const url = new URL(queueItem.config.url);

    if (queueItem.config.params) {
      Object.entries(queueItem.config.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const payload: RequestInit = {
      method: queueItem.config.method,
      headers: queueItem.config.headers,
      body: queueItem.config.data
        ? JSON.stringify(queueItem.config.data)
        : undefined,
      credentials: "include",
    };

    const response = await fetch(url, payload);

    if (!response.ok) {
      const text = await response.text();

      if (response.status !== 429) {
        throw new HttpError({
          status: response.status,
          statusText: response.statusText,
          body: text,
        });
      }

      const maxAttempts =
        queueItem.config.retry429MaxAttempts ?? DEFAULT_RETRY_429_MAX_ATTEMPTS;

      const retryAfterMs = this.parseRetryAfterHeader(response);
      this.registerRateLimit(retryAfterMs);

      if (exceedsMaxRetryAfter(queueItem.config, retryAfterMs)) {
        throw new RateLimitedError(retryAfterMs);
      }

      if (queueItem.retry429AttemptCount >= maxAttempts) {
        throw new HttpError({
          status: response.status,
          statusText: response.statusText,
          body: text,
        });
      }

      queueItem.retry429AttemptCount += 1;
      this.requeue(queueItem);

      await this.sleep(retryAfterMs);
      return;
    }

    const data = await response.json();
    queueItem.resolve({
      data,
      status: response.status,
      statusText: response.statusText,
    });
  }

  private registerRateLimit(retryAfterMs: number) {
    this.queueState.rateLimitedUntil = Math.max(
      this.queueState.rateLimitedUntil,
      Date.now() + retryAfterMs,
    );

    // Requests that must not wait that long are failed right away instead of
    // sitting in the queue until the rate limit is over.
    const rejectIfTooLong = (queue: QueueItem<any>[]) =>
      queue.filter((item) => {
        if (!exceedsMaxRetryAfter(item.config, retryAfterMs)) {
          return true;
        }
        item.reject(new RateLimitedError(retryAfterMs));
        return false;
      });

    this.queueState.highPriorityQueue = rejectIfTooLong(
      this.queueState.highPriorityQueue,
    );
    this.queueState.normalPriorityQueue = rejectIfTooLong(
      this.queueState.normalPriorityQueue,
    );
  }

  private requeue(queueItem: QueueItem<any>) {
    if (queueItem.config.priority === "high") {
      this.queueState.highPriorityQueue.unshift(queueItem);
      return;
    }
    this.queueState.normalPriorityQueue.unshift(queueItem);
  }

  private enqueue(queueItem: QueueItem<any>) {
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

  private parseRetryAfterHeader(response: Response) {
    const retryAfter = response.headers.get("retry-after");
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
