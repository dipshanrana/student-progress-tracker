import { z } from "zod";

export const studentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  rollNumber: z.string().min(1, "Roll number is required"),
  className: z.string().min(1, "Class is required"),
  section: z.string().default("A"),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional().nullable(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  admissionDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const homeworkSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    subject: z.string().min(1, "Subject is required"),
    description: z.string().optional(),
    className: z.string().min(1, "Class is required"),
    section: z.string().min(1, "Section is required"),
    assignedDate: z.string().min(1, "Assigned date is required"),
    dueDate: z.string().min(1, "Due date is required"),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.assignedDate), {
    message: "Due date must be on or after assigned date",
    path: ["dueDate"],
  });

export const testSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  subject: z.string().min(1, "Subject is required"),
  className: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  testDate: z.string().min(1, "Test date is required"),
  fullMarks: z.coerce.number().min(1, "Full marks must be greater than 0"),
  description: z.string().optional(),
});

export const testResultSchema = z.object({
  studentId: z.string(),
  obtainedMarks: z.coerce.number().min(0, "Marks cannot be negative"),
});

export const testResultsSchema = z.object({
  results: z.array(testResultSchema),
  fullMarks: z.number(),
}).refine(
  (data) => data.results.every((r) => r.obtainedMarks <= data.fullMarks),
  { message: "Obtained marks cannot exceed full marks" }
);

export const remarkSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  remark: z.string().min(5, "Remark must be at least 5 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type HomeworkInput = z.infer<typeof homeworkSchema>;
export type TestInput = z.infer<typeof testSchema>;
export type RemarkInput = z.infer<typeof remarkSchema>;
