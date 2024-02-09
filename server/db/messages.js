import { Message } from '../models/message.js';

export async function getUser(username) {
  return await Users.find({ username }).lean().exec();
}


export const getMessages = async () => {
  try {
    const data =  await Message.find().sort({'createdAt': 1}).lean().exec();
    return data;
  } catch (e) {
    console.log(e)
  }

}

export const createMessage = async (user,text) => {
  try {
    const message = {
      user: user[0].username,
      text
    };
    let createdMessage = await Message.create(message);
    // See message.js in /models for how we customized 'toJSON' to clean up returned data
    return createdMessage.toJSON();
  } catch(e) {
    console.log(e)
  }
}
