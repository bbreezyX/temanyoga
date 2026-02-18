type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);
  const json = await res.json();
  return json as ApiResponse<T>;
}

export async function apiFetch<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { cache: "no-store" });
}

export async function apiPost<T>(
  url: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(
  url: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>(url, { method: "DELETE" });
}

export async function apiUpload<T>(
  url: string,
  file: File,
  extraFields?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append("file", file);
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }
  return request<T>(url, {
    method: "POST",
    body: formData,
  });
}
