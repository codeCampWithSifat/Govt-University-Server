import { z } from 'zod';

const createAcademicFacultySchemaValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is Required',
    }),
  }),
});

const updateAcademicFacultySchemaValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is Required',
    }),
  }),
});

export const AcademicFacultySchemaValidation = {
  createAcademicFacultySchemaValidation,
  updateAcademicFacultySchemaValidation,
};
