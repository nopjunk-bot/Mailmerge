"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch {
      setResult({
        success: false,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">นำเข้าข้อมูล Excel</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            อัพโหลดไฟล์ Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              เลือกไฟล์ Excel (.xlsx) ที่มีข้อมูลนักเรียน
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              เลือกไฟล์
            </Button>
            {file && (
              <p className="mt-4 text-sm text-green-600">
                ไฟล์ที่เลือก: {file.name} (
                {(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">รูปแบบไฟล์ Excel ที่รองรับ:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>แต่ละ Sheet มีหัวข้อ &quot;รายชื่อนักเรียนชั้นมัธยมศึกษาปีที่...&quot;</li>
              <li>คอลัมน์: เลขที่, เลขประจำตัว, คำนำหน้า, ชื่อ, สกุล, ภาคเรียน...</li>
              <li>ยอดค้างชำระเป็นตัวเลข, ชำระแล้วใส่ &quot;จ่ายแล้ว&quot;</li>
            </ul>
          </div>

          {file && (
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="w-full"
            >
              {loading ? "กำลังนำเข้า..." : "นำเข้าข้อมูล"}
            </Button>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                result.success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              {result.message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
