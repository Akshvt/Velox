import { apiClient } from "../client";

const get = (url, config) => apiClient.get(url, config).then((r) => r.data);
const post = (url, body, config) => apiClient.post(url, body, config).then((r) => r.data);
const put = (url, body, config) => apiClient.put(url, body, config).then((r) => r.data);
const patch = (url, body, config) => apiClient.patch(url, body, config).then((r) => r.data);
const del = (url, config) => apiClient.delete(url, config).then((r) => r.data);

export const http = { get, post, put, patch, del };
