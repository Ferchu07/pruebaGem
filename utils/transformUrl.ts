/**
 * Convert a record of filters to a query string
 */
export const convertToQueryString = (filtros: Record<string, any>) => {
  const queryString = Object.entries(filtros)
    .map(([key, value]) => {
      if (value === "" || value === null) {
        return null;
      }

      if (value === undefined && key === "limit") {
        return `${key}=50`;
      }

      if (typeof value === "object") {
        const filteredValue = JSON.stringify(value, (subKey, subValue) => {
          if (
            (subValue !== "" &&
              subValue !== null &&
              subValue !== undefined &&
              !Array.isArray(subValue)) ||
            (Array.isArray(subValue) && subValue.length > 0)
          ) {
            return (subKey = subValue);
          }
          if (Array.isArray(value)) {
            return subValue;
          }
        });

        return `${key}=${encodeURIComponent(filteredValue)}`;
      }

      return `${key}=${encodeURIComponent(value)}`;
    })
    .filter((param) => param !== null)
    .join("&");

  return queryString;
};

/**
 * Decode a query string to a record of filters
 */
export const decodeQueryString = (queryString: string): Record<string, any> | null => {
  const params = new URLSearchParams(queryString);
  const decodedFilters: Record<string, any> = {};

  if (params === null) {
    return null;
  }

  params.forEach((value, key) => {
    try {
      decodedFilters[key] = JSON.parse(decodeURIComponent(value));
    } catch (error) {
      decodedFilters[key] = decodeURIComponent(value);
    }
  });

  return decodedFilters;
};