import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { 
  TajawalText, 
  CairoText, 
  AlexandriaText, 
  AmiriText, 
  NotoSerifText, 
  DMSerifText,
  FontSelector,
  FontPreview,
  useFont
} from '../common/ArabicFontProvider';

const ArabicFontExamples = () => {
  const { currentFont, fonts } = useFont();

  const examples = [
    {
      title: "Tajawal - Modern Arabic",
      component: TajawalText,
      text: "مرحبا بكم في منصة تعلم اللغة الإنجليزية",
      description: "Modern geometric sans-serif Arabic typeface"
    },
    {
      title: "Cairo - Contemporary",
      component: CairoText,
      text: "تعلم الإنجليزية بطريقة سهلة وممتعة",
      description: "Contemporary Arabic font with clean aesthetic"
    },
    {
      title: "Alexandria - Modern",
      component: AlexandriaText,
      text: "منصة تعليمية متطورة للطلاب",
      description: "Modern Arabic font with excellent readability"
    },
    {
      title: "Amiri - Classic",
      component: AmiriText,
      text: "الخط التقليدي الأنيق للقرآن الكريم",
      description: "Classic elegant font based on traditional Naskh calligraphy"
    },
    {
      title: "Noto Serif - Formal",
      component: NotoSerifText,
      text: "نص رسمي بخط serif أنيق",
      description: "Serif font with excellent Arabic support"
    },
    {
      title: "DM Serif - Elegant",
      component: DMSerifText,
      text: "خط أنيق للمحتوى الرسمي",
      description: "Elegant serif font for formal content"
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Arabic Font Examples
      </Typography>
      
      <FontSelector />
      <FontPreview />
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {examples.map((example, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {example.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {example.description}
              </Typography>
              <example.component>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    direction: 'rtl',
                    textAlign: 'right',
                    lineHeight: 1.6,
                    mb: 2
                  }}
                >
                  {example.text}
                </example.component>
              <Typography variant="body1" sx={{ direction: 'rtl', textAlign: 'right' }}>
                هذا مثال على استخدام الخط في النصوص العربية
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Font: {fonts[currentFont].name}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: fonts[currentFont].family,
            direction: 'rtl',
            textAlign: 'right',
            fontSize: '1.1rem',
            lineHeight: 1.8
          }}
        >
          هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ArabicFontExamples; 