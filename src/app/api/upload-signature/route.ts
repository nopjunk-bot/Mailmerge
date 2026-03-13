import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์ลายเซ็น" },
        { status: 400 }
      );
    }

    // Check if Vercel Blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Fallback: store as base64 in database
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      await prisma.setting.upsert({
        where: { key: "signatureUrl" },
        update: { value: base64 },
        create: { key: "signatureUrl", value: base64 },
      });

      return NextResponse.json({
        url: base64,
        message: "อัพโหลดลายเซ็นสำเร็จ (เก็บในฐานข้อมูล)",
      });
    }

    // Upload to Vercel Blob
    const blob = await put(`signatures/${file.name}`, file, {
      access: "public",
    });

    // Save URL to settings
    await prisma.setting.upsert({
      where: { key: "signatureUrl" },
      update: { value: blob.url },
      create: { key: "signatureUrl", value: blob.url },
    });

    return NextResponse.json({
      url: blob.url,
      message: "อัพโหลดลายเซ็นสำเร็จ",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพโหลด" },
      { status: 500 }
    );
  }
}
