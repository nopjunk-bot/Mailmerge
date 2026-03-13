import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePDF } from "@/lib/pdf-generator";

export async function POST(req: NextRequest) {
  try {
    const { year, className } = await req.json();

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      payments: { some: {} },
    };

    if (year) {
      where.payments.some.semester = { year: parseInt(year) };
    }

    if (className) {
      where.className = className;
    }

    // Fetch students with payments
    const students = await prisma.student.findMany({
      where,
      include: {
        payments: {
          include: { semester: true },
          orderBy: { semester: { label: "asc" } },
        },
      },
      orderBy: [{ className: "asc" }, { studentNo: "asc" }],
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบนักเรียนที่มียอดค้างชำระ" },
        { status: 404 }
      );
    }

    // Fetch settings
    const settingsRows = await prisma.setting.findMany();
    const settingsMap = new Map(settingsRows.map((s) => [s.key, s.value]));

    const settings = {
      signerName: settingsMap.get("signerName") || "",
      signerTitle: settingsMap.get("signerTitle") || "",
      schoolName: settingsMap.get("schoolName") || "",
      schoolAddress: settingsMap.get("schoolAddress") || "",
      letterSubject: settingsMap.get("letterSubject") || "",
      letterBody: settingsMap.get("letterBody") || "",
      letterClosing: settingsMap.get("letterClosing") || "",
      signatureUrl: settingsMap.get("signatureUrl") || "",
    };

    // Fetch signature image if available
    let signatureBuffer: Buffer | undefined;
    if (settings.signatureUrl) {
      try {
        const res = await fetch(settings.signatureUrl);
        if (res.ok) {
          signatureBuffer = Buffer.from(await res.arrayBuffer());
        }
      } catch {
        // Skip signature if fetch fails
      }
    }

    // Prepare student data
    const studentData = students.map((s) => ({
      prefix: s.prefix,
      firstName: s.firstName,
      lastName: s.lastName,
      className: s.className,
      payments: s.payments.map((p) => ({
        semesterLabel: p.semester.label,
        amount: p.amount,
      })),
      total: s.payments.reduce((sum, p) => sum + p.amount, 0),
    }));

    // Generate PDF
    const pdfBuffer = await generatePDF(studentData, settings, signatureBuffer);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="payment_letters_${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้าง PDF" },
      { status: 500 }
    );
  }
}
