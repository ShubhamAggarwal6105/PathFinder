import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

async function generateGeminiText(
  prompt: string | { text?: string; inlineData?: any }[]
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const result = await model.generateContent(
    typeof prompt === "string" ? [{ text: prompt }] : prompt
  )

  const response = await result.response
  return response.text()
}

// Optional cleanup function if Gemini still gives complex names
// function cleanIngredient(line: string) {
//   return line
//     .toLowerCase()
//     .replace(/\b(unsweetened|organic|low-fat|fat-free|fresh|natural|raw|free-range|non-gmo|extra virgin|cold-pressed)\b/g, "")
//     .replace(/\s+/g, " ")
//     .trim()
// }

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")
    let requestData: any

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData()
      const image = formData.get("image") as File
      const type = formData.get("type") as string

      if (!image || type !== "image") {
        return Response.json({ error: "Image is required" }, { status: 400 })
      }

      const bytes = await image.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      const mimeType = image.type

      const promptParts = [
        {
          text: `Analyze this image and extract all the ingredients mentioned. This could be a recipe, ingredient list, or cooking instructions.

Rules:
- Return only the ingredient names, one per line
- Use basic, grocery-store names (e.g., "milk", "cocoa powder", "chicken breast")
- Remove adjectives or descriptors like "unsweetened", "organic", "low-fat", "fresh", "raw", etc.
- Do not include cooking tools, cookware, or equipment
- Do not include cooking methods or instructions
- Do not include measurements or quantities (like "1 cup", "2 tbsp")
- Maximum 20 ingredients
- Only include food ingredients — no utensils, no steps
- Avoid brand names or marketing terms

Example format:
flour
sugar
eggs
butter
milk`,
        },
        {
          inlineData: {
            mimeType,
            data: base64,
          },
        },
      ]

      const text = await generateGeminiText(promptParts)

      const ingredients = text
        .split("\n")
        .map((line) => line.trim())
        // .map(cleanIngredient) // Uncomment to apply extra cleanup
        .filter((line) => line.length > 0 && !line.toLowerCase().includes("ingredient"))
        .slice(0, 20)

      return Response.json({ ingredients })
    } else {
      requestData = await request.json()
    }

    const { type, query, text: inputText } = requestData

    if (!type) {
      return Response.json({ error: "Type is required" }, { status: 400 })
    }

    let prompt = ""

    switch (type) {
      case "dish":
        if (!query) {
          return Response.json({ error: "Query is required for dish type" }, { status: 400 })
        }
        prompt = `List the main ingredients needed to make "${query}".`
        break

      case "text":
        if (!inputText) {
          return Response.json({ error: "Text is required for text type" }, { status: 400 })
        }
        prompt = `Extract all the ingredients from this recipe text: "${inputText}"`
        break

      default:
        return Response.json({ error: "Invalid type" }, { status: 400 })
    }

    const fullPrompt = `${prompt}

Rules:
- Return only the ingredient names, one per line
- Use basic, grocery-store names (e.g., "milk", "cocoa powder", "chicken breast")
- Remove adjectives or descriptors like "unsweetened", "organic", "low-fat", "fresh", "raw", etc.
- Do not include cooking tools, cookware, or equipment
- Do not include cooking methods or instructions
- Do not include measurements or quantities (like "1 cup", "2 tbsp")
- Maximum 20 ingredients
- Only include food ingredients — no utensils, no steps
- Avoid brand names or marketing terms

Example format:
flour
sugar
eggs
butter
milk`

    const text = await generateGeminiText(fullPrompt)

    const ingredients = text
      .split("\n")
      .map((line) => line.trim())
      // .map(cleanIngredient) // Uncomment to apply extra cleanup
      .filter((line) => line.length > 0 && !line.toLowerCase().includes("ingredient"))
      .slice(0, 20)

    return Response.json({ ingredients })
  } catch (error) {
    console.error("Error generating ingredients:", error)
    return Response.json({ error: "Failed to generate ingredients" }, { status: 500 })
  }
}
