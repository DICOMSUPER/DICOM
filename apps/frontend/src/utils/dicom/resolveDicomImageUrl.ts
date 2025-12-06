const isAbsoluteUrl = (path: string): boolean => /^https?:\/\//i.test(path);

const joinPaths = (base: string, segment: string): string => {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedSegment = segment.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedSegment}`;
};

export const resolveDicomImageUrl = (
  filePath?: string | null,
  fileName?: string | null
): string | null => {
  if (!filePath || typeof filePath !== "string") {
    return null;
  }

  let resolvedPath = filePath;

  if (!filePath.toLowerCase().endsWith(".dcm") && fileName) {
    resolvedPath = joinPaths(filePath, fileName);
  }

  if (isAbsoluteUrl(resolvedPath)) {
    return resolvedPath;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "";

  if (!baseUrl) {
    return resolvedPath;
  }

  return joinPaths(baseUrl, resolvedPath);
};

export const buildWadoImageId = (
  filePath?: string | null,
  fileName?: string | null,
  frameIndex?: number | null
): string | null => {
  const url = resolveDicomImageUrl(filePath, fileName);

  if (!url) {
    return null;
  }

  if (typeof frameIndex === "number" && frameIndex >= 0) {
    return `wadouri:${url}?frame=${frameIndex}`;
  }

  return `wadouri:${url}`;
};

export default resolveDicomImageUrl;

