import Utils from 'hyttpo/dist/js/util/utils'
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";
import hyttpo from 'hyttpo';

const removeSlashFromUrl = (str: string) => {
    return str.replace(/^\/+|\/+$/g, '');
};

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await getSession({ req });
    const body = Utils.isJSON(req.body) ? JSON.parse(req.body) : null;

    if (!session) {
        res.status(403).json({
            message: 'You must log in before adding the url.',
        })

        return;
    }

    if (!body) {
        res.status(400).json({
            message: 'Invalid body'
        })

        return;
    }

    if (!/(https?:\/\/[^ ]*)/.test(body.url)) {
        res.status(400).json({
            message: 'Bad url'
        })

        return;
    }

    if (!(await hyttpo.get(body.url)).data.includes('uptimo-pinging')) {
        res.status(400).json({
            message: 'Please add <!-- uptimo-pinging --> to your site.'
        })
        
        return;
    }

    const collection = (await clientPromise).db('Uptimo').collection('users');
    const account = await (await collection.findOne({ _id: new ObjectId(session?.user.id) }));

    if (account?.urls?.includes(removeSlashFromUrl(body.url))) {
        res.status(400).json({
            message: 'The URL is already in the array.'
        })

        return;
    }

    await collection.updateOne({ _id: new ObjectId(session?.user.id) }, {
        $push: {
            urls: body.url
        }
    });

    res.status(200).json({
        message: 'URL has been added!'
    })

    res.end()
}

export default handler;