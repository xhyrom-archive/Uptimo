import type { NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Header from '../components/header';
import styles from '../styles/Home.module.css';
import ListUrls from '../components/listurls';
import hyttpo from 'hyttpo';

export async function getServerSideProps(context: any) {
    const session = await getSession(context)
  
    if (!session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }
  
    return {
      props: { session }
    }
}

const List: NextPage = () => {
    return (
        <div className={styles.container}>
            <Header/>

            <main>
                <h1 className='title'>List of your URLs</h1>

                <ListUrls />
            </main>
        </div>
    )
}

export default List
