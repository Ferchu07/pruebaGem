// @/src/pages/vehicle/profile/views/metrics/utils.ts

/**
 * @function formatTimestamp
 * @description Formats a UNIX timestamp into a human-readable date and time string.
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} The formatted date string.
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};