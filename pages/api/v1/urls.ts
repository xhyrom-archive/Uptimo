import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });

    if (!session) {
        res.status(403).json({
            message: 'You must log in before getting the urls.',
        })

        return;
    }

    const collection = (await clientPromise).db('Uptimo').collection('users');
    const account = await (await collection.findOne({ _id: new ObjectId(session?.user.id) }));

    res.status(200).json({
        message: account?.urls
    })

    res.end();
}

export default handler;