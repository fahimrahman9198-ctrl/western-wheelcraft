import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Kept in sync with the client forms and lib/quote-persistence.ts.
const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;

/**
 * Issues short-lived tokens so the browser can upload quote photos straight to
 * Vercel Blob. This is the reason photos no longer flow through /api/quotes:
 * serverless functions cap the request body at 4.5 MB, and a couple of phone
 * photos blow past that (Vercel rejects them with a 413 before the function
 * even runs). Client uploads bypass that limit entirely.
 *
 * The token is deliberately narrow — image types only, 8 MB ceiling, private
 * access — so an anonymous caller can do nothing but drop a small image into
 * the store, which /api/quotes then links to a lead on submit.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_PHOTO_TYPES,
        maximumSizeInBytes: MAX_PHOTO_SIZE_BYTES,
        addRandomSuffix: true,
      }),
      // No onUploadCompleted: the photo is tied to a quote when the form is
      // submitted to /api/quotes, not here.
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
