import { TRPCError } from "@trpc/server"
import { year } from "drizzle-orm/singlestore-core/columns/year"

interface UploadImageParams {
    image: string
}

const credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
}

const s3Client = new Bun.S3Client({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    bucket: "mestrado",
    region: "us-east-1",
})

const s3PublicClient = new Bun.S3Client({
    endpoint: process.env.S3_PUBLIC_ENDPOINT,
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    bucket: "mestrado",
    region: "us-east-1",
})

export async function uploadImageMinIO({ image }: UploadImageParams) {
    function parseDataUrl(dataUrl: string): {
        mimeType?: string
        extension?: string
        base64Data: string
    } {
        const matches = dataUrl.match(/^data:([\w/+.-]+);base64,(.*)$/)
        if (matches && matches.length === 3) {
            const mimeType = matches[1]
            const mimeToExt: Record<string, string> = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/gif": "gif",
                "application/pdf": "pdf",
                "text/plain": "txt",
                "image/webp": "webp",
            }
            const extension = mimeToExt[mimeType] || undefined
            return { mimeType, extension, base64Data: matches[2] }
        }
        return { base64Data: dataUrl }
    }

    const { mimeType, extension, base64Data } = parseDataUrl(image)

    if (!mimeType || !extension) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid image format",
        })
    }

    const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${extension}`
    const buffer = Buffer.from(base64Data, "base64")

    console.log({
        fileName,
        mimeType,
        size: buffer.length,
    })

    let exists = false
    try {
        exists = await s3Client.exists(fileName)
    } catch {
        exists = false
    }

    if (exists) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: `File ${fileName} already exists`,
        })
    }

    try {
        console.log("DEBUG ENDPOINT:", process.env.S3_ENDPOINT);
        await s3Client.write(fileName, buffer, {
            type: mimeType,
        })
    } catch (err) {
        console.error("MinIO upload error:", err)

        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error while uploading file to storage",
        })
    }

    return { success: true, fileName }
}

export async function checkFileExistsMinIO(fileName: string): Promise<boolean> {
    const exists = await s3Client.exists(fileName)
    return exists
}

export async function getPreSignedUrlMinIO(fileName: string): Promise<string> {
    return s3PublicClient.presign(fileName, {
        expiresIn: 3600,
    })
}