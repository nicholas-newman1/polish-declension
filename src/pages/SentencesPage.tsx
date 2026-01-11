import { Box, styled } from '@mui/material';
import { SentenceTranslation } from '../components/SentenceTranslation';

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export function SentencesPage() {
  return (
    <MainContent>
      <SentenceTranslation />
    </MainContent>
  );
}

