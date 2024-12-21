export async function FetchUtcTime(): Promise<string>
{
    const url = "https://worldtimeapi.org/api/timezone/Etc/UTC";

    try
    {
        const response = await fetch(url);
        if (!response.ok)
        {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse JSON response
        const data: WorldTimeApiResponse = await response.json();

        // Extract and return the UTC datetime
        return data.utc_datetime;
    } catch (error)
    {
        console.error("Failed to fetch UTC time:", error);
        throw error; // Optionally rethrow for further handling
    }
}