import config from '../config';
import { USER_ROLE } from '../modules/user/user.constants';
import { User } from '../modules/user/user.model';

const superUser = {
  id: 'sifat706',
  email: 'sayedhossainshifat706@gmail.com',
  password: config.super_admin_password,
  needsPasswordChange: false,
  role: USER_ROLE.superAdmin,
  status: 'in-progress',
  isDeleted: false,
};

const seedSuperAdmin = async () => {
  // when database is connected , we will check is there any user who is super admin

  const isSuperAdminExist = await User.findOne({ role: USER_ROLE.superAdmin });
  if (!isSuperAdminExist) {
    await User.create(superUser);
  }
};

export default seedSuperAdmin;
