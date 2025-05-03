import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const reqBody = await req.json();
    const { message, history, gpuList } = reqBody;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [{ codeExecution: {} }],
    });

    const gpulist = [
      {
          "country": "india",
          "operating_system": "windows",
          "resource_class": "a100",
          "resource_name": "W.N.A100.96",
          "vcpus": 16,
          "ram": 96,
          "price_per_hour": 3.42,
          "price_per_month": 1563,
          "price_per_spot": 2.394,
          "currency": "USD",
          "is_gpu": 1,
          "is_spot": 0,
          "resource": "instances",
          "resource_type": "gpu",
          "region": "mumbai",
          "flavor_id": "773b990d-6c7e-41e7-a40d-601bbbcc6373",
          "gpu_description": "1x A100-80GB",
          "is_public": 1
      },
      {
          "country": "india",
          "operating_system": "windows",
          "resource_class": "a100",
          "resource_name": "W.N.A100.128",
          "vcpus": 16,
          "ram": 128,
          "price_per_hour": 2.148025786,
          "price_per_month": 1363.529412,
          "price_per_half_year": 7784.117647,
          "price_per_year": 14774.11765,
          "price_per_spot": 1.5037,
          "currency": "USD",
          "is_gpu": 1,
          "is_spot": 0,
          "resource": "instances",
          "resource_type": "gpu",
          "region": "mumbai",
          "flavor_id": "d27ef842-d706-45a8-9f8c-03e68dd64ccd",
          "gpu_description": "1x A100",
          "is_public": 1
      },
      {
          "country": "india",
          "operating_system": "windows",
          "resource_class": "a100",
          "resource_name": "W.N.A100.192",
          "vcpus": 32,
          "ram": 192,
          "price_per_hour": 6.85,
          "price_per_month": 3125,
          "price_per_spot": 4.795,
          "currency": "USD",
          "is_gpu": 1,
          "is_spot": 0,
          "resource": "instances",
          "resource_type": "gpu",
          "region": "mumbai",
          "gpu_description": "2x A100-80GB",
          "is_public": 1
      },
      {
          "country": "india",
          "operating_system": "windows",
          "resource_class": "a30",
          "resource_name": "W.N.A30.32",
          "vcpus": 8,
          "ram": 32,
          "price_per_hour": 0.842344883,
          "price_per_month": 534.7058824,
          "price_per_half_year": 3053.823529,
          "price_per_year": 5798.823529,
          "price_per_spot": 0.5897,
          "currency": "USD",
          "is_gpu": 1,
          "is_spot": 0,
          "resource": "instances",
          "resource_type": "gpu",
          "region": "mumbai",
          "flavor_id": "0179be42-1e87-4b23-b976-7f5cb1bd1ea8",
          "gpu_description": "1x A30",
          "is_public": 1
      },
      {
          "country": "india",
          "operating_system": "windows",
          "resource_class": "a30",
          "resource_name": "W.N.A30.64",
          "vcpus": 16,
          "ram": 64,
          "price_per_hour": 1.684689766,
          "price_per_month": 1069.411765,
          "price_per_half_year": 6107.647059,
          "price_per_year": 11597.64706,
          "price_per_spot": 1.1793,
          "currency": "USD",
          "is_gpu": 1,
          "is_spot": 0,
          "resource": "instances",
          "resource_type": "gpu",
          "region": "mumbai",
          "flavor_id": "00bfaed3-8cc1-4082-b8c4-bfc2570547cc",
          "gpu_description": "2x A30",
          "is_public": 1
      }
  ];

  const gpuSummary = gpuList.map((gpu: any) => {
    return `**${gpu.resource_name}**: ${gpu.gpu_description}, $${gpu.price_per_hour}/hr, $${gpu.price_per_month}/month, ${gpu.ram}GB RAM`;
  }).join("\n");

  const userInput = {
    "country": "india",
    "operating_system": "windows",
    "resource_class": "a100",
    "resource_name": "W.N.A100.96",
    "vcpus": 16,
    "ram": 96,
    "price_per_hour": 3.42,
    "price_per_month": 1563,
    "price_per_spot": 2.394,
    "currency": "USD",
    "is_gpu": 1,
    "is_spot": 0,
    "resource": "instances",
    "resource_type": "gpu",
    "region": "mumbai",
    "flavor_id": "773b990d-6c7e-41e7-a40d-601bbbcc6373",
    "gpu_description": "1x A100-80GB",
    "is_public": 1
}

    const systemPrompt = {
      role: "user",
      parts: [{ text: `Based on the user input (with country, operating system, GPU specifications like A100, pricing, etc.), and the list of available GPU instances ${gpuSummary}, your task is to recommend the most suitable GPU from the list based on the user's requirements; first, display the following details for each GPU instance in the list: gpu_description, resource_name, price_per_hour, price_per_month, price_per_spot, ram, then compare the GPU instances with the user's input, consider technical factors such as VRAM, CPU, RAM, region, and budget, and provide a concise recommendation, justifying your choices with relevant technical reasoning (e.g., VRAM, performance, cost), ensuring the chosen GPU fits the user's budget, and present the results in a user-friendly markdown format with the following: GPU names, reasons for suitability, and cost breakdown (hourly/monthly/spot vs on-demand), ensuring not to recommend GPUs above the user's budget or missing pricing.` }],
    };

    const chatHistory = history.map((entry: any, index: number) => ({
      role: index === 0 ? "user" : entry.type === "bot" ? "model" : "user",
      parts: [{ text: entry.message }],
    }));

    const formattedHistory = [systemPrompt, ...chatHistory];

    const chat = model.startChat({ history: formattedHistory });

    const result = await chat.sendMessage(message);

    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No valid response received";

    return new NextResponse(JSON.stringify({ message: responseText, status: 200 }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all domains (or replace with your frontend URL)
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error: any) {
    console.error("Error:", error.message || error);
    console.error("Stack:", error.stack);  // Log stack trace
    return new NextResponse(JSON.stringify({ message: "Error occurred", error: error.message, status: 400 }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  }
}

// ✅ Handle CORS Preflight Requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
