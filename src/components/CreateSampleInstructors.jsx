/**
 * Utility component to help create sample instructor users for testing
 * This component can be temporarily added to the admin dashboard to populate test data
 */
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import userService from '../services/userService';

const CreateSampleInstructors = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sampleInstructors = [
    {
      email: 'instructor1@sudanglish.com',
      displayName: 'Dr. Sarah Johnson',
      name: 'Dr. Sarah Johnson',
      isInstructor: true,
      isAdmin: false,
      isStudent: false,
      instructorProfile: {
        bio: 'Experienced instructor with 8+ years in exam preparation and academic subjects',
        qualifications: ['MA in Mathematics', 'Teaching Certified', 'Exam Prep Specialist'],
        hourlyRate: 45,
        currency: 'USD',
        subjects: ['Mathematics', 'Physics', 'English'],
        specialties: ['Advanced Mathematics', 'Exam Preparation', 'Academic Writing'],
        isActive: true
      }
    },
    {
      email: 'instructor2@sudanglish.com',
      displayName: 'Ahmed Al-Rashid',
      name: 'Ahmed Al-Rashid',
      isInstructor: true,
      isAdmin: false,
      isStudent: false,
      instructorProfile: {
        bio: 'Multi-subject tutor with expertise in science and language instruction',
        qualifications: ['BSc in Chemistry', 'Cambridge CELTA', 'Science Education Specialist'],
        hourlyRate: 35,
        currency: 'USD',
        subjects: ['Chemistry', 'Biology', 'English', 'Arabic'],
        specialties: ['Laboratory Skills', 'Scientific Writing', 'Language Conversation'],
        isActive: true
      }
    },
    {
      email: 'instructor3@sudanglish.com',
      displayName: 'Maria Rodriguez',
      name: 'Maria Rodriguez',
      isInstructor: true,
      isAdmin: false,
      isStudent: false,
      instructorProfile: {
        bio: 'Dedicated educator specializing in programming and computer science instruction',
        qualifications: ['MSc in Computer Science', 'Programming Instructor', 'Full Stack Developer'],
        hourlyRate: 40,
        currency: 'USD',
        subjects: ['Programming', 'Computer Science', 'Mathematics'],
        specialties: ['Web Development', 'Algorithms', 'Beginner Programming'],
        isActive: true
      }
    }
  ];

  const sampleStudents = [
    {
      email: 'student1@sudanglish.com',
      displayName: 'Omar Hassan',
      name: 'Omar Hassan',
      isInstructor: false,
      isAdmin: false,
      isStudent: true
    },
    {
      email: 'student2@sudanglish.com',
      displayName: 'Fatima Ali',
      name: 'Fatima Ali',
      isInstructor: false,
      isAdmin: false,
      isStudent: true
    },
    {
      email: 'admin@sudanglish.com',
      displayName: 'Admin User',
      name: 'Admin User',
      isInstructor: false,
      isAdmin: true,
      isStudent: false
    }
  ];

  const createSampleUsers = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Create a simple UID for each sample user (in real app, this would come from Firebase Auth)
      const allUsers = [...sampleInstructors, ...sampleStudents];
      
      for (let i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];
        const uid = `sample_user_${Date.now()}_${i}`;
        
        // Create the user document directly in Firestore
        await userService.createOrUpdateUser({
          uid,
          email: user.email,
          displayName: user.displayName,
          name: user.name,
          isInstructor: user.isInstructor,
          isAdmin: user.isAdmin,
          isStudent: user.isStudent,
          instructorProfile: user.instructorProfile,
          emailVerified: true,
          phoneNumber: '',
          bio: user.instructorProfile?.bio || '',
          preferences: {
            preferredLanguage: 'en'
          },
          progress: {
            currentStreak: 0,
            totalPoints: 0,
            completedCourses: 0,
            totalStudyTime: 0
          }
        });
      }

      setMessage(`Successfully created ${allUsers.length} sample users (${sampleInstructors.length} instructors, ${sampleStudents.length - 1} students, 1 admin)`);
    } catch (err) {
      console.error('Error creating sample users:', err);
      setError(`Error creating sample users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ m: 2, maxWidth: 600 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Development Helper: Create Sample Users
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will create sample instructor, student, and admin users for testing the instructor management functionality.
        </Typography>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Creating sample users...
            </Typography>
          </Box>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createSampleUsers}
            disabled={loading}
          >
            Create Sample Users
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: This is for development/testing only. Remove this component in production.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CreateSampleInstructors;