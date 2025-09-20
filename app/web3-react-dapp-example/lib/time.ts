export function timeAgo(iso: string | number | Date): string {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    const mins = Math.floor(diff / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (mins > 0) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    return 'just now';
  } catch {
    return '';
  }
}
