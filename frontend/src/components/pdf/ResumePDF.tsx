'use client';
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  listItem: {
    marginBottom: 4,
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
  const structuredResume = resume.structured_resume;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{resume.title}</Text>
        </View>

        {/* Zusammenfassung */}
        {structuredResume?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zusammenfassung</Text>
            <Text style={styles.content}>{structuredResume.summary.experience}</Text>
          </View>
        )}

        {/* Berufserfahrung */}
        {structuredResume?.career && structuredResume.career.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Berufserfahrung</Text>
            {structuredResume.career.map((job, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={[styles.content, { fontWeight: 'bold' }]}>
                  {job.position} bei {job.company}
                </Text>
                <Text style={styles.content}>{job.time_period}</Text>
                
                {job.tasks.length > 0 && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={[styles.content, { fontWeight: 'bold' }]}>Aufgaben:</Text>
                    {job.tasks.map((task, taskIndex) => (
                      <Text key={taskIndex} style={[styles.content, styles.listItem]}>
                        • {task}
                      </Text>
                    ))}
                  </View>
                )}

                {job.achievements.length > 0 && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={[styles.content, { fontWeight: 'bold' }]}>Erfolge:</Text>
                    {job.achievements.map((achievement, achievementIndex) => (
                      <Text key={achievementIndex} style={[styles.content, styles.listItem]}>
                        • {achievement}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Fähigkeiten */}
        {structuredResume?.key_skills && structuredResume.key_skills.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fähigkeiten</Text>
            {structuredResume.key_skills.items.map((skillGroup, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={[styles.content, { fontWeight: 'bold' }]}>
                  {skillGroup.category}
                </Text>
                <Text style={styles.content}>
                  {skillGroup.skills.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Ausbildung */}
        {structuredResume?.education && structuredResume.education.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ausbildung</Text>
            {structuredResume.education.items.map((item, index) => (
              <Text key={index} style={[styles.content, styles.listItem]}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Sprachen */}
        {structuredResume?.languages && structuredResume.languages.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sprachen</Text>
            {structuredResume.languages.items.map((item, index) => (
              <Text key={index} style={[styles.content, styles.listItem]}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {/* Zusätzliche Informationen */}
        {structuredResume?.optionals && structuredResume.optionals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zusätzliche Informationen</Text>
            {structuredResume.optionals.map((optional, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={[styles.content, { fontWeight: 'bold' }]}>
                  {optional.title}
                </Text>
                {optional.items.map((item, itemIndex) => (
                  <Text key={itemIndex} style={[styles.content, styles.listItem]}>
                    • {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Erstellt mit CV Optimizer - {new Date().toLocaleDateString('de-DE')}
        </Text>
      </Page>
    </Document>
  );
} 