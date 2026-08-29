import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.studentRemark.deleteMany();
  await prisma.testResult.deleteMany();
  await prisma.homeworkRecord.deleteMany();
  await prisma.test.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminEmail = process.env.ADMIN_EMAIL || "admin@school.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const viewerEmail = process.env.VIEWER_EMAIL || "viewer@school.com";
  const viewerPassword = process.env.VIEWER_PASSWORD || "viewer123";

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "Viewer User",
      email: viewerEmail,
      passwordHash: await bcrypt.hash(viewerPassword, 12),
      role: "VIEWER",
    },
  });

  console.log("✅ Users created");

  // Create students for Class 8, Section Lily
  const studentsData = [
    { fullName: "Alina Bhujel", rollNumber: "1", className: "8", section: "Lily", gender: "Female", guardianName: "Mahendra Bhujel", guardianPhone: "9846213228", address: "Arghau chowk" },
    { fullName: "Amit Kumal", rollNumber: "2", className: "8", section: "Lily", gender: "Male", guardianName: "Mitra Bdr Kumal", guardianPhone: "9815152458", address: "Hariyali Tole" },
    { fullName: "Anushka Purja", rollNumber: "3", className: "8", section: "Lily", gender: "Female", guardianName: "Dalsur Purja", guardianPhone: "9806724881", address: "Arghau chowk" },
    { fullName: "Arpan Gurung", rollNumber: "4", className: "8", section: "Lily", gender: "Male", guardianName: "Kumar Gurung", guardianPhone: "9805804355", address: "Buddha Tole" },
    { fullName: "Asbin Adhikari", rollNumber: "5", className: "8", section: "Lily", gender: "Male", guardianName: "Basudav Adhikari", guardianPhone: "9846744251", address: "Kharane" },
    { fullName: "Ashim Khatri", rollNumber: "6", className: "8", section: "Lily", gender: "Male", guardianName: "Sandeep Khatri", guardianPhone: "9847732085", address: "Sakneri" },
    { fullName: "Garima Basyal", rollNumber: "7", className: "8", section: "Lily", gender: "Female", guardianName: "Gobinda Basyal", guardianPhone: "9816150653", address: "Hariyali Tole" },
    { fullName: "JENISHA GURUNG", rollNumber: "8", className: "8", section: "Lily", gender: "Female", guardianName: "Khum Bdr Gurung", guardianPhone: "9806693703", address: "Archale" },
    { fullName: "Labish Bhandari", rollNumber: "9", className: "8", section: "Lily", gender: "Male", guardianName: "Lila Bhakta Bhandari", guardianPhone: "9846364586", address: "Talchowk Dharmakata" },
    { fullName: "Lavya Rana", rollNumber: "10", className: "8", section: "Lily", gender: "Female", guardianName: "Krishna Bdr Rana", guardianPhone: "9817120692", address: "Kaligandaki" },
    { fullName: "Mingma(Kristina) Doma Sherpa", rollNumber: "11", className: "8", section: "Lily", gender: "Female", guardianName: "Milan Sherpa", guardianPhone: "9763614261", address: "Kaligandaki" },
    { fullName: "Namuna Sapkota", rollNumber: "12", className: "8", section: "Lily", gender: "Female", guardianName: "Bikash Sapkota", guardianPhone: "9849130572", address: "Jaruwa" },
    { fullName: "Nikesh Bhandari", rollNumber: "13", className: "8", section: "Lily", gender: "Male", guardianName: "Shailendra Bhandari", guardianPhone: "9856080221", address: "Taalbeshi" },
    { fullName: "Nimisha Sunar", rollNumber: "14", className: "8", section: "Lily", gender: "Female", guardianName: "Nishan Sunar", guardianPhone: "9805834519", address: "GMC Rithepani" },
    { fullName: "Prajwol Adhikari", rollNumber: "15", className: "8", section: "Lily", gender: "Male", guardianName: "Bharat Raj Adhikari", guardianPhone: "9856032896", address: "Kharane" },
    { fullName: "Prajwol Bhandari", rollNumber: "16", className: "8", section: "Lily", gender: "Male", guardianName: "Manoj Bhandari", guardianPhone: "9814121729", address: "Sakneri" },
    { fullName: "Rabins Sapkota", rollNumber: "17", className: "8", section: "Lily", gender: "Male", guardianName: "Ramesh Sapkota", guardianPhone: "9804111990", address: "Begnastaal" },
    { fullName: "Rajiv Acharya", rollNumber: "18", className: "8", section: "Lily", gender: "Male", guardianName: "Raju Acharya", guardianPhone: "9816635551", address: "Rakhi dada" },
    { fullName: "Rehan B.K", rollNumber: "19", className: "8", section: "Lily", gender: "Male", guardianName: "Motibul B.K", guardianPhone: "9814165879", address: "Golipatan" },
    { fullName: "Riyan Thapa", rollNumber: "20", className: "8", section: "Lily", gender: "Female", guardianName: "Saroj Thapa", guardianPhone: "9846038614", address: "Panathar" },
    { fullName: "Sabin Poudel", rollNumber: "21", className: "8", section: "Lily", gender: "Male", guardianName: "Buddhi Nath Poudel", guardianPhone: "9816646583", address: "KaliGandaki" },
    { fullName: "Samit Pun", rollNumber: "22", className: "8", section: "Lily", gender: "Male", guardianName: "Kesh Bahadur Pun", guardianPhone: "9846907719", address: "Kaligandaki" },
    { fullName: "Sangam Pariyar", rollNumber: "23", className: "8", section: "Lily", gender: "Male", guardianName: "Ganesh Bdr Pariyar", guardianPhone: "9824106902", address: "Rithepani-27" },
    { fullName: "Sangeet Lamichhane", rollNumber: "24", className: "8", section: "Lily", gender: "Male", guardianName: "Narayan Raj Lamichhane", guardianPhone: "9869380448", address: "Rakhi Dada" },
    { fullName: "Shiny Pun", rollNumber: "25", className: "8", section: "Lily", gender: "Female", guardianName: "Kumar Pun", guardianPhone: "9866311349", address: "Jaruwa" },
    { fullName: "Shishir Paudel", rollNumber: "26", className: "8", section: "Lily", gender: "Male", guardianName: "Narayan Paudel", guardianPhone: "9848249307", address: "Chemeki Tole rithepani" },
    { fullName: "Sirish B.K.", rollNumber: "27", className: "8", section: "Lily", gender: "Male", guardianName: "Santosh B.K", guardianPhone: "9805867414", address: "Archale" },
    { fullName: "Sophiva Sunar", rollNumber: "28", className: "8", section: "Lily", gender: "Female", guardianName: "Suraj Sunar", guardianPhone: "9803092036", address: "Talchowk" },
    { fullName: "Srijan Lamichhane", rollNumber: "29", className: "8", section: "Lily", gender: "Male", guardianName: "Shree psd Lanichhane", guardianPhone: "9856065170", address: "Rakhi dada" },
    { fullName: "Subarna Lamichhane", rollNumber: "30", className: "8", section: "Lily", gender: "Male", guardianName: "Surya Lamichhane", guardianPhone: "9856004555", address: "Kharane" },
    { fullName: "Sushan Ramdam", rollNumber: "31", className: "8", section: "Lily", gender: "Male", guardianName: "Santosh Ramdam", guardianPhone: "9867661570", address: "Naya taalchowk" },
    { fullName: "Sushil Kandel", rollNumber: "32", className: "8", section: "Lily", gender: "Male", guardianName: "Ram chandra Kandel", guardianPhone: "9847614086", address: "Hariyali Tole" },
    { fullName: "Susmita Kandel", rollNumber: "33", className: "8", section: "Lily", gender: "Female", guardianName: "Ram chandra Kandel", guardianPhone: "9847614086", address: "Hariyali Tole" },
  ];

  const students = await Promise.all(
    studentsData.map((s) =>
      prisma.student.create({
        data: {
          ...s,
          admissionDate: new Date("2024-04-01"),
        },
      })
    )
  );

  console.log(`✅ Created ${students.length} students for Class 8 Lily`);

  // 1. Scientific Measurement (Completed by all)
  const hw1 = await prisma.homework.create({
    data: {
      title: "Scientific Measurement",
      subject: "Science",
      description: "Scientific measurement exercises and lab notes",
      className: "8",
      section: "Lily",
      assignedDate: new Date("2026-08-15"),
      dueDate: new Date("2026-08-20"),
      createdById: admin.id,
    },
  });

  for (const student of students) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: student.id,
        homeworkId: hw1.id,
        status: "COMPLETED",
      },
    });
  }

  // 2. Force and Motion (Chapter Question) - Completed ONLY by Riyan Thapa
  const hw2 = await prisma.homework.create({
    data: {
      title: "Force and Motion (Chapter Question)",
      subject: "Science",
      description: "Solve chapter end questions for Force and Motion",
      className: "8",
      section: "Lily",
      assignedDate: new Date("2026-08-21"),
      dueDate: new Date("2026-08-25"),
      createdById: admin.id,
    },
  });

  for (const student of students) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: student.id,
        homeworkId: hw2.id,
        status: student.fullName.toLowerCase().includes("riyan thapa") ? "COMPLETED" : "NOT_COMPLETED",
      },
    });
  }

  // 3. Force and Motion (Numerical / Exercise) - Completed by ALL
  const hw3 = await prisma.homework.create({
    data: {
      title: "Force and Motion",
      subject: "Science",
      description: "Force and motion exercises",
      className: "8",
      section: "Lily",
      assignedDate: new Date("2026-08-26"),
      dueDate: new Date("2026-08-28"),
      createdById: admin.id,
    },
  });

  for (const student of students) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: student.id,
        homeworkId: hw3.id,
        status: "COMPLETED",
      },
    });
  }

  console.log("✅ All 3 homework assignments created successfully!");

  // Create Test: Scientific Measurement (Full Marks: 40)
  const test1 = await prisma.test.create({
    data: {
      name: "Scientific Measurement Test",
      subject: "Science",
      className: "8",
      section: "Lily",
      testDate: new Date("2026-08-28"),
      fullMarks: 40,
      description: "First lesson test result on Scientific Measurement (Out of 40)",
      createdById: admin.id,
    },
  });

  // Marks map from handwritten sheet
  const testMarksByName: Record<string, number> = {
    "rajiv acharya": 20,
    "ashim khatri": 35,
    "riyan thapa": 37,
    "asbin adhikari": 32,
    "sushil kandel": 33,
    "mingma(kristina) doma sherpa": 30,
    "sabin poudel": 32,
    "srijan lamichhane": 23,
    "shishir paudel": 17,
    "subarna lamichhane": 21,
    "nikesh bhandari": 28,
    "garima basyal": 25,
    "anushka purja": 23,
    "labish bhandari": 23,
    "jenisha gurung": 30,
    "sophiva sunar": 22, // listed as Sofia B.K / Sophiva
    "sirish b.k.": 27,
    "arpan gurung": 26,
    "rehan b.k": 19, // listed as Rehan Khan / Rehan B.K
    "prajwol adhikari": 33,
    "prajwol bhandari": 29,
    "namuna sapkota": 35,
    "susmita kandel": 37,
    "lavya rana": 32, // marked as 37 -> 32
    "alina bhujel": 25,
    "samit pun": 25,
  };

  for (const student of students) {
    const sNameLower = student.fullName.toLowerCase();
    // find matching key
    let marks: number | null = null;
    for (const [key, val] of Object.entries(testMarksByName)) {
      if (sNameLower.includes(key) || key.includes(sNameLower)) {
        marks = val;
        break;
      }
    }

    if (marks !== null) {
      await prisma.testResult.create({
        data: {
          testId: test1.id,
          studentId: student.id,
          obtainedMarks: marks,
        },
      });
    }
  }

  console.log("✅ Scientific Measurement Test Results created!");
  console.log(`\nAdmin: ${adminEmail} / ${adminPassword}`);
  console.log(`Viewer: ${viewerEmail} / ${viewerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
