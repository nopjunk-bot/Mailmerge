import * as XLSX from "xlsx";

export interface ParsedStudent {
  studentNo: number;
  studentId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  className: string;
  payments: { semesterLabel: string; amount: number }[];
}

export function parseExcelBuffer(
  buffer: Buffer,
  semesterLabels: string[]
): ParsedStudent[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const students: ParsedStudent[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    // Find all class sections by looking for "รายชื่อนักเรียนชั้น"
    const classSections: { row: number; name: string }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row[0] && String(row[0]).includes("รายชื่อนักเรียนชั้น")) {
        const fullText = String(row[0]);
        let className: string | null = null;

        if (fullText.includes("มัธยมศึกษาปีที่")) {
          const parts = fullText.split("มัธยมศึกษาปีที่");
          if (parts.length > 1) {
            const classInfo = parts[1].trim().split(/\s+/)[0];
            className = `ม.${classInfo}`;
          }
        }

        if (className) {
          classSections.push({ row: i, name: className });
        }
      }
    }

    if (classSections.length === 0) continue;

    // Process each class section
    for (let si = 0; si < classSections.length; si++) {
      const section = classSections[si];
      const startRow = section.row;
      const endRow =
        si < classSections.length - 1
          ? classSections[si + 1].row
          : data.length;

      // Find header row ("เลขที่")
      let headerRow = -1;
      for (
        let i = startRow;
        i < Math.min(startRow + 10, endRow);
        i++
      ) {
        if (
          data[i] &&
          data[i][0] !== null &&
          String(data[i][0]).trim() === "เลขที่"
        ) {
          headerRow = i;
          break;
        }
      }

      if (headerRow === -1) continue;

      // Read student rows (starting 2 rows after header)
      for (let i = headerRow + 2; i < endRow; i++) {
        const row = data[i];
        if (!row) continue;

        // Stop if we hit a new class section
        if (
          row[0] &&
          String(row[0]).includes("รายชื่อนักเรียนชั้น")
        ) {
          break;
        }

        // Skip empty rows
        if (row[0] === null || row[2] === null) continue;

        try {
          const studentNo = Number(row[0]);
          if (isNaN(studentNo)) continue;

          const studentId = row[1] !== null ? String(row[1]) : "";
          const prefix = row[2] !== null ? String(row[2]) : "";
          const firstName = row[3] !== null ? String(row[3]) : "";
          const lastName = row[4] !== null ? String(row[4]) : "";

          const payments: { semesterLabel: string; amount: number }[] = [];

          // Check columns 5-10 for payment data
          for (let colIdx = 5; colIdx < 5 + semesterLabels.length; colIdx++) {
            const semesterIdx = colIdx - 5;
            if (semesterIdx >= semesterLabels.length) break;

            const cellValue = row[colIdx];
            if (
              cellValue !== null &&
              cellValue !== undefined &&
              String(cellValue).trim() !== "จ่ายแล้ว" &&
              String(cellValue).trim() !== ""
            ) {
              const amount = parseFloat(String(cellValue).trim());
              if (!isNaN(amount) && amount > 0) {
                payments.push({
                  semesterLabel: semesterLabels[semesterIdx],
                  amount,
                });
              }
            }
          }

          if (payments.length > 0) {
            students.push({
              studentNo,
              studentId,
              prefix,
              firstName,
              lastName,
              className: section.name,
              payments,
            });
          }
        } catch {
          continue;
        }
      }
    }
  }

  return students;
}
