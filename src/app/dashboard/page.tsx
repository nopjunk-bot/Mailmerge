import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, Banknote, School } from "lucide-react";

async function getStats() {
  const [totalStudents, studentsWithDebt, totalAmount, classSummary] =
    await Promise.all([
      prisma.student.count(),
      prisma.student.count({
        where: { payments: { some: {} } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.student.groupBy({
        by: ["className"],
        _count: { id: true },
        where: { payments: { some: {} } },
        orderBy: { className: "asc" },
      }),
    ]);

  return {
    totalStudents,
    studentsWithDebt,
    totalAmount: totalAmount._sum.amount || 0,
    classSummary,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">แดชบอร์ด</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              นักเรียนทั้งหมด
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              นักเรียนค้างชำระ
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.studentsWithDebt.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">คน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ยอดค้างชำระรวม
            </CardTitle>
            <Banknote className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">บาท</p>
          </CardContent>
        </Card>
      </div>

      {stats.classSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              สรุปตามชั้นเรียน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.classSummary.map((item) => (
                <div
                  key={item.className}
                  className="p-4 bg-gray-50 rounded-lg text-center"
                >
                  <div className="text-lg font-semibold">{item.className}</div>
                  <div className="text-sm text-muted-foreground">
                    {item._count.id} คน
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalStudents === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">ยังไม่มีข้อมูลนักเรียน</p>
            <p className="text-sm mt-2">
              ไปที่หน้า &quot;นำเข้าข้อมูล&quot; เพื่ออัพโหลดไฟล์ Excel
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Upload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
