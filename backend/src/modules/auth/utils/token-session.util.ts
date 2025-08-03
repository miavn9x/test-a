import { Types } from 'mongoose';
import { JwtService } from '../../../common/jwt/services/jwt.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuthSessionDocument } from '../schemas/auth.schema';
import { generateSessionId } from './generate-session-id';

interface CreateTokenSessionParams {
  user: UserDocument;
  jwtService: JwtService;
  authSessionModel: {
    create: (input: Partial<AuthSessionDocument>) => Promise<AuthSessionDocument>;
  };
}

export async function createTokenAndSession({
  user,
  jwtService,
  authSessionModel,
}: CreateTokenSessionParams) {
  const sessionId = generateSessionId();

  const payload = {
    sub: (user._id as Types.ObjectId).toString(),
    sessionId,
    email: user.email,
    roles: user.roles,
  };

  const { accessToken, refreshToken } = jwtService.signTokens(payload);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + jwtService.getRefreshExpiresInMs());

  await authSessionModel.create({
    sessionId,
    email: user.email,
    userId: user._id as Types.ObjectId,
    refreshToken,
    loginAt: now,
    lastRefreshedAt: now,
    expiresAt,
  });

  return { accessToken, refreshToken, sessionId };
}
