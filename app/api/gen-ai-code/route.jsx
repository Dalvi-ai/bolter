import { GenAiCode } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export const maxDuration = 300;
export async function POST(req) {
    const { prompt } = await req.json();
    try {
        const result = await GenAiCode([
            {
                role: "user",
                content: prompt
            }
        ]);
        
        const response = result.content[0].text;
        return NextResponse.json(JSON.parse(response));
    } catch (e) {
        return NextResponse.json({ error: e.message });
    }
}