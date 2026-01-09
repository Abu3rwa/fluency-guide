import { styled } from '@mui/material/styles';
import { Button, Card, TextField, Box } from '@mui/material';
import designConfig from '../../desgin.json';

const btn = designConfig.components.button;
const card = designConfig.components.card;
const input = designConfig.components.input;

export const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: btn.primary.backgroundColor,
  color: btn.primary.color,
  borderRadius: btn.primary.borderRadius,
  padding: btn.primary.padding,
  fontSize: btn.primary.fontSize,
  fontWeight: btn.primary.fontWeight,
  border: btn.primary.border,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: btn.primary.hover.backgroundColor,
    color: btn.primary.hover.color,
    border: btn.primary.border,
  },
  '&:disabled': {
    backgroundColor: theme.palette.text.disabled,
    color: theme.palette.text.secondary,
    border: `2px solid ${theme.palette.text.disabled}`,
  },
}));

export const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: btn.secondary.backgroundColor,
  color: btn.secondary.color,
  borderRadius: btn.secondary.borderRadius,
  padding: btn.secondary.padding,
  fontSize: btn.secondary.fontSize,
  fontWeight: btn.secondary.fontWeight,
  border: btn.secondary.border,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: btn.secondary.hover.backgroundColor,
    color: btn.secondary.hover.color,
    border: btn.secondary.border,
  },
  '&:disabled': {
    backgroundColor: 'transparent',
    color: theme.palette.text.disabled,
    border: `2px solid ${theme.palette.text.disabled}`,
  },
}));

export const StyledCard = styled(Card)(() => ({
  backgroundColor: card.backgroundColor,
  borderRadius: card.borderRadius,
  padding: card.padding,
  boxShadow: card.boxShadow,
  textAlign: card.textAlign,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: input.backgroundColor,
    borderRadius: input.borderRadius,
    color: input.color,
    '& fieldset': {
      borderColor: '#5a5a5a',
    },
    '&:hover fieldset': {
      borderColor: '#5a5a5a',
    },
    '&.Mui-focused fieldset': {
      borderColor: input.focus.borderColor,
      boxShadow: input.focus.boxShadow,
    },
  },
  '& .MuiInputBase-input': {
    padding: input.padding,
    color: input.color,
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: input.focus.borderColor,
    },
  },
}));

export const Container = styled(Box)(() => ({
  maxWidth: designConfig.layout.container.maxWidth,
  padding: designConfig.layout.container.padding,
  margin: '0 auto',
  width: '100%',
}));

export const StyledLink = styled('a')(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.accent.main,
  },
  '&:visited': {
    color: theme.palette.text.primary,
  },
}));

