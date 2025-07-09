import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `List the main ingredients needed to make "${query}". 
      
      Rules:
      - Return only the ingredient names, one per line
      - Use common grocery store names (e.g., "milk" not "whole milk 2%")
      - Include basic ingredients like flour, sugar, eggs, etc.
      - Don't include cooking tools or equipment
      - Don't include measurements or quantities
      - Maximum 15 ingredients
      - Be specific but use common names (e.g., "chicken breast" not just "protein")
      
      Example format:
      flour
      sugar
      eggs
      butter
      milk`,
    })

    // Parse the response into an array of ingredients
    const ingredients = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 15) // Limit to 15 ingredients

    return Response.json({ ingredients })
  } catch (error) {
    console.error("Error generating ingredients:", error)
    return Response.json({ error: "Failed to generate ingredients" }, { status: 500 })
  }
}
