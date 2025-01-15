interface WorldTimeApiResponse
{
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    seconds: number;
    milliSeconds: number;
    dateTime: string; // ISO 8601 format datetime string
    date: string; // MM/DD/YYYY format
    time: string; // HH:mm format
    timeZone: string; // e.g., "UTC"
    dayOfWeek: string; // Full day name, e.g., "Wednesday"
    dstActive: boolean; // Daylight Saving Time active status
}