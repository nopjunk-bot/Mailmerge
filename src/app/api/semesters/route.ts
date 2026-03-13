import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const semesters = await prisma.semester.findMany({
    orderBy: [{ year: "asc" }, { term: "asc" }],
    include: {
      _count: { select: { payments: true } },
    },
  });

  return NextResponse.json({ semesters });
}

export async function POST(req: NextRequest) {
  const { term, year } = await req.json();

  if (!term || !year) {
    return NextResponse.json(
      { error: "กรุณาระบุภาคเรียนและปีการศึกษา" },
      { status: 400 }
    );
  }

  const label = `${term}/${year}`;

  const existing = await prisma.semester.findUnique({
    where: { label },
  });

  if (existing) {
    return NextResponse.json(
      { error: `ภาคเรียน ${label} มีอยู่แล้ว` },
      { status: 400 }
    );
  }

  const semester = await prisma.semester.create({
    data: { term: parseInt(term), year: parseInt(year), label },
  });

  return NextResponse.json({ semester });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  const semester = await prisma.semester.findUnique({
    where: { id },
    include: { _count: { select: { payments: true } } },
  });

  if (!semester) {
    return NextResponse.json(
      { error: "ไม่พบภาคเรียน" },
      { status: 404 }
    );
  }

  if (semester._count.payments > 0) {
    return NextResponse.json(
      { error: "ไม่สามารถลบได้ เนื่องจากมีข้อมูลค้างชำระอ้างอิงอยู่" },
      { status: 400 }
    );
  }

  await prisma.semester.delete({ where: { id } });

  return NextResponse.json({ message: "ลบภาคเรียนสำเร็จ" });
}
