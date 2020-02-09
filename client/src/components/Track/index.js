import React from 'react';
import cl from 'classnames';
import s from './index.module.css';

class Track extends React.Component {
  render() {
    const { className, track } = this.props;

    return (
      <div className={cl(s.root, className)}>
        <div className={s.cover}>
          <img alt="album" src={track.full_album.images[0].url} />
        </div>
        <div className={s.texts}>
          <div className={s.title}>
            {track.name}
          </div>
          <div className={s.author}>
            {track.full_artist[0].name}
          </div>
        </div>
      </div>
    );
  }
}

export default Track;
