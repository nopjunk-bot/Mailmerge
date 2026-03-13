"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Loader2 } from "lucide-react";

export default function GeneratePage() {
  const [year, setYear] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [years, setYears] = useState<number[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/semesters")
      .then((r) => r.json())
      .then((data) => {
        const uniqueYears = [
          ...new Set(data.semesters.map((s: { year: number }) => s.year)),
        ] as number[];
        setYears(uniqueYears.sort());
      });

    fetch("/api/students?limit=1000")
      .then((r) => r.json())
      .then((data) => {
        const uniqueClasses = [
          ...new Set(
            data.students.map((s: { className: string }) => s.className)
          ),
        ] as string[];
        setClasses(uniqueClasses.sort());
      });
  }, []);

  useEffect(() => {
    // Update count when filters change
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (className) params.set("className", className);
    params.set("limit", "1000");

    fetch(`/api/students?${params}`)
      .then((r) => r.json())
      .then((data) => setCount(data.total));
  }, [year, className]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: year || undefined,
          className: className || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      // Download PDF
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payment_letters_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("เกิดข้อผิดพลาดในการสร้าง PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">สร้างจดหมายเวียน</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ตั้งค่าการสร้างจดหมาย
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ปีการศึกษา</label>
              <Select
                value={year}
                onValueChange={(v) => setYear(v === "all" ? "" : v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทุกปีการศึกษา" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                ชั้นเรียน (ไม่บังคับ)
              </label>
              <Select
                value={className}
                onValueChange={(v) => setClassName(v === "all" ? "" : v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทุกชั้นเรียน" />
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
            </div>
          </div>

          {count !== null && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                จำนวนจดหมายที่จะสร้าง:{" "}
                <span className="font-bold text-lg">{count}</span> ฉบับ
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || count === 0}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                กำลังสร้าง PDF...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                สร้างจดหมายเวียน
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
