import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Avatar,
  IconButton,
  Typography,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useUser } from '../contexts/UserContext';
import { storage } from '../firebase'; // Assuming firebase is configured for storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EditProfileModal = ({ open, onClose }) => {
  const { userData, updateProfile, loading, error } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || userData.name || '');
      setEmail(userData.email || '');
      setBio(userData.bio || '');
      setAvatarPreview(userData.profileImage || userData.photoURL || userData.avatarUrl || '');
    }
  }, [userData]);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let newPhotoURL = avatarPreview;

    if (avatarFile) {
      setUploading(true);
      try {
        const avatarRef = ref(storage, `avatars/${userData.uid}/${avatarFile.name}`);
        await uploadBytes(avatarRef, avatarFile);
        newPhotoURL = await getDownloadURL(avatarRef);
      } catch (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        // Handle upload error, maybe show a message to the user
      } finally {
        setUploading(false);
      }
    }

    await updateProfile({
      displayName,
      email,
      bio,
      photoURL: newPhotoURL,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar src={avatarPreview} sx={{ width: 100, height: 100, mb: 2 }} />
          <input
            accept="image/*"
            id="icon-button-file"
            type="file"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          <Typography variant="caption" color="textSecondary">
            Upload new avatar
          </Typography>
        </Box>
        <TextField
          autoFocus
          margin="dense"
          label="Display Name"
          type="text"
          fullWidth
          variant="outlined"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Bio"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" disabled={loading || uploading}>
          {(loading || uploading) ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
