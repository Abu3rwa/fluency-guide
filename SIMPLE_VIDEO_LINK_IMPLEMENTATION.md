# Simple Video Conference Link Implementation

## Overview

This document shows how to implement simple video conference links in lessons that only approved students can access - no API integrations needed, just direct links.

## Implementation Steps

### 1. Update Lesson Schema

Add video conference fields to the existing lesson structure:

```javascript
// In src/services/lessonService.js - Update createLesson function
export const createLesson = async (lessonData) => {
  try {
    // ... existing validation ...

    const {
      // ... existing fields ...
      videoUrl = "",
      
      // NEW VIDEO CONFERENCE FIELDS
      liveSession = {
        enabled: false,
        meetingLink: "",
        meetingPassword: "",
        platform: "google_meet", // "google_meet", "zoom", "other"
        scheduledTime: null,
        duration: 60, // minutes
        instructions: "",
        recordingUrl: "",
        accessibleAfterApproval: true
      }
    } = lessonData;

    const lessonRef = await addDoc(collection(db, "lessons"), {
      // ... existing fields ...
      videoUrl,
      liveSession, // Add this new field
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: lessonRef.id, ...lessonData };
  } catch (error) {
    throw new Error(`Failed to create lesson: ${error.message}`);
  }
};
```

### 2. Update Lesson Form (Admin)

Add video conference fields to the existing lesson creation form:

```javascript
// In src/components/lesson-form/LessonMediaStep.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider
} from '@mui/material';

const LessonMediaStep = ({ formData, onChange, errors }) => {
  const handleLiveSessionChange = (field, value) => {
    onChange('liveSession', {
      ...formData.liveSession,
      [field]: value
    });
  };

  return (
    <Box>
      {/* Existing video URL field */}
      <TextField
        fullWidth
        label="Lesson Video URL"
        value={formData.videoUrl || ''}
        onChange={(e) => onChange('videoUrl', e.target.value)}
        sx={{ mb: 3 }}
      />

      <Divider sx={{ my: 3 }} />

      {/* NEW LIVE SESSION SECTION */}
      <Typography variant="h6" gutterBottom>
        Live Video Conference (Optional)
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={formData.liveSession?.enabled || false}
            onChange={(e) => handleLiveSessionChange('enabled', e.target.checked)}
          />
        }
        label="Enable Live Session for this lesson"
        sx={{ mb: 2 }}
      />

      {formData.liveSession?.enabled && (
        <Box>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Platform</InputLabel>
            <Select
              value={formData.liveSession?.platform || 'google_meet'}
              onChange={(e) => handleLiveSessionChange('platform', e.target.value)}
            >
              <MenuItem value="google_meet">Google Meet</MenuItem>
              <MenuItem value="zoom">Zoom</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Meeting Link"
            value={formData.liveSession?.meetingLink || ''}
            onChange={(e) => handleLiveSessionChange('meetingLink', e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Meeting Password (Optional)"
            value={formData.liveSession?.meetingPassword || ''}
            onChange={(e) => handleLiveSessionChange('meetingPassword', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Scheduled Date & Time"
            type="datetime-local"
            value={formData.liveSession?.scheduledTime || ''}
            onChange={(e) => handleLiveSessionChange('scheduledTime', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={formData.liveSession?.duration || 60}
            onChange={(e) => handleLiveSessionChange('duration', parseInt(e.target.value))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Instructions for Students"
            value={formData.liveSession?.instructions || ''}
            onChange={(e) => handleLiveSessionChange('instructions', e.target.value)}
            placeholder="Please join 5 minutes early. Ensure your camera and microphone are working..."
            sx={{ mb: 2 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default LessonMediaStep;
```

### 3. Student Lesson Display with Access Control

Update the student lesson component to show video links only to approved students:

```javascript
// In src/student-ui/students-pages/student-lesson-details-page/StudentLessonDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { enrollmentService } from '../../../services/enrollmentService';

const StudentLessonDetailsPage = ({ lesson, courseId }) => {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && courseId) {
        try {
          const enrollmentData = await enrollmentService.getEnrollmentByStudentAndCourse(
            user.uid, 
            courseId
          );
          setEnrollment(enrollmentData);
        } catch (error) {
          console.error('Error checking enrollment:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkEnrollment();
  }, [user, courseId]);

  // Check if user can access live session
  const canAccessLiveSession = 
    enrollment?.status === 'approved' && 
    lesson?.liveSession?.enabled;

  const isSessionScheduled = lesson?.liveSession?.scheduledTime;
  const sessionTime = isSessionScheduled ? new Date(lesson.liveSession.scheduledTime) : null;
  const isSessionSoon = sessionTime && (sessionTime - new Date()) < (15 * 60 * 1000); // 15 minutes

  const handleJoinMeeting = () => {
    if (lesson?.liveSession?.meetingLink) {
      window.open(lesson.liveSession.meetingLink, '_blank');
      
      // Track access (simple analytics)
      console.log('Student accessed video link:', {
        lessonId: lesson.id,
        userId: user.uid,
        timestamp: new Date()
      });
    }
  };

  return (
    <Box>
      {/* Existing lesson content */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {lesson.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {lesson.description}
          </Typography>
          {/* ... other lesson content ... */}
        </CardContent>
      </Card>

      {/* LIVE SESSION SECTION */}
      {lesson?.liveSession?.enabled && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <VideoCallIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Live Video Session
              </Typography>
            </Box>

            {canAccessLiveSession ? (
              <>
                {sessionTime && (
                  <Box display="flex" alignItems="center" mb={2}>
                    <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Scheduled: {sessionTime.toLocaleString()}
                    </Typography>
                    {isSessionSoon && (
                      <Chip 
                        label="Starting Soon!" 
                        color="warning" 
                        size="small" 
                        sx={{ ml: 2 }} 
                      />
                    )}
                  </Box>
                )}

                {lesson.liveSession.instructions && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {lesson.liveSession.instructions}
                    </Typography>
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<VideoCallIcon />}
                  onClick={handleJoinMeeting}
                  disabled={!lesson.liveSession.meetingLink}
                  sx={{ mr: 2 }}
                >
                  Join Live Session
                </Button>

                {lesson.liveSession.meetingPassword && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Meeting Password: <strong>{lesson.liveSession.meetingPassword}</strong>
                  </Typography>
                )}

                {lesson.liveSession.recordingUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Session Recording
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => window.open(lesson.liveSession.recordingUrl, '_blank')}
                    >
                      Watch Recording
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="warning" icon={<LockIcon />}>
                <Typography variant="body2">
                  {enrollment?.status === 'pending' 
                    ? 'Your enrollment is pending approval. You will gain access to live sessions once approved.'
                    : enrollment?.status === 'rejected'
                    ? 'Your enrollment was not approved. Please contact support if you believe this is an error.'
                    : 'You need to enroll and get approved to access live video sessions.'
                  }
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StudentLessonDetailsPage;
```

