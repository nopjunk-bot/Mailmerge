import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const year = searchParams.get("year");
  const className = searchParams.get("className");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (year) {
    where.payments = {
      some: {
        semester: {
          year: parseInt(year),
        },
      },
    };
  }

  if (className) {
    where.className = className;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { studentId: { contains: search } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        payments: {
          include: { semester: true },
          orderBy: { semester: { label: "asc" } },
        },
      },
      orderBy: [{ className: "asc" }, { studentNo: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return NextResponse.json({ students, total, page, limit });
}

export async function DELETE(req: NextRequest) {
  const { batchId } = await req.json();

  if (batchId) {
    await prisma.importBatch.delete({ where: { id: batchId } });
    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  }

  return NextResponse.json({ error: "ไม่ระบุข้อมูลที่จะลบ" }, { status: 400 });
}
