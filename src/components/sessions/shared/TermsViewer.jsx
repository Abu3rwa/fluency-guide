import React from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Divider 
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * TermsViewer Component
 * Displays terms content with proper formatting and metadata
 * 
 * @param {Object} props
 * @param {string} props.content - Terms content to display
 * @param {boolean} props.isDefault - Whether this is default content
 * @param {Date|Object} props.lastModified - Last modification date
 * @returns {JSX.Element}
 */
const TermsViewer = ({ content, isDefault, lastModified }) => {
  const { t, i18n } = useTranslation();
  
  const formatDate = (date) => {
    if (!date) return null;
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString(i18n.language === 'ar' ? 'ar' : 'en');
  };

  return (
    <Box>
      {/* Content metadata */}
      {(isDefault || lastModified) && (
        <Box sx={{ mb: 2 }}>
          {isDefault && (
            <Chip 
              label="Default Content" 
              size="small" 
              color="info" 
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {lastModified && (
            <Typography variant="caption" color="textSecondary">
              {t('common.lastUpdated', 'Last updated')}: {formatDate(lastModified)}
            </Typography>
          )}
          <Divider sx={{ mt: 1 }} />
        </Box>
      )}

      {/* Terms content */}
      <Box
        sx={{
          '& h1': {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            mt: 3,
            mb: 2,
            color: 'primary.main',
            '&:first-of-type': {
              mt: 0
            }
          },
          '& h2': {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            mt: 2.5,
            mb: 1.5,
            color: 'text.primary'
          },
          '& h3': {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            mt: 2,
            mb: 1,
            color: 'text.primary'
          },
          '& p': {
            mb: 1.5,
            lineHeight: 1.6
          },
          '& ul, & ol': {
            pl: 3,
            mb: 1.5
          },
          '& li': {
            mb: 0.5
          },
          '& strong': {
            fontWeight: 'bold'
          },
          '& em': {
            fontStyle: 'italic'
          },
          '& code': {
            backgroundColor: 'grey.100',
            padding: '0.1em 0.3em',
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.875em'
          },
          '& blockquote': {
            borderLeft: 3,
            borderColor: 'primary.main',
            pl: 2,
            ml: 0,
            fontStyle: 'italic',
            backgroundColor: 'grey.50',
            py: 1
          },
          // RTL support
          direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
          textAlign: i18n.language === 'ar' ? 'right' : 'left'
        }}
      >
        {/* Parse and render markdown-like content */}
        <MarkdownRenderer content={content} />
      </Box>
    </Box>
  );
};

/**
 * Simple markdown-like renderer
 * Converts basic markdown syntax to JSX elements
 */
const MarkdownRenderer = ({ content }) => {
  if (!content) {
    return (
      <Typography color="textSecondary" style={{ fontStyle: 'italic' }}>
        No content available
      </Typography>
    );
  }

  // Split content into lines and process
  const lines = content.split('\n');
  const elements = [];
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <Typography key={elements.length} component="p">
            {text}
          </Typography>
        );
      }
      currentParagraph = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Empty line - flush current paragraph
    if (!trimmedLine) {
      flushParagraph();
      return;
    }

    // Headers
    if (trimmedLine.startsWith('# ')) {
      flushParagraph();
      elements.push(
        <Typography key={elements.length} variant="h1" component="h1">
          {trimmedLine.substring(2)}
        </Typography>
      );
    } else if (trimmedLine.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <Typography key={elements.length} variant="h2" component="h2">
          {trimmedLine.substring(3)}
        </Typography>
      );
    } else if (trimmedLine.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <Typography key={elements.length} variant="h3" component="h3">
          {trimmedLine.substring(4)}
        </Typography>
      );
    } 
    // List items
    else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      elements.push(
        <Box key={elements.length} component="ul" sx={{ pl: 2 }}>
          <li>{trimmedLine.substring(2)}</li>
        </Box>
      );
    }
    // Regular text
    else {
      currentParagraph.push(trimmedLine);
    }
  });

  // Flush any remaining paragraph
  flushParagraph();

  return <>{elements}</>;
};

export default TermsViewer;