/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../Errors/ApiErrors';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import { TEnrolledCourse } from './enrolledCourse.interface';
import { Student } from '../student/student.model';
import EnrolledCourse from './enrolledCourse.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import mongoose from 'mongoose';
import { Faculty } from '../Faculty/faculty.model';
import { calculateGradeAndPoints } from './enrolledCourse.utils';
import { Course } from '../Course/Course.model';

// const createEnrolledCourseIntoDB = async (
//   userId: string,
//   payload: TEnrolledCourse,
// ) => {
//   /**
//    * Step1: Check if the offered cousres is exists
//    * Step2: Check if the student is already enrolled
//    * Step3: Check if the max credits exceed
//    * Step4: Create an enrolled course
//    */

//   const { offeredCourse } = payload;

//   const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);

//   if (!isOfferedCourseExists) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found !');
//   }

//   if (isOfferedCourseExists.maxCapacity <= 0) {
//     throw new AppError(httpStatus.BAD_GATEWAY, 'Room is full !');
//   }

//   const student = await Student.findOne({ id: userId }, { _id: 1 });

//   if (!student) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
//   }
//   const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
//     semesterRegistration: isOfferedCourseExists?.semesterRegistration,
//     offeredCourse,
//     student: student._id,
//   });

//   if (isStudentAlreadyEnrolled) {
//     throw new AppError(httpStatus.CONFLICT, 'Student is already enrolled !');
//   }

//   // check total credits exceeds maxCredit
//   const course = await Course.findById(isOfferedCourseExists.course);
//   const currentCredit = course?.credits;

//   const semesterRegistration = await SemesterRegistration.findById(
//     isOfferedCourseExists.semesterRegistration,
//   ).select('maxCredit');

//   const maxCredit = semesterRegistration?.maxCredit;

//   const enrolledCourses = await EnrolledCourse.aggregate([
//     {
//       $match: {
//         semesterRegistration: isOfferedCourseExists.semesterRegistration,
//         student: student._id,
//       },
//     },
//     {
//       $lookup: {
//         from: 'courses',
//         localField: 'course',
//         foreignField: '_id',
//         as: 'enrolledCourseData',
//       },
//     },
//     {
//       $unwind: '$enrolledCourseData',
//     },
//     {
//       $group: {
//         _id: null,
//         totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         totalEnrolledCredits: 1,
//       },
//     },
//   ]);

//   //  total enrolled credits + new enrolled course credit > maxCredit
//   const totalCredits =
//     enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCredits : 0;

//   if (totalCredits && maxCredit && totalCredits + currentCredit > maxCredit) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'You have exceeded maximum number of credits !',
//     );
//   }

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const result = await EnrolledCourse.create(
//       [
//         {
//           semesterRegistration: isOfferedCourseExists.semesterRegistration,
//           academicSemester: isOfferedCourseExists.academicSemester,
//           academicFaculty: isOfferedCourseExists.academicFaculty,
//           academicDepartment: isOfferedCourseExists.academicDepartment,
//           offeredCourse: offeredCourse,
//           course: isOfferedCourseExists.course,
//           student: student._id,
//           faculty: isOfferedCourseExists.faculty,
//           isEnrolled: true,
//         },
//       ],
//       { session },
//     );

//     if (!result) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Failed to enroll in this cousre !',
//       );
//     }

//     const maxCapacity = isOfferedCourseExists.maxCapacity;
//     await OfferedCourse.findByIdAndUpdate(offeredCourse, {
//       maxCapacity: maxCapacity - 1,
//     });

//     await session.commitTransaction();
//     await session.endSession();

//     return result;
//   } catch (err: any) {
//     await session.abortTransaction();
//     await session.endSession();
//     throw new Error(err);
//   }
// };

const createEnrolledCourseIntoDB = async (
  userId: string,
  payload: TEnrolledCourse,
) => {
  /**
   * Step1: Check if the offered cousres is exists
   * Step2: Check if the student is already enrolled
   * Step3: Check if the max credits exceed
   * Step4: Create an enrolled course
   */

  const { offeredCourse } = payload;
  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  // console.log(offeredCourse);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered Course Not Found');
  }

  const course = await Course.findById(isOfferedCourseExists.course);
  const credits = course?.credits;

  if (isOfferedCourseExists.maxCapacity <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Room is Full... No Seat Available',
    );
  }

  const student = await Student.findOne({ id: userId }, { _id: 1 });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student Not Found');
  }

  const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
    semesterRegistration: isOfferedCourseExists?.semesterRegistration,
    offeredCourse,
    student: student._id,
  });

  if (isStudentAlreadyEnrolled) {
    throw new AppError(httpStatus.CONFLICT, 'You Already Enrolled The Course');
  }

  // check total credit exceed max credit
  const semesterRegistration = await SemesterRegistration.findById(
    isOfferedCourseExists.semesterRegistration,
  ).select('maxCredit');
  const maxCredits = semesterRegistration?.maxCredit;

  // total enrolled credits + new enrolled course credits
  const enrolledCourses = await EnrolledCourse.aggregate([
    {
      $match: {
        semesterRegistration: isOfferedCourseExists.semesterRegistration,
        student: student?._id,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'enrolledCourseData',
      },
    },
    {
      $unwind: '$enrolledCourseData',
    },
    {
      $group: {
        _id: null,
        totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
      },
    },
    {
      $project: {
        _id: 0,
        totalEnrolledCredits: 1,
      },
    },
  ]);

  const totalCredits =
    enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCredits : 0;

  if (totalCredits && maxCredits && totalCredits + credits > maxCredits) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You Have Exceeded Maximub Number Of Credits',
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await EnrolledCourse.create(
      [
        {
          semesterRegistration: isOfferedCourseExists.semesterRegistration,
          academicSemester: isOfferedCourseExists.academicSemester,
          academicFaculty: isOfferedCourseExists.academicFaculty,
          academicDepartment: isOfferedCourseExists.academicDepartment,
          offeredCourse,
          course: isOfferedCourseExists.course,
          student: student._id,
          faculty: isOfferedCourseExists.faculty,
          isEnrolled: true,
        },
      ],
      { session },
    );

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed To Enrolled In This Course Course... Try Again Later',
      );
    }

    const maxCapacity = isOfferedCourseExists.maxCapacity;
    await OfferedCourse.findByIdAndUpdate(offeredCourse, {
      maxCapacity: maxCapacity - 1,
    });

    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

// const updateEnrolledCourseMarksIntoDB = async (
//   facultyId: string,
//   payload: Partial<TEnrolledCourse>,
// ) => {
//   const { semesterRegistration, offeredCourse, student, courseMarks } = payload;

//   const isSemesterRegistrationExists =
//     await SemesterRegistration.findById(semesterRegistration);

//   if (!isSemesterRegistrationExists) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       'Semester registration not found !',
//     );
//   }

//   const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);

//   if (!isOfferedCourseExists) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found !');
//   }
//   const isStudentExists = await Student.findById(student);

//   if (!isStudentExists) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
//   }

//   const faculty = await Faculty.findOne({ id: facultyId }, { _id: 1 });

//   if (!faculty) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
//   }

//   const isCourseBelongToFaculty = await EnrolledCourse.findOne({
//     semesterRegistration,
//     offeredCourse,
//     student,
//     faculty: faculty._id,
//   });

//   if (!isCourseBelongToFaculty) {
//     throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden! !');
//   }

//   const modifiedData: Record<string, unknown> = {
//     ...courseMarks,
//   };

//   if (courseMarks?.finalTerm) {
//     const { classTest1, classTest2, midTerm, finalTerm } =
//       isCourseBelongToFaculty.courseMarks;

//     const totalMarks =
//       Math.ceil(classTest1 * 0.1) +
//       Math.ceil(midTerm * 0.3) +
//       Math.ceil(classTest2 * 0.1) +
//       Math.ceil(finalTerm * 0.5);

//     const result = calculateGradeAndPoints(totalMarks);

//     modifiedData.grade = result.grade;
//     modifiedData.gradePoints = result.gradePoints;
//     modifiedData.isCompleted = true;
//   }

//   if (courseMarks && Object.keys(courseMarks).length) {
//     for (const [key, value] of Object.entries(courseMarks)) {
//       modifiedData[`courseMarks.${key}`] = value;
//     }
//   }

//   const result = await EnrolledCourse.findByIdAndUpdate(
//     isCourseBelongToFaculty._id,
//     modifiedData,
//     {
//       new: true,
//     },
//   );

//   return result;
// };

const updateEnrolledCourseMarksIntoDB = async (
  facultyId: string,
  payload: Partial<TEnrolledCourse>,
) => {
  const { semesterRegistration, offeredCourse, student, courseMarks } = payload;

  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);

  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester registration not found !',
    );
  }

  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);

  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found !');
  }
  const isStudentExists = await Student.findById(student);

  if (!isStudentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const faculty = await Faculty.findOne({ id: facultyId }, { _id: 1 });

  if (!faculty) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found !');
  }

  const isCourseBelongToFaculty = await EnrolledCourse.findOne({
    semesterRegistration,
    offeredCourse,
    student,
    faculty: faculty._id,
  });

  if (!isCourseBelongToFaculty) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden! !');
  }

  const modifiedData: Record<string, unknown> = {
    ...courseMarks,
  };

  if (courseMarks?.finalTerm) {
    const { classTest1, classTest2, midTerm, finalTerm } =
      isCourseBelongToFaculty.courseMarks;

    const totalMarks =
      Math.ceil(classTest1 * 0.1) +
      Math.ceil(midTerm * 0.3) +
      Math.ceil(classTest2 * 0.1) +
      Math.ceil(finalTerm * 0.5);
    const result = calculateGradeAndPoints(totalMarks);

    modifiedData.grade = result.grade;
    modifiedData.gradePoints = result.gradePoints;
    modifiedData.isCompleted = true;
  }

  if (courseMarks && Object.keys(courseMarks).length) {
    for (const [key, value] of Object.entries(courseMarks)) {
      modifiedData[`courseMarks.${key}`] = value;
    }
  }

  const result = await EnrolledCourse.findByIdAndUpdate(
    isCourseBelongToFaculty._id,
    modifiedData,
    {
      new: true,
    },
  );

  return result;
};
export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
  updateEnrolledCourseMarksIntoDB,
};
