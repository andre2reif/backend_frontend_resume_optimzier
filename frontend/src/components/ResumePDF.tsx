import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Resume } from '@/types/api';

// Registriere eine Standard-Schriftart
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: 'grey',
  },
});

interface ResumePDFProps {
  resume: Resume;
}

export default function ResumePDF({ resume }: ResumePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{resume.title}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.content}>{resume.content}</Text>
        </View>

        <Text style={styles.footer}>
          Erstellt mit CV Optimizer - {new Date().toLocaleDateString('de-DE')}
        </Text>
      </Page>
    </Document>
  );
} 