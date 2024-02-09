import { User } from '../models/user.js';

export const getUser = async (username) => {
  return await User.find({ username }).lean().exec();
}
