import clientPromise from "./mongodb";
import hyttpo from 'hyttpo';

export const ping = async() => {
    const collection = (await clientPromise).db('Uptimo').collection('users');
    const urls = (await (await collection.find()).toArray()).map((account: any) => account.urls).flat(1);

    for (const url of urls) {
        hyttpo.get(url).catch(e => e);
        continue;
    }

    setInterval(() => {
        ping();
    }, 180000);
}