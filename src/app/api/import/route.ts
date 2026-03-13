import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseExcelBuffer } from "@/lib/excel-parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์ Excel" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Get all semesters sorted by label
    const semesters = await prisma.semester.findMany({
      orderBy: [{ year: "asc" }, { term: "asc" }],
    });

    const semesterLabels = semesters.map((s) => s.label);
    const semesterMap = new Map(semesters.map((s) => [s.label, s.id]));

    // Parse Excel
    const parsedStudents = parseExcelBuffer(buffer, semesterLabels);

    if (parsedStudents.length === 0) {
      return NextResponse.json(
        { error: "ไม่พบนักเรียนที่มียอดค้างชำระในไฟล์นี้" },
        { status: 400 }
      );
    }

    // Import in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create import batch
      const batch = await tx.importBatch.create({
        data: {
          fileName: file.name,
          count: parsedStudents.length,
        },
      });

      let imported = 0;

      for (const student of parsedStudents) {
        // Create student
        const created = await tx.student.create({
          data: {
            studentNo: student.studentNo,
            studentId: student.studentId,
            prefix: student.prefix,
            firstName: student.firstName,
            lastName: student.lastName,
            className: student.className,
            importBatchId: batch.id,
          },
        });

        // Create payments
        for (const payment of student.payments) {
          const semesterId = semesterMap.get(payment.semesterLabel);
          if (semesterId) {
            await tx.payment.create({
              data: {
                studentId: created.id,
                semesterId: semesterId,
                amount: payment.amount,
              },
            });
          }
        }

        imported++;
      }

      return { batchId: batch.id, imported };
    });

    return NextResponse.json({
      message: `นำเข้าข้อมูลสำเร็จ ${result.imported} คน`,
      imported: result.imported,
      batchId: result.batchId,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" },
      { status: 500 }
    );
  }
}
