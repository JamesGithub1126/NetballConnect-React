import { savePDF } from '@progress/kendo-react-pdf';

class DocService {
  createPdf = html => {
    savePDF(html, {
      fileName: 'invoice.pdf',
      scale: 0.6,
      paperSize: 'A4',
      margin: '0.5cm',
      // margin: 3
    });
  };
}

const Doc = new DocService();
export default Doc;
