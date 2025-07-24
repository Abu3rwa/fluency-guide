
import React from 'react';

const UserAvatar = ({ avatar, displayName }) => {
  return (
    <img
      src={avatar}
      alt={displayName}
      className="student-dashboard-avatar"
    />
  );
};

export default UserAvatar;
