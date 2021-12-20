import type { NextPage } from 'next'
import Header from '../components/header';
import styles from '../styles/Home.module.css';
import Form from '../components/form';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
        <Header/>

        <main>
            <h1 className='title'>Uptimo</h1>
            <p className='subtitle'>
                Get your url pinged every 3 minutes!
            </p>

            <Form />
        </main>
    </div>
  )
}

export default Home
