import React from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Rating,
  Chip,
  Button
} from '@mui/material';

const InstructorPerformance = ({ performance }) => {
  if (!performance || performance.length === 0) return null;

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Instructor</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Scheduled</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Cancelled</TableCell>
              <TableCell align="right">Total Earnings</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {performance.map((instructor) => (
              <TableRow key={instructor.instructorId}>
                <TableCell component="th" scope="row">
                  {instructor.displayName}
                </TableCell>
                <TableCell align="center">
                  <Rating 
                    value={instructor.averageRating} 
                    readOnly 
                    precision={0.1} 
                    size="small" 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {instructor.averageRating.toFixed(1)} ({instructor.sessions.completed + instructor.sessions.cancelled} reviews)
                  </Typography>
                </TableCell>
                <TableCell align="center">{instructor.sessions.scheduled}</TableCell>
                <TableCell align="center">{instructor.sessions.completed}</TableCell>
                <TableCell align="center">{instructor.sessions.cancelled}</TableCell>
                <TableCell align="right">
                  {instructor.totalEarnings?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </TableCell>
                <TableCell align="right">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="primary"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InstructorPerformance;