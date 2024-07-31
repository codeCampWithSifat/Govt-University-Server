import mongoose from 'mongoose';
import { Student } from './student.model';
import AppError from '../../Errors/ApiErrors';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';

// const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
//   // HOW OUR FORMAT SHOULD BE FOR PARTIAL MATCH  :
//   //  { email: { $regex : query.searchTerm , $options: i}}
//   //  { presentAddress: { $regex : query.searchTerm , $options: i}}
//   //  { 'name.firstName': { $regex : query.searchTerm , $options: i}}
//   const queryObj = { ...query };
//   const studentSearchableFields = ['email', 'gender'];
//   let searchTerm = '';
//   if (query?.searchTerm) {
//     searchTerm = query?.searchTerm as string;
//   }

//   const searchQuery = Student.find({
//     $or: studentSearchableFields.map((field) => ({
//       [field]: { $regex: searchTerm, $options: 'i' },
//     })),
//   });

//   // Filtering
//   const excludesFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
//   excludesFields.forEach((el) => delete queryObj[el]);

//   // console.log({ query: query }, { queryObj: queryObj });

//   const filterQuery = searchQuery
//     .find(queryObj)
//     .populate('admissionSemester')
//     .populate({
//       path: 'academicDepartment',
//       populate: {
//         path: 'academicFaculty',
//       },
//     });

//   let sort = '-createdAt';
//   if (query?.sort) {
//     sort = query?.sort as string;
//   }

//   const sortQuery = filterQuery.sort(sort);

//   let page = 1;
//   let limit = 1;
//   let skip = 0;

//   if (query?.limit) {
//     limit = Number(query.limit);
//   }

//   if (query?.page) {
//     page = Number(query?.page);
//     skip = (page - 1) * limit;
//   }

//   const paginateQuery = sortQuery.skip(skip);

//   const limitQuery = paginateQuery.limit(limit);

//   // Field Limiting

//   let fields = '__v';

//   // fields:"name,email"
//   // fields:"name email"

//   if (query?.fields) {
//     fields = (query?.fields as string).split(',').join(' ');
//     // console.log(fields);
//   }

//   const fieldQuery = await limitQuery.select(fields);

//   return fieldQuery;
// };

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
  const queryObj = { ...query };

  let searchTerm = '';
  const studentSearchableFields = ['email', 'gender', 'name.firstName'];

  if (query?.searchTerm) {
    searchTerm = query?.searchTerm as string;
  }

  const searchQuery = Student.find({
    $or: studentSearchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    })),
  });

  // Filtering
  const excludesFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];

  excludesFields.forEach((el) => delete queryObj[el]);
  // console.log('Query', query, 'Query Obj', queryObj);

  const filterQuery = searchQuery
    .find(queryObj)
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });

  let sort = 'createdAt';

  if (query?.sort) {
    sort = query?.sort as string;
  }

  const sortQuery = filterQuery.sort(sort);

  let limit = 1;
  let page = 1;
  let skip = 0;

  if (query?.page) {
    page = query?.page as number;
    skip = (page - 1) * limit;
  }
  if (query?.limit) {
    limit = query?.limit as number;
  }
  const paginateQuery = sortQuery.skip(skip);
  const limitQuery = paginateQuery.limit(limit);

  // Field Limiting
  let fields = '-__v';
  // fields : "name, email"
  if (query?.fields) {
    fields = (query?.fields as string).split(',').join(' ');
  }

  const fieldQuery = await limitQuery.select(fields);

  return fieldQuery;
};

// const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
//   const studentQuery = new QueryBuilder(
//     Student.find()
//       .populate('admissionSemester')
//       .populate({
//         path: 'academicDepartment',
//         populate: {
//           path: 'academicFaculty',
//         },
//       }),
//     query,
//   )
//     .search(studentSearchableFields)
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const result = await studentQuery.modelQuery;
//   return result;
// };

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findOne({ id })
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const deletedStudent = await Student.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Student Deleted Failed');
    }

    const deletedUser = await User.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User Deleted Failed');
    }

    await session.commitTransaction();
    await session.endSession();
    return deletedStudent;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error('Failed To Delete Student');
  }
};

const updateStudentFromDB = async (id: string, payload: Partial<TStudent>) => {
  /*
    guardain: {
      fatherOccupation:"Teacher"
    }

    guardian.fatherOccupation = Teacher

    name.firstName = 'Mezba'
    name.lastName = 'Abedin'
  */

  const { name, guardian, localGuardian, ...remainingStudentData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdatedData[`guardian.${key}`] = value;
    }
  }

  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdatedData[`localGuardian.${key}`] = value;
    }
  }

  const result = await Student.findOneAndUpdate({ id }, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const StudentServices = {
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  deleteStudentFromDB,
  updateStudentFromDB,
};
