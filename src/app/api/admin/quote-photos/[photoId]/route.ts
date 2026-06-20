import { get } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { getCurrentAdminUser } from '@/lib/admin-auth';
import { db, schema } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { photoId } = await params;
  const photo = await db.query.quotePhotos.findFirst({
    where: eq(schema.quotePhotos.id, photoId),
  });

  if (!photo) {
    return Response.json({ error: 'Photo not found.' }, { status: 404 });
  }

  try {
    const result = await get(photo.storageUrl, {
      access: 'private',
      useCache: true,
    });

    if (!result) {
      return Response.json({ error: 'Photo not found.' }, { status: 404 });
    }

    if (result.statusCode === 304) {
      return new Response(null, { status: 304 });
    }

    const fileName = encodeURIComponent(photo.fileName ?? 'quote-photo');

    return new Response(result.stream, {
      status: 200,
      headers: {
        'Content-Type': result.blob.contentType,
        'Content-Length': String(result.blob.size),
        'Content-Disposition': `inline; filename*=UTF-8''${fileName}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Private quote photo delivery failed', error);
    return Response.json({ error: 'Unable to load photo.' }, { status: 502 });
  }
}
