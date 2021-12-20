import hyttpo from 'hyttpo';
import { ReactChild, ReactFragment, ReactPortal, useState } from 'react';
import useSWR from 'swr'

const fetcher = (url: string) => hyttpo.get(url).then((res) => res.data);

const ListUrls = ({ urls }: any) => {
  const { data, error } = useSWR(`http://localhost:3000/api/v1/urls`, fetcher)

  return (
    <div>
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
              <tr>
                <td><a href={url as string}>{url}</a></td>
                <td>
                  <button className="button is-small is-danger is-light">DELETE</button>
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