import { FC } from "react";
import { Document, Page, Text, Image } from '@react-pdf/renderer';

type PDFDocumentProps = {
  imageSrc: string,
  text: string
} 
const PDFDocument: FC<PDFDocumentProps> = ({ imageSrc, text}) => (
  <Document>
    <Page size="A4" style={{display: 'flex', flexDirection: 'column', alignItems: 'center',  justifyContent: 'flex-start', padding: 50, gap: 50}}>
    <Image src={imageSrc} style={{width: '100%', height: '50%', objectFit: 'contain'}}/>
    <Text>{text}</Text>
    </Page>
  </Document>
);

export default PDFDocument;
