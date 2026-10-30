// Adapter: uploads to Supabase Storage using service-role client.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IStorageAdapter } from "@/domain/ports";

const BUCKET = "ambientes";

export class SupabaseStorageAdapter implements IStorageAdapter {
  constructor(private readonly client: SupabaseClient) {}

  async uploadImagem(userId: string, buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeType.split("/")[1]?.split("+")[0] || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await this.client.storage.from(BUCKET).upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    if (error) throw new Error(`Upload falhou: ${error.message}`);
    return path;
  }

  async signedUrl(path: string, expiresIn = 60 * 60 * 24 * 7): Promise<string> {
    const { data, error } = await this.client.storage.from(BUCKET).createSignedUrl(path, expiresIn);
    if (error || !data) throw new Error(`Signed URL falhou: ${error?.message ?? "unknown"}`);
    return data.signedUrl;
  }
}
