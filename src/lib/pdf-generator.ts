import PDFDocument from "pdfkit";
import path from "path";

interface PaymentData {
  semesterLabel: string;
  amount: number;
}

interface StudentData {
  prefix: string;
  firstName: string;
  lastName: string;
  className: string;
  payments: PaymentData[];
  total: number;
}

interface LetterSettings {
  signerName: string;
  signerTitle: string;
  schoolName: string;
  schoolAddress: string;
  letterSubject: string;
  letterBody: string;
  letterClosing: string;
  signatureUrl: string;
}

const CM = 28.35; // 1cm in points

export async function generatePDF(
  students: StudentData[],
  settings: LetterSettings,
  signatureBuffer?: Buffer
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 2 * CM, bottom: 2 * CM, left: 2 * CM, right: 2 * CM },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Register Thai font
    const fontPath = path.join(process.cwd(), "public", "fonts", "THSarabunNew.ttf");
    doc.registerFont("THSarabun", fontPath);

    for (let i = 0; i < students.length; i++) {
      if (i > 0) doc.addPage();
      drawLetter(doc, students[i], settings, signatureBuffer);
    }

    doc.end();
  });
}

function drawLetter(
  doc: PDFKit.PDFDocument,
  student: StudentData,
  settings: LetterSettings,
  signatureBuffer?: Buffer
) {
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const leftMargin = doc.page.margins.left;
  let y = doc.page.margins.top;

  // Student info (top-right)
  doc.font("THSarabun").fontSize(12);
  const studentName = `${student.prefix}${student.firstName} ${student.lastName}`;
  doc.text(`ชื่อ: ${studentName}`, leftMargin, y, {
    width: pageWidth,
    align: "right",
  });
  y += 18;
  doc.text(`ชั้น: ${student.className}`, leftMargin, y, {
    width: pageWidth,
    align: "right",
  });
  y += 25;

  // School header (centered)
  doc.fontSize(16);
  doc.text(settings.schoolName, leftMargin, y, {
    width: pageWidth,
    align: "center",
  });
  y += 22;
  doc.text(settings.schoolAddress, leftMargin, y, {
    width: pageWidth,
    align: "center",
  });
  y += 30;

  // Subject
  doc.fontSize(14);
  doc.text(settings.letterSubject, leftMargin, y, { width: pageWidth });
  y += 25;

  // Recipient
  const recipient = `เรียน ผู้ปกครองของ${student.prefix}${student.firstName} ${student.lastName} นักเรียนชั้น ${student.className}`;
  doc.text(recipient, leftMargin, y, { width: pageWidth });
  y += 30;

  // Body
  doc.text(settings.letterBody, leftMargin, y, {
    width: pageWidth,
    lineGap: 4,
  });
  y = doc.y + 20;

  // Payment table
  const tableLeft = leftMargin;
  const col1Width = pageWidth / 2;
  const col2Width = pageWidth / 2;
  const rowHeight = 28;

  // Header row
  drawTableCell(doc, tableLeft, y, col1Width, rowHeight, "ภาคเรียน/ปีการศึกษา", true);
  drawTableCell(doc, tableLeft + col1Width, y, col2Width, rowHeight, "ยอดชำระ", true);
  y += rowHeight;

  // Data rows
  for (const payment of student.payments) {
    drawTableCell(doc, tableLeft, y, col1Width, rowHeight, payment.semesterLabel, false);
    drawTableCell(
      doc,
      tableLeft + col1Width,
      y,
      col2Width,
      rowHeight,
      payment.amount.toLocaleString("th-TH"),
      false
    );
    y += rowHeight;
  }

  // Total row
  drawTableCell(doc, tableLeft, y, col1Width, rowHeight, "รวม", true);
  drawTableCell(
    doc,
    tableLeft + col1Width,
    y,
    col2Width,
    rowHeight,
    student.total.toLocaleString("th-TH"),
    true
  );
  y += rowHeight + 20;

  // Closing
  doc.fontSize(14);
  doc.text(settings.letterClosing, leftMargin, y, {
    width: pageWidth,
    lineGap: 4,
  });
  y = doc.y + 25;

  // Signature section
  doc.text("ขอแสดงความนับถือ", leftMargin, y, {
    width: pageWidth,
    align: "center",
  });
  y += 20;

  // Signature image
  if (signatureBuffer) {
    try {
      const imgWidth = 4 * CM;
      const imgHeight = 2 * CM;
      const imgX = leftMargin + (pageWidth - imgWidth) / 2;
      doc.image(signatureBuffer, imgX, y, {
        width: imgWidth,
        height: imgHeight,
      });
      y += imgHeight + 5;
    } catch {
      y += 2 * CM;
    }
  } else {
    y += 2 * CM;
  }

  // Signer info
  doc.text(settings.signerName, leftMargin, y, {
    width: pageWidth,
    align: "center",
  });
  y += 20;
  doc.text(settings.signerTitle, leftMargin, y, {
    width: pageWidth,
    align: "center",
  });
  y += 20;
  doc.text(settings.schoolName, leftMargin, y, {
    width: pageWidth,
    align: "center",
  });
  y += 25;

  // Timestamp note
  const now = new Date();
  const thaiYear = now.getFullYear() + 543;
  const note = `หมายเหตุ : ข้อมูลอัพเดต ณ วันที่ ${now.getDate()}/${now.getMonth() + 1}/${thaiYear} เวลา ${now.getHours()}.${String(now.getMinutes()).padStart(2, "0")} น.`;
  doc.fontSize(14);
  doc.text(note, leftMargin, y, { width: pageWidth });
}

function drawTableCell(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  isHeader: boolean
) {
  // Background for header
  if (isHeader) {
    doc.rect(x, y, width, height).fill("#e0e0e0").stroke();
  } else {
    doc.rect(x, y, width, height).stroke();
  }

  // Text
  doc.fillColor("black").font("THSarabun").fontSize(14);
  doc.text(text, x, y + 6, {
    width: width,
    align: "center",
  });
}
