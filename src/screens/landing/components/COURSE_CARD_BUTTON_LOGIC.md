do this Course Card Button Logic

This document explains how to display the correct action button on a course card based on the user's authentication and enrollment status.

## 1. Requirements

- **If the user is not logged in:**

  - Show a button: **"Login or Sign Up"**
  - Action: Open login/signup page/modal

- **If the user is logged in and is a student, but NOT enrolled in the course:**

  - Show a button: **"Enroll"**
  - Action: Go to the course enrollment page

- **If the user is logged in, is a student, and IS enrolled in the course:**
  - Show a button: **"Start Learning"**
  - Action: Go to the course learning page (e.g., `/courses/{courseId}`)

## 2. Implementation Steps

### a. Get User and Enrollment State

- Use your `useUser` hook to get the current user and their student status.
- Use your enrollment service to check if the user is enrolled in the course.

```js
const { userData: user, isStudent } = useUser();
const [enrolled, setEnrolled] = useState(false);
const [checking, setChecking] = useState(false);

useEffect(() => {
  let mounted = true;
  const checkEnrollment = async () => {
    if (user && isStudent) {
      setChecking(true);
      try {
        const userId = user.uid || user.id;
        const enrollments = await enrollmentService.getEnrollmentsByStudent(
          userId
        );
        if (!mounted) return;
        setEnrolled(
          enrollments.some(
            (e) => e.courseId === course.id && e.status === "active"
          )
        );
      } catch (e) {
        if (mounted) setEnrolled(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }
  };
  checkEnrollment();
  return () => {
    mounted = false;
  };
}, [user, isStudent, course.id]);
```

### b. Render the Correct Button

```js
let actionButton;
if (!user) {
  actionButton = (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ mt: 2 }}
      onClick={onSignUp} // or open login/signup modal
    >
      Login or Sign Up
    </Button>
  );
} else if (isStudent && checking) {
  actionButton = (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
      <CircularProgress size={24} />
    </Box>
  );
} else if (isStudent && enrolled) {
  actionButton = (
    <Button
      variant="contained"
      color="success"
      fullWidth
      sx={{ mt: 2 }}
      href={`/courses/${course.id}`}
    >
      Start Learning
    </Button>
  );
} else if (isStudent && !enrolled) {
  actionButton = (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      sx={{ mt: 2 }}
      href={`/courses/${course.id}/enroll`}
    >
      Enroll
    </Button>
  );
}
```

### c. Place the Button in the Card

```js
<CardContent>
  {/* ...other content... */}
  {actionButton}
</CardContent>
```

## 3. Summary Table

| User State              | Button Label     | Action                     |
| ----------------------- | ---------------- | -------------------------- |
| Not logged in           | Login or Sign Up | Open login/signup          |
| Logged in, not enrolled | Enroll           | Go to enroll page          |
| Logged in, enrolled     | Start Learning   | Go to course learning page |

## 4. Notes

- Always show a loading spinner while checking enrollment.
- Use `user.uid` or `user.id` as appropriate for enrollment checks.
- You can further customize the button style or add analytics as needed.
