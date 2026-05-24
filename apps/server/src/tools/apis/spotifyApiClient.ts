import Axios, {
	AxiosError,
	AxiosHeaders,
	AxiosInstance,
	CreateAxiosDefaults,
	InternalAxiosRequestConfig,
} from "axios";
import { wait } from "../misc";
import { logger } from "../logger";

type RetryAfterRequestConfig = InternalAxiosRequestConfig & {
	_retryAfterHandled?: boolean;
};

export class RetryAfterAwareAxiosClient {
	private static sharedRetryAfterUntil = 0;

	readonly instance: AxiosInstance;

	constructor(config: CreateAxiosDefaults = {}) {
		this.instance = Axios.create(config);
		this.attachInterceptors();
	}

	private static parseRetryAfter(headerValue: string | null) {
		if (!headerValue) {
			return undefined;
		}

		const seconds = Number(headerValue);
		if (Number.isFinite(seconds)) {
			return Math.max(0, seconds * 1000);
		}

		const retryAt = Date.parse(headerValue);
		if (Number.isNaN(retryAt)) {
			return undefined;
		}

		return Math.max(0, retryAt - Date.now());
	}

	private static getRetryAfterDelay(
		headers: AxiosHeaders | Record<string, unknown> | undefined,
	) {
		if (!headers) {
			return undefined;
		}

		const retryAfterHeader =
			headers instanceof AxiosHeaders
				? headers.get("retry-after")
				: headers["retry-after"];

		if (Array.isArray(retryAfterHeader)) {
			return RetryAfterAwareAxiosClient.parseRetryAfter(
				retryAfterHeader[0] ?? null,
			);
		}

		return RetryAfterAwareAxiosClient.parseRetryAfter(
			typeof retryAfterHeader === "string" ? retryAfterHeader : null,
		);
	}

	private static registerRetryAfter(delay: number | undefined) {
		if (!delay || delay <= 0) {
			return undefined;
		}

		const retryAfterUntil = Date.now() + delay + 1000;
		RetryAfterAwareAxiosClient.sharedRetryAfterUntil = Math.max(
			RetryAfterAwareAxiosClient.sharedRetryAfterUntil,
			retryAfterUntil,
		);
		return delay;
	}

	private static async waitForSharedRetryAfter() {
		const delay =
			RetryAfterAwareAxiosClient.sharedRetryAfterUntil - Date.now();
		if (delay > 0) {
     logger.debug(`Delaying request for ${delay}ms due to Retry-After`);
			await wait(delay);
		}
	}

	private attachInterceptors() {
		this.instance.interceptors.request.use(async (config) => {
			await RetryAfterAwareAxiosClient.waitForSharedRetryAfter();
			return config;
		});

		this.instance.interceptors.response.use(
			(response) => {
				RetryAfterAwareAxiosClient.registerRetryAfter(
					RetryAfterAwareAxiosClient.getRetryAfterDelay(response.headers),
				);
				return response;
			},
			async (error: AxiosError) => {
				const retryAfterDelay = RetryAfterAwareAxiosClient.registerRetryAfter(
					RetryAfterAwareAxiosClient.getRetryAfterDelay(
						error.response?.headers,
					),
				);
				const config = error.config as RetryAfterRequestConfig | undefined;

				if (
					error.response?.status === 429 &&
					retryAfterDelay &&
					config &&
					!config._retryAfterHandled
				) {
					config._retryAfterHandled = true;
					await RetryAfterAwareAxiosClient.waitForSharedRetryAfter();
					return this.instance.request(config);
				}

				throw error;
			},
		);
	}
}

