import { Types } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';

export const generateJwtPayload = (user: UserDocument, sessionId: string) => ({
  sub: (user._id as Types.ObjectId).toString(),
  sessionId,
  email: user.email,
  roles: user.roles,
});
