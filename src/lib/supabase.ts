import type { Bucket } from "@/server/bucket";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type UploadFileToSignedUrlParams = {
  file: File;
  path: string;
  token: string;
  bucket: Bucket;
};

export const uploadFileToSignedUrl = async ({
  file,
  path,
  token,
  bucket,
}: UploadFileToSignedUrlParams) => {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file);

    if (error) throw error;
    if (!data) {
      throw new Error("No data returned from upload");
    }

    const fileUrl = supabaseClient.storage.from(bucket).getPublicUrl(data.path);

    return fileUrl.data.publicUrl;
  } catch (error) {
    console.error("Error uploading file to signed URL:", error);
    throw new Error("Failed to upload file");
  }
};
