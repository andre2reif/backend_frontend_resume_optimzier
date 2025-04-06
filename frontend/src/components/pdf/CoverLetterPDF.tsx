'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CoverLetter } from '@/types/api';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
  },
  sender: {
    marginBottom: 20,
  },
  recipient: {
    marginBottom: 20,
  },
  date: {
    marginBottom: 20,
    textAlign: 'right',
  },
  subject: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  reference: {
    marginBottom: 20,
  },
  salutation: {
    marginBottom: 20,
  },
  paragraph: {
    marginBottom: 10,
  },
  signature: {
    marginTop: 30,
  },
});

interface CoverLetterPDFProps {
  coverletter: CoverLetter;
}

export default function CoverLetterPDF({ coverletter }: CoverLetterPDFProps) {
  const structuredData = coverletter.structured_coverletter?.cover_letter;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sender}>
          {structuredData?.sender?.name && (
            <Text>{structuredData.sender.name}</Text>
          )}
          {structuredData?.sender?.address && (
            <Text>{structuredData.sender.address}</Text>
          )}
          {structuredData?.sender?.phone && (
            <Text>{structuredData.sender.phone}</Text>
          )}
          {structuredData?.sender?.email && (
            <Text>{structuredData.sender.email}</Text>
          )}
        </View>

        <View style={styles.recipient}>
          {structuredData?.recipient?.name && (
            <Text>{structuredData.recipient.name}</Text>
          )}
          {structuredData?.recipient?.company && (
            <Text>{structuredData.recipient.company}</Text>
          )}
          {structuredData?.recipient?.address && (
            <Text>{structuredData.recipient.address}</Text>
          )}
        </View>

        <View style={styles.date}>
          {structuredData?.date && (
            <Text>{structuredData.date}</Text>
          )}
        </View>

        <View style={styles.subject}>
          {structuredData?.subject && (
            <Text>{structuredData.subject}</Text>
          )}
        </View>

        <View style={styles.reference}>
          {structuredData?.reference && (
            <Text>{structuredData.reference}</Text>
          )}
        </View>

        <View style={styles.salutation}>
          {structuredData?.salutation && (
            <Text>{structuredData.salutation}</Text>
          )}
        </View>

        {structuredData?.paragraphs?.introduction && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.introduction}</Text>
          </View>
        )}

        {structuredData?.paragraphs?.motivation && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.motivation}</Text>
          </View>
        )}

        {structuredData?.paragraphs?.experience_summary && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.experience_summary}</Text>
          </View>
        )}

        {structuredData?.paragraphs?.company_alignment && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.company_alignment}</Text>
          </View>
        )}

        {structuredData?.paragraphs?.added_value && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.added_value}</Text>
          </View>
        )}

        {structuredData?.paragraphs?.salary_expectation && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.salary_expectation}</Text>
          </View>
        )}

        {structuredData?.paragraphs?.closing && (
          <View style={styles.paragraph}>
            <Text>{structuredData.paragraphs.closing}</Text>
          </View>
        )}

        <View style={styles.signature}>
          {structuredData?.paragraphs?.signature && (
            <Text>{structuredData.paragraphs.signature}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
} 