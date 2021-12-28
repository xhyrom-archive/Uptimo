import hyttpo from 'hyttpo';
import { ReactChild, ReactFragment, ReactPortal, useState } from 'react';
import useSWR from 'swr'

const fetcher = (url: string) => hyttpo.get(url).then((res) => res.data);

const ListUrls = ({ urls }: any) => {
  const { data, error } = useSWR(`http://localhost:3000/api/v1/urls`, fetcher);
  const [infoAlert, setInfoAlert]: any = useState({ nothing: true });

  const deleteUrl = async(url: string) => {
    const test = await hyttpo.request({
      method: 'DELETE',
      url: `${window.location.origin}/api/v1/delete`,
      body: JSON.stringify({
        url
      })
    }).catch(e => e);

    setInfoAlert({ message: `URL ${url} has been deleted!` })
  }

  return (
    <div>
        { !infoAlert.nothing ? <div className="notification is-primary is-light">
        { infoAlert.message }
        </div> : '' } 
      { data ? <>
        <table className="table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            { data.message.map((url: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined, index: number) => <>
              <tr key={`a${index}`}>
                <td key={`b${index}`}><a href={url as string} key={`d${index}`}>{url}</a></td>
                <td key={`c${index}`}>
                  <button className="button is-small is-danger is-light" onClick={() => deleteUrl(url as string)} key={`e${index}`}>DELETE</button>
                </td>
              </tr>
            </>) }
          </tbody>
        </table>
      </> : 'Loading...' }
    </div>
  )
}

export default ListUrls;