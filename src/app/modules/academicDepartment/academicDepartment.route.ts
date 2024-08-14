import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicDepartmentValidation } from './academicDepartment.validation';
import { AcademicDepartmentControllers } from './academicDepartment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constants';

const router = express.Router();

router.post(
  '/create-academic-department',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(
    AcademicDepartmentValidation.createAcademicDepartmentSchemaValidationSchema,
  ),
  AcademicDepartmentControllers.createAcademicDepartmemt,
);

router.get(
  '/:departmentId',
  AcademicDepartmentControllers.getSingleAcademicDepartment,
);

router.patch(
  '/:departmentId',
  validateRequest(
    AcademicDepartmentValidation.updateAcademicDepartmentSchemaValidationSchema,
  ),
  AcademicDepartmentControllers.updateAcademicDeartment,
);

router.get('/', AcademicDepartmentControllers.getAllAcademicDepartments);

export const AcademicDepartmentRoutes = router;
