
import React from 'react';

const UserInfo = ({ user, preferences }) => {
  const displayName = user.displayName || user.name || user.email;
  const isAdmin = user.isAdmin;
  const isStudent = user.isStudent;
  const emailVerified = user.emailVerified;

  return (
    <div className="student-dashboard-profile-info">
      <h2>{displayName}</h2>
      <div className="student-dashboard-badges">
        {isAdmin && <span className="student-dashboard-badge admin">Admin</span>}
        {isStudent && <span className="student-dashboard-badge student">Student</span>}
        {emailVerified && <span className="student-dashboard-badge verified">Verified</span>}
      </div>
      <p className="student-dashboard-email">{user.email}</p>
      {user.bio && <p className="student-dashboard-bio">{user.bio}</p>}
      {user.phoneNumber && <p className="student-dashboard-phone">📞 {user.phoneNumber}</p>}
      <p className="student-dashboard-language">
        Language: <strong>{preferences.preferredLanguage || '-'}</strong>
      </p>
    </div>
  );
};

export default UserInfo;
