"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  semester: { label: string };
}

interface Student {
  id: string;
  studentNo: number;
  studentId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  className: string;
  payments: Payment[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [year, setYear] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<number[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (className) params.set("className", className);
    if (search) params.set("search", search);
    params.set("page", String(page));

    const res = await fetch(`/api/students?${params}`);
    const data = await res.json();
    setStudents(data.students);
    setTotal(data.total);
    setLoading(false);
  }, [year, className, search, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    // Fetch available years and classes
    fetch("/api/semesters")
      .then((r) => r.json())
      .then((data) => {
        const uniqueYears = [...new Set(data.semesters.map((s: { year: number }) => s.year))] as number[];
        setYears(uniqueYears.sort());
      });

    fetch("/api/students?limit=1000")
      .then((r) => r.json())
      .then((data) => {
        const uniqueClasses = [
          ...new Set(data.students.map((s: Student) => s.className)),
        ] as string[];
        setClasses(uniqueClasses.sort());
      });
  }, []);

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">รายชื่อนักเรียน</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            ค้นหาและกรองข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาชื่อ / เลขประจำตัว"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={year}
              onValueChange={(v) => {
                setYear(v === "all" ? "" : v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="ปีการศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกปีการศึกษา</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={className}
              onValueChange={(v) => {
                setClassName(v === "all" ? "" : v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="ชั้นเรียน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกชั้นเรียน</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              พบ {total} คน
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">เลขที่</TableHead>
                <TableHead>เลขประจำตัว</TableHead>
                <TableHead>ชื่อ - สกุล</TableHead>
                <TableHead>ชั้น</TableHead>
                <TableHead>ภาคเรียนค้าง</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    กำลังโหลด...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const totalAmount = student.payments.reduce(
                    (sum, p) => sum + p.amount,
                    0
                  );
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentNo}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        {student.prefix}
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.payments.map((p) => (
                            <Badge key={p.id} variant="secondary" className="text-xs">
                              {p.semester.label}: {p.amount.toLocaleString()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        {totalAmount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                หน้า {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
