import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import { User } from './Types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not defined in .env');
}

export const authMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'] as string | undefined

    if(!authHeader){
        return res.status(403).json({ message: 'No Auth Token Provided'})
    }

    const parts = authHeader.split(' ')
    const tokenWithoutBearer = parts.length === 2 ? parts[1] : parts[0]

    jwt.verify(tokenWithoutBearer, JWT_SECRET! as string, (error: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if(error){
            return res.status(401).json({ message: 'Invalid or Expired Token'})
        }

        // decoded is safe to use here once you check it's an object
        if (decoded && typeof decoded === 'object') {
            req.user = decoded // `user` augmentation is declared in `src/types/express.d.ts`
        }
        next()
    })
}

export const verifyJwt = (token: string): {id: number, name: string} => {
    return jwt.verify(token, JWT_SECRET) as { id: number, name: string};
}

export const generateToken = (user: User) => {
    return jwt.sign({id: user.id, username: user.name}, JWT_SECRET! as string, { expiresIn: '1h' })
}

export default {
  authMiddleWare,
  generateToken
}