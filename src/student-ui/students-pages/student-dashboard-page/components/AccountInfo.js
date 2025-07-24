
import React from 'react';

function formatDate(date) {
  if (!date) return "-";
  try {
    if (typeof date === "string") return new Date(date).toLocaleString();
    if (date.seconds) return new Date(date.seconds * 1000).toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    return String(date);
  } catch {
    return String(date);
  }
}

const AccountInfo = ({ user }) => {
  return (
    <section className="student-dashboard-profile-card">
      <h3>Account Info</h3>
      <ul className="student-dashboard-account-list">
        <li>
          Member since: <strong>{formatDate(user.createdAt)}</strong>
        </li>
        <li>
          Last login: <strong>{formatDate(user.lastLogin)}</strong>
        </li>
        <li>
          Last study: <strong>{formatDate(user.lastStudyDate)}</strong>
        </li>
        <li>
          Last active course: <strong>{user.lastActiveCourse || '-'}</strong>
        </li>
      </ul>
    </section>
  );
};

export default AccountInfo;