### 4. Simple Admin Interface for Managing Video Links

Add a simple section to the existing course management to handle video links:

```javascript
// In src/components/course/CourseLessonsTab.jsx - Add video link management
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const VideoLinkDialog = ({ open, onClose, lesson, onSave }) => {
  const [videoData, setVideoData] = useState({
    enabled: lesson?.liveSession?.enabled || false,
    meetingLink: lesson?.liveSession?.meetingLink || '',
    meetingPassword: lesson?.liveSession?.meetingPassword || '',
    scheduledTime: lesson?.liveSession?.scheduledTime || '',
    instructions: lesson?.liveSession?.instructions || ''
  });

  const handleSave = () => {
    onSave(lesson.id, videoData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Live Session - {lesson?.title}</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Switch
              checked={videoData.enabled}
              onChange={(e) => setVideoData({ ...videoData, enabled: e.target.checked })}
            />
          }
          label="Enable Live Session"
          sx={{ mb: 2 }}
        />

        {videoData.enabled && (
          <Box>
            <TextField
              fullWidth
              label="Meeting Link"
              value={videoData.meetingLink}
              onChange={(e) => setVideoData({ ...videoData, meetingLink: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Meeting Password"
              value={videoData.meetingPassword}
              onChange={(e) => setVideoData({ ...videoData, meetingPassword: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Scheduled Time"
              type="datetime-local"
              value={videoData.scheduledTime}
              onChange={(e) => setVideoData({ ...videoData, scheduledTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Instructions"
              value={videoData.instructions}
              onChange={(e) => setVideoData({ ...videoData, instructions: e.target.value })}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const CourseLessonsTab = ({ lessons, onUpdateLesson }) => {
  const [videoDialog, setVideoDialog] = useState({ open: false, lesson: null });

  const handleSaveVideoLink = async (lessonId, videoData) => {
    try {
      // Update lesson with video link data
      await onUpdateLesson(lessonId, {
        liveSession: videoData
      });
    } catch (error) {
      console.error('Error updating video link:', error);
    }
  };

  return (
    <Box>
      <List>
        {lessons.map((lesson) => (
          <ListItem key={lesson.id}>
            <ListItemText
              primary={lesson.title}
              secondary={
                <Box>
                  {lesson.description}
                  {lesson.liveSession?.enabled && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        icon={<VideoCallIcon />}
                        label="Live Session Enabled"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {lesson.liveSession.scheduledTime && (
                        <Chip
                          icon={<ScheduleIcon />}
                          label={new Date(lesson.liveSession.scheduledTime).toLocaleDateString()}
                          color="secondary"
                          size="small"
                        />
                      )}
                    </Box>
                  )}
                </Box>
              }
            />
            <IconButton
              onClick={() => setVideoDialog({ open: true, lesson })}
              title="Manage Video Link"
            >
              <VideoCallIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <VideoLinkDialog
        open={videoDialog.open}
        onClose={() => setVideoDialog({ open: false, lesson: null })}
        lesson={videoDialog.lesson}
        onSave={handleSaveVideoLink}
      />
    </Box>
  );
};

export default CourseLessonsTab;
```

## Summary

This simple implementation:

1. **Adds video conference fields to lessons** - No complex API integrations
2. **Provides admin interface** - Simple forms to add meeting links
3. **Controls student access** - Only approved students see video links
4. **Works with existing system** - Uses current enrollment approval workflow
5. **Tracks basic analytics** - Simple logging of video access

**Benefits:**
- ✅ No external API dependencies
- ✅ Works with existing enrollment system
- ✅ Simple to implement and maintain
- ✅ Flexible for any video platform (Google Meet, Zoom, etc.)
- ✅ Secure access control based on approval status

**Next Steps:**
1. Update lesson creation forms to include video fields
2. Modify student lesson display with access control
3. Add simple admin interface for managing video links
4. Test with approved vs non-approved students