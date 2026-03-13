import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });
  console.log("Admin user created: test@test.com / admin123");

  // Seed semesters
  const semesters = [
    { term: 1, year: 2566, label: "1/2566" },
    { term: 2, year: 2566, label: "2/2566" },
    { term: 1, year: 2567, label: "1/2567" },
    { term: 2, year: 2567, label: "2/2567" },
    { term: 1, year: 2568, label: "1/2568" },
    { term: 2, year: 2568, label: "2/2568" },
  ];

  for (const semester of semesters) {
    await prisma.semester.upsert({
      where: { label: semester.label },
      update: {},
      create: semester,
    });
  }
  console.log("Semesters created:", semesters.map((s) => s.label).join(", "));

  // Seed default settings
  const settings = [
    {
      key: "signerName",
      value: "(นางสาวจิรัตติกาญจน์ สุรีวรานนท์)",
    },
    {
      key: "signerTitle",
      value: "รองผู้อำนวยการกลุ่มบริหารงบประมาณ",
    },
    {
      key: "schoolName",
      value: "โรงเรียนมาบตาพุดพันพิทยาคาร",
    },
    {
      key: "schoolAddress",
      value: "498 ต.เนินพระ อ.เมือง จ.ระยอง",
    },
    {
      key: "schoolPhone",
      value: "081-7232569",
    },
    {
      key: "letterSubject",
      value: "เรื่อง ติดตามการชำระเงินค่าบำรุงการศึกษา",
    },
    {
      key: "letterBody",
      value: `เนื่องด้วยขณะนี้เข้าสู่ช่วงปลายภาคเรียนที่ 2 ปีการศึกษา 2568 ซึ่งเป็นภาคเรียนสุดท้ายในการสำเร็จการศึกษาของนักเรียนชั้นมัธยมศึกษาปีที่ 3 และ ชั้นมัธยมศึกษาปีที่ 6 โรงเรียนจึงขอความอนุเคราะห์ท่านผู้ปกครองตรวจสอบและดำเนินการชำระเงินบำรุงการศึกษาที่ยังค้างอยู่ ให้แล้วเสร็จ ภายในวันที่ 13 มีนาคม 2569 มียอดค้างชำระค่าบำรุงการศึกษาดังรายละเอียดต่อไปนี้`,
    },
    {
      key: "letterClosing",
      value: `จึงขอใคร่ความร่วมมือจากผู้ปกครองให้ชำระเงินค่าบำรุงการศึกษาตามยอดดังกล่าวที่ห้องการเงินโรงเรียนมาบตาพุดพันพิทยาคาร ในวันและเวลาราชการ และขอภัยหากท่านชำระแล้ว โดยสามารถตรวจสอบยอดกับทางโรงเรียนได้ที่ เบอร์โทร 081-7232569`,
    },
    {
      key: "signatureUrl",
      value: "",
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("Default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
