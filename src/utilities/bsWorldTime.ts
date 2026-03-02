import { SupabaseClient } from "@supabase/supabase-js"

type BattleTimeResponse = {
    ok: boolean
    iso: string
    unix_ms: number
    unix_s: number
}

export async function FetchUtcTime(client: SupabaseClient<unknown, {
    PostgrestVersion: string;
}, never, never, {
    PostgrestVersion: string;
}>): Promise<string> {
    const { data, error } = await client.functions.invoke<BattleTimeResponse>(
        "battle-time",
        { method: "GET" },
    )

    if (error) {
        console.error("Failed to fetch UTC time:", error)
        throw error
    }

    if (!data?.iso) {
        throw new Error("battle-time returned no iso field")
    }

    return data.iso
}