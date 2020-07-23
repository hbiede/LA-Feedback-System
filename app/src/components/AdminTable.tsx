import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { InteractionRecord, RatingRecord } from '../types';

import Services from '../services/backgroundService';

type Props = {
  style?: CSSProperties;
  username: string;
};

type LA = {
  username: string;
  name?: string;
};

export default function AdminTable(props: Props) {
  const [interactions, setInteractions] = useState<InteractionRecord[]>([]);
  const [selectedLA, setSelectedLA] = useState<LA|null>(null);
  const [ratings, setRatings] = useState<RatingRecord[]>([]);

  const { username, style } = props;

  useEffect(() => {
    Services.getInteractions(username).then((ints) => setInteractions(ints));
    // No Deps == componentDidMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showLA = useCallback((la: LA) => {
    setSelectedLA(la);
    Services.getRatings(username, la.username).then((newRatings) => setRatings(newRatings));
  }, [setSelectedLA, username, setRatings]);

  const clearSelection = useCallback(() => {
    setSelectedLA(null);
    setRatings([]);
  }, [setSelectedLA, setRatings]);

  if (selectedLA === null) {
    return (
      <div style={style} className="col-md-10">
        <table className="table table-hover" style={{ width: '100%' }}>
          <thead className="thead-dark">
            <tr>
              <th>LA</th>
              <th>Interactions</th>
              <th>Average Rating</th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((row) => (
              row.username && row.username.trim().length > 0 && !Number.isNaN(row.count) && (
              <tr onClick={() => showLA(row)}>
                <td>{row.name ? row.name : row.username}</td>
                <td>{row.count}</td>
                <td>{Number.isNaN(row.avg) ? 0 : row.avg}</td>
              </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const avg = ratings.length === 0
    ? 0
    : ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
  return (
    <div style={style} className="col-md-10">
      <h6>
        <button className="btn btn-dark" type="button" onClick={clearSelection}>(&lt;Back)</button>
        {` ${selectedLA.name ? selectedLA.name : selectedLA.username}`}
      </h6>
      <table className="table table-hover" style={{ width: '100%' }}>
        <thead className="thead-dark">
          <tr>
            <th>
              Rating (Avg:
              {` ${avg}`}
              )
            </th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {ratings.map((row) => (
            <tr>
              <td>{row.rating}</td>
              <td>{row.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
