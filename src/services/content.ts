export async function fetchJson<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(path, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
}
