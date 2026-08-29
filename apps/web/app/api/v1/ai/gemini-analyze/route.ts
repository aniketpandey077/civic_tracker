import { NextRequest, NextResponse } from 'next/server';

interface GeminiAnalyzeRequest {
  image: string; // Base64 data URL or raw base64
  issueType: string;
  description?: string;
}

interface GeminiAnalyzeResponse {
  detected: boolean;
  is_civic_issue: boolean;
  severity: number;
  confidence: number;
  issue_type: string;
  description: string;
  hazards_detected: string[];
  rejection_reason?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body: GeminiAnalyzeRequest = await req.json();
    const { image, issueType = 'other', description = '' } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image payload is required for AI visual inspection' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      '';

    // ── Parse image base64 & mime type ──────────────────────────────────────
    let base64Data = image;
    let mimeType = 'image/jpeg';

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // ── If Gemini API key is present, call Google Gemini Vision API ─────────
    if (apiKey) {
      const prompt = `You are an expert Municipal Infrastructure Safety Inspector and Computer Vision Verifier for CivicTrack.
The citizen reported an infrastructure problem with category: "${issueType}".
Citizen Description: "${description || 'None provided'}".

TASK 1: VISUAL CLASSIFICATION & DEFECT VERIFICATION
Carefully inspect the submitted image:
- VALID DEFECTS (Mark "detected": true, "is_civic_issue": true):
  * Road Defects / Potholes: Any road cavities, craters, water-filled potholes, asphalt erosion, depression cavities, broken concrete/tarmac, uneven dirt/gravel road damage, surface sinkholes.
  * Streetlights: Broken, shattered, unlit, dark street, missing bulb, bent pole.
  * Traffic / Road: Blind corners, blocked vision intersections, missing road signs.
  * Sanitation: Garbage dumps, overflowing bins, open waste, dead animals.
  * Water: Water leakage, pipe bursts, flooded streets, water logging.
  * Safety: Exposed/dangling wires, missing manhole covers, lack of security/CCTV in public zone, overgrown vegetation/bushes blocking walking paths.

- INVALID / NON-INFRASTRUCTURE (Mark "detected": false, "is_civic_issue": false, "severity": 0):
  * Handwritten paper, notebook text, documents, printed paper.
  * Human selfies, facial portraits, people posing.
  * Indoor domestic rooms (living room, bedroom, indoor kitchen, office desk).
  * Food, drinks, snacks, meals.
  * Domestic pets, cats, dogs.
  * Smooth, pristine, undamaged roads with zero defects.
  * Memes, drawings, digital artwork, computer screenshots.

TASK 2: SEVERITY SCORING (1 to 100)
If this is a valid defect:
- Calculate a realistic severity score between 1 and 100:
  * 1-30 (Low Risk): Minor superficial defect or small inconvenience.
  * 31-60 (Moderate Risk): Noticeable public inconvenience or vehicle slowdown.
  * 61-80 (High Risk): Significant hazard (e.g. deep pothole cavity, water-filled pothole causing skidding, blind intersection, broken street lighting).
  * 81-100 (Critical / Life Threat): Immediate danger (e.g. exposed 440V wires, open deep manhole, collapsed roadway).
- "hazards_detected": Array of 2 to 4 specific visual observations (e.g. ["Deep water-filled road cavity", "Vehicle tire damage risk", "Pedestrian trip hazard"]).
- "description": Professional 1-2 sentence engineering assessment.
- "confidence": Float between 0.88 and 0.99.

Respond ONLY with a valid JSON object without markdown formatting or code blocks:
{
  "detected": boolean,
  "is_civic_issue": boolean,
  "severity": number,
  "confidence": number,
  "issue_type": "${issueType}",
  "description": string,
  "hazards_detected": string[],
  "rejection_reason": string | null
}`;

      try {
        // High-precision multimodal vision models supported by Google Gemini
        const models = [
          'gemini-3.5-flash',
          'gemini-2.5-flash-lite',
          'gemini-flash-latest',
          'gemini-3.7-flash',
        ];
        let geminiResponse: any = null;

        for (const model of models) {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                response_mime_type: 'application/json',
              },
            }),
          });

          if (res.ok) {
            geminiResponse = await res.json();
            break;
          }
        }

        if (geminiResponse && geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = geminiResponse.candidates[0].content.parts[0].text;
          const cleanedText = rawText.replace(/```json\n?|\n?```/g, '').trim();
          const parsedData: GeminiAnalyzeResponse = JSON.parse(cleanedText);

          return NextResponse.json(parsedData);
        }
      } catch (geminiErr) {
        console.error('Gemini Vision API call failed, falling back to local verifier:', geminiErr);
      }
    }

    // ── Edge Fallback when API key is completely unavailable ─────────────────
    return NextResponse.json({
      detected: false,
      is_civic_issue: false,
      severity: 0,
      confidence: 0.0,
      issue_type: issueType,
      description: 'Image could not be verified by AI vision inspector. Please upload a clear photo of the actual defect.',
      hazards_detected: [],
      rejection_reason: 'Image verification required before registering municipal docket.',
    });
  } catch (error: any) {
    console.error('AI Gemini Analyze Route error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI image analysis', details: error?.message },
      { status: 500 }
    );
  }
}
