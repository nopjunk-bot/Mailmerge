"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Calendar,
  Plus,
  Trash2,
  Save,
  Upload,
  Image,
  CheckCircle,
} from "lucide-react";

interface Semester {
  id: string;
  term: number;
  year: number;
  label: string;
  _count: { payments: number };
}

export default function SettingsPage() {
  // Semester state
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [newTerm, setNewTerm] = useState("1");
  const [newYear, setNewYear] = useState("2569");

  // Letter settings state
  const [letterSettings, setLetterSettings] = useState({
    signerName: "",
    signerTitle: "",
    schoolName: "",
    schoolAddress: "",
    schoolPhone: "",
    letterSubject: "",
    letterBody: "",
    letterClosing: "",
    signatureUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSemesters();
    fetchSettings();
  }, []);

  const fetchSemesters = async () => {
    const res = await fetch("/api/semesters");
    const data = await res.json();
    setSemesters(data.semesters);
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setLetterSettings((prev) => ({ ...prev, ...data.settings }));
  };

  const addSemester = async () => {
    const res = await fetch("/api/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: newTerm, year: newYear }),
    });
    if (res.ok) {
      fetchSemesters();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const deleteSemester = async (id: string, label: string) => {
    if (!confirm(`ต้องการลบภาคเรียน ${label}?`)) return;
    const res = await fetch("/api/semesters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchSemesters();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    const { signatureUrl, ...rest } = letterSettings;
    void signatureUrl; // signatureUrl is managed separately
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-signature", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setLetterSettings((prev) => ({ ...prev, signatureUrl: data.url }));
      } else {
        alert(data.error);
      }
    } catch {
      alert("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ตั้งค่า</h2>

      <Tabs defaultValue="semesters">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="semesters">
            <Calendar className="h-4 w-4 mr-2" />
            ภาคเรียน
          </TabsTrigger>
          <TabsTrigger value="letter">
            <Settings className="h-4 w-4 mr-2" />
            จดหมาย
          </TabsTrigger>
        </TabsList>

        <TabsContent value="semesters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>จัดการภาคเรียน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="space-y-2">
                  <Label>ภาคเรียนที่</Label>
                  <select
                    className="border rounded-md px-3 py-2"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>ปีการศึกษา</Label>
                  <Input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-32"
                  />
                </div>
                <Button onClick={addSemester}>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่ม
                </Button>
              </div>

              <div className="space-y-2">
                {semesters.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{s.label}</span>
                      <span className="text-sm text-muted-foreground ml-3">
                        ({s._count.payments} รายการค้างชำระ)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSemester(s.id, s.label)}
                      disabled={s._count.payments > 0}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="letter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ลายเซ็น</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {letterSettings.signatureUrl && (
                  <div className="border rounded-lg p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={letterSettings.signatureUrl}
                      alt="ลายเซ็น"
                      className="h-20 object-contain"
                    />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      "กำลังอัพโหลด..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {letterSettings.signatureUrl
                          ? "เปลี่ยนลายเซ็น"
                          : "อัพโหลดลายเซ็น"}
                      </>
                    )}
                  </Button>
                  {!letterSettings.signatureUrl && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <Image className="h-3 w-3 inline mr-1" />
                      รองรับ JPG, PNG
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลจดหมาย</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ชื่อผู้ลงนาม</Label>
                  <Input
                    value={letterSettings.signerName}
                    onChange={(e) =>
                      setLetterSettings((prev) => ({
                        ...prev,
                        signerName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>ตำแหน่ง</Label>
                  <Input
                    value={letterSettings.signerTitle}
                    onChange={(e) =>
                      setLetterSettings((prev) => ({
                        ...prev,
                        signerTitle: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>ชื่อโรงเรียน</Label>
                  <Input
                    value={letterSettings.schoolName}
                    onChange={(e) =>
                      setLetterSettings((prev) => ({
                        ...prev,
                        schoolName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>ที่อยู่โรงเรียน</Label>
                  <Input
                    value={letterSettings.schoolAddress}
                    onChange={(e) =>
                      setLetterSettings((prev) => ({
                        ...prev,
                        schoolAddress: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>เบอร์โทรศัพท์</Label>
                  <Input
                    value={letterSettings.schoolPhone}
                    onChange={(e) =>
                      setLetterSettings((prev) => ({
                        ...prev,
                        schoolPhone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>หัวเรื่องจดหมาย</Label>
                <Input
                  value={letterSettings.letterSubject}
                  onChange={(e) =>
                    setLetterSettings((prev) => ({
                      ...prev,
                      letterSubject: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>เนื้อหาจดหมาย</Label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-[120px] text-sm"
                  value={letterSettings.letterBody}
                  onChange={(e) =>
                    setLetterSettings((prev) => ({
                      ...prev,
                      letterBody: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>ข้อความปิดท้าย</Label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-[80px] text-sm"
                  value={letterSettings.letterClosing}
                  onChange={(e) =>
                    setLetterSettings((prev) => ({
                      ...prev,
                      letterClosing: e.target.value,
                    }))
                  }
                />
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    บันทึกแล้ว
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
