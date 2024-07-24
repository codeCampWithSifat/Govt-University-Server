import { z } from 'zod';

const createAcademicDepartmentSchemaValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is Required' }),
    academicFaculty: z.string({
      required_error: 'Academic Faculty Is Required',
    }),
  }),
});

const updateAcademicDepartmentSchemaValidationSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

export const AcademicDepartmentValidation = {
  createAcademicDepartmentSchemaValidationSchema,
  updateAcademicDepartmentSchemaValidationSchema,
};
