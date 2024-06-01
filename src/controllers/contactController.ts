import { NextFunction, Request, Response } from 'express';
import { identifyContact } from '../services/contactService';

export const identify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phoneNumber } = req.body;

        if (!email && !phoneNumber) {
            return res.status(400).json({ message: 'email or phoneNumber is required' });
        }

        const result = await identifyContact(email, phoneNumber);
        res.status(200).json(result);
    }
    catch (err) {
        next(err)
    }
};
