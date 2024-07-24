import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicFacultySchemaValidation } from './academicFaculty.validation';
import { AcademicFacultyControllers } from './academicFaculty.controller';

const router = express.Router();

router.post(
  '/create-academic-faculty',
  validateRequest(
    AcademicFacultySchemaValidation.createAcademicFacultySchemaValidation,
  ),
  AcademicFacultyControllers.createAcademiFaculty,
);

router.get('/:facultyId', AcademicFacultyControllers.getSingleAcademicFaculty);

router.patch(
  '/:facultyId',
  validateRequest(
    AcademicFacultySchemaValidation.updateAcademicFacultySchemaValidation,
  ),
  AcademicFacultyControllers.updateAcademicFaculty,
);

router.get('/', AcademicFacultyControllers.getAllAcademicFaculties);

export const AcademicFacultyRoutes = router;
