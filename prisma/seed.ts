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

  // Create students
  const studentsData = [
    { fullName: "Ramesh Sharma", rollNumber: "01", className: "10", section: "A", gender: "Male", guardianName: "Suresh Sharma", guardianPhone: "9800000001" },
    { fullName: "Sita Thapa", rollNumber: "02", className: "10", section: "A", gender: "Female", guardianName: "Mohan Thapa", guardianPhone: "9800000002" },
    { fullName: "Hari Adhikari", rollNumber: "03", className: "10", section: "A", gender: "Male", guardianName: "Krishna Adhikari", guardianPhone: "9800000003" },
    { fullName: "Gita Poudel", rollNumber: "04", className: "10", section: "A", gender: "Female", guardianName: "Ram Poudel", guardianPhone: "9800000004" },
    { fullName: "Binod Karki", rollNumber: "05", className: "10", section: "A", gender: "Male", guardianName: "Dhan Karki", guardianPhone: "9800000005" },
    { fullName: "Sunita Rai", rollNumber: "06", className: "10", section: "B", gender: "Female", guardianName: "Bir Rai", guardianPhone: "9800000006" },
    { fullName: "Prakash Tamang", rollNumber: "07", className: "10", section: "B", gender: "Male", guardianName: "Dawa Tamang", guardianPhone: "9800000007" },
    { fullName: "Anita Shrestha", rollNumber: "08", className: "10", section: "B", gender: "Female", guardianName: "Gopal Shrestha", guardianPhone: "9800000008" },
    { fullName: "Dipesh Magar", rollNumber: "09", className: "10", section: "B", gender: "Male", guardianName: "Jit Magar", guardianPhone: "9800000009" },
    { fullName: "Priya Gurung", rollNumber: "10", className: "10", section: "B", gender: "Female", guardianName: "Man Gurung", guardianPhone: "9800000010" },
    { fullName: "Arun Basnet", rollNumber: "01", className: "9", section: "A", gender: "Male", guardianName: "Til Basnet", guardianPhone: "9800000011" },
    { fullName: "Kavita Limbu", rollNumber: "02", className: "9", section: "A", gender: "Female", guardianName: "Bir Limbu", guardianPhone: "9800000012" },
  ];

  const students = await Promise.all(
    studentsData.map((s) =>
      prisma.student.create({
        data: {
          ...s,
          admissionDate: new Date("2023-04-01"),
        },
      })
    )
  );

  console.log("✅ Students created");

  // Create homework assignments
  const hw1 = await prisma.homework.create({
    data: {
      title: "Chapter 3 Exercises",
      subject: "Mathematics",
      description: "Complete exercises 3.1 to 3.5",
      className: "10",
      section: "A",
      assignedDate: new Date("2026-08-10"),
      dueDate: new Date("2026-08-12"),
      createdById: admin.id,
    },
  });

  const hw2 = await prisma.homework.create({
    data: {
      title: "Essay Writing",
      subject: "English",
      description: "Write a 500-word essay on environment",
      className: "10",
      section: "A",
      assignedDate: new Date("2026-08-13"),
      dueDate: new Date("2026-08-15"),
      createdById: admin.id,
    },
  });

  const hw3 = await prisma.homework.create({
    data: {
      title: "Science Lab Report",
      subject: "Science",
      description: "Write lab report for experiment #4",
      className: "10",
      section: "A",
      assignedDate: new Date("2026-08-16"),
      dueDate: new Date("2026-08-18"),
      createdById: admin.id,
    },
  });

  const hw4 = await prisma.homework.create({
    data: {
      title: "History Notes",
      subject: "Social Studies",
      description: "Read and summarize chapter 5",
      className: "10",
      section: "B",
      assignedDate: new Date("2026-08-10"),
      dueDate: new Date("2026-08-12"),
      createdById: admin.id,
    },
  });

  console.log("✅ Homework created");

  // Create homework records for class 10A students
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const class10AStudents = students.filter((s: any) => s.className === "10" && s.section === "A");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const class10BStudents = students.filter((s: any) => s.className === "10" && s.section === "B");

  // hw1 records (class 10A)
  const hw1Statuses = ["COMPLETED", "COMPLETED", "NOT_COMPLETED", "COMPLETED", "COMPLETED"] as const;
  for (let i = 0; i < class10AStudents.length; i++) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: class10AStudents[i].id,
        homeworkId: hw1.id,
        status: hw1Statuses[i],
      },
    });
  }

  // hw2 records (class 10A)
  const hw2Statuses = ["COMPLETED", "NOT_COMPLETED", "NOT_COMPLETED", "COMPLETED", "COMPLETED"] as const;
  for (let i = 0; i < class10AStudents.length; i++) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: class10AStudents[i].id,
        homeworkId: hw2.id,
        status: hw2Statuses[i],
      },
    });
  }

  // hw3 records (class 10A)
  const hw3Statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "NOT_COMPLETED", "NOT_COMPLETED"] as const;
  for (let i = 0; i < class10AStudents.length; i++) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: class10AStudents[i].id,
        homeworkId: hw3.id,
        status: hw3Statuses[i],
      },
    });
  }

  // hw4 records (class 10B)
  const hw4Statuses = ["COMPLETED", "NOT_COMPLETED", "COMPLETED", "COMPLETED", "NOT_COMPLETED"] as const;
  for (let i = 0; i < class10BStudents.length; i++) {
    await prisma.homeworkRecord.create({
      data: {
        studentId: class10BStudents[i].id,
        homeworkId: hw4.id,
        status: hw4Statuses[i],
      },
    });
  }

  console.log("✅ Homework records created");

  // Create tests
  const test1 = await prisma.test.create({
    data: {
      name: "Unit Test 1",
      subject: "Mathematics",
      className: "10",
      section: "A",
      testDate: new Date("2026-07-20"),
      fullMarks: 50,
      description: "Chapters 1-3",
      createdById: admin.id,
    },
  });

  const test2 = await prisma.test.create({
    data: {
      name: "Unit Test 2",
      subject: "Mathematics",
      className: "10",
      section: "A",
      testDate: new Date("2026-08-05"),
      fullMarks: 50,
      description: "Chapters 4-6",
      createdById: admin.id,
    },
  });

  const test3 = await prisma.test.create({
    data: {
      name: "English Midterm",
      subject: "English",
      className: "10",
      section: "A",
      testDate: new Date("2026-07-25"),
      fullMarks: 100,
      description: "Mid-term examination",
      createdById: admin.id,
    },
  });

  const test4 = await prisma.test.create({
    data: {
      name: "Science Quiz",
      subject: "Science",
      className: "10",
      section: "B",
      testDate: new Date("2026-08-10"),
      fullMarks: 25,
      description: "Chapters 1-2 quiz",
      createdById: admin.id,
    },
  });

  console.log("✅ Tests created");

  // Test results for class 10A
  const test1Marks = [45, 38, 30, 42, 35];
  const test2Marks = [48, 40, 32, 44, 38];
  const test3Marks = [85, 72, 60, 78, 68];

  for (let i = 0; i < class10AStudents.length; i++) {
    await prisma.testResult.create({
      data: { testId: test1.id, studentId: class10AStudents[i].id, obtainedMarks: test1Marks[i] },
    });
    await prisma.testResult.create({
      data: { testId: test2.id, studentId: class10AStudents[i].id, obtainedMarks: test2Marks[i] },
    });
    await prisma.testResult.create({
      data: { testId: test3.id, studentId: class10AStudents[i].id, obtainedMarks: test3Marks[i] },
    });
  }

  // Test results for class 10B
  const test4Marks = [22, 18, 20, 23, 15];
  for (let i = 0; i < class10BStudents.length; i++) {
    await prisma.testResult.create({
      data: { testId: test4.id, studentId: class10BStudents[i].id, obtainedMarks: test4Marks[i] },
    });
  }

  console.log("✅ Test results created");

  // Add remarks
  await prisma.studentRemark.create({
    data: {
      studentId: students[0].id,
      remark: "Ramesh is performing excellently in Mathematics. Keep up the great work!",
      createdById: admin.id,
    },
  });

  await prisma.studentRemark.create({
    data: {
      studentId: students[2].id,
      remark: "Hari needs to focus more on completing homework assignments regularly.",
      createdById: admin.id,
    },
  });

  await prisma.studentRemark.create({
    data: {
      studentId: students[1].id,
      remark: "Sita has shown good improvement in English. Needs to work on Math.",
      createdById: admin.id,
    },
  });

  console.log("✅ Remarks created");
  console.log("🎉 Database seeded successfully!");
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
