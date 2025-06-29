import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export class ExportUtils {
  static formatDataForExport(data, columnMap) {
    return data.map(item => {
      const formattedItem = {};
      Object.entries(columnMap).forEach(([key, label]) => {
        let value = item[key];
        
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No';
        } else if (value instanceof Date) {
          value = value.toLocaleDateString();
        } else if (typeof value === 'string' && value.includes('T')) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            value = date.toLocaleDateString();
          }
        } else if (key === 'cr648_disabilitystatus' && typeof value === 'number') {
          // Convert disability status codes to readable text
          const statusMap = {
            791310000: 'A - Physical Sensory Only',
            791310001: 'B - Learning',
            791310002: 'C - Physical + Learning',
            791310003: 'D - Autistic Spectrum',
            791310005: 'Disability'
          };
          value = statusMap[value] || value;
        }
        
        formattedItem[label] = value;
      });
      return formattedItem;
    });
  }

  static async exportToExcel(data, filename, columnMap, sheetName = 'Data') {
    try {
      const formattedData = this.formatDataForExport(data, columnMap);
      
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      
      const colWidths = Object.values(columnMap).map(header => ({
        wch: Math.max(header.length, 15)
      }));
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}.xlsx`;
      
      XLSX.writeFile(workbook, fullFilename);
      
      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('Excel export error:', error);
      return { success: false, error: error.message };
    }
  }

  static async exportToPDF(data, filename, columnMap, title = 'Report') {
    try {
      const formattedData = this.formatDataForExport(data, columnMap);
      
      // Create PDF document in landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title and metadata
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      
      const timestamp = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 14, 25);
      doc.text(`Records: ${data.length}`, 14, 30);
      
      const headers = Object.values(columnMap);
      const rows = formattedData.map(item => headers.map(header => String(item[header] || '')));
      
      // Try autoTable first, fallback to manual table if it fails
      try {
        if (doc.autoTable && typeof doc.autoTable === 'function') {
          doc.autoTable({
            head: [headers],
            body: rows,
            startY: 35,
            styles: {
              fontSize: 7,
              cellPadding: 1,
            },
            headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 7,
            },
            columnStyles: {},
            margin: { top: 35, right: 14, bottom: 20, left: 14 },
            tableWidth: 'auto',
            theme: 'striped',
          });
        } else {
          throw new Error('autoTable not available, using manual table');
        }
      } catch (autoTableError) {
        console.warn('AutoTable failed, creating manual table:', autoTableError);
        
        // Manual table creation as fallback
        let yPosition = 45;
        const lineHeight = 6;
        const colWidth = (297 - 28) / headers.length; // A4 landscape width minus margins
        
        // Draw headers
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        headers.forEach((header, index) => {
          doc.text(String(header).substring(0, 15), 14 + (index * colWidth), yPosition);
        });
        
        yPosition += lineHeight;
        doc.line(14, yPosition, 283, yPosition); // Header underline
        yPosition += 2;
        
        // Draw data rows
        doc.setFont(undefined, 'normal');
        rows.slice(0, 30).forEach((row, rowIndex) => { // Limit to 30 rows for basic PDF
          row.forEach((cell, colIndex) => {
            const cellText = String(cell).substring(0, 15); // Truncate long text
            doc.text(cellText, 14 + (colIndex * colWidth), yPosition);
          });
          yPosition += lineHeight;
          
          // Add new page if needed
          if (yPosition > 190) {
            doc.addPage();
            yPosition = 20;
          }
        });
        
        if (rows.length > 30) {
          yPosition += lineHeight;
          doc.text(`... and ${rows.length - 30} more records`, 14, yPosition);
        }
      }
      
      const fullFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Use output method for better browser compatibility
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fullFilename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  static async exportToCSV(data, filename, columnMap) {
    try {
      const formattedData = this.formatDataForExport(data, columnMap);
      
      const headers = Object.values(columnMap);
      const csvContent = [
        headers.join(','),
        ...formattedData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fullFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('CSV export error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const COACHING_SESSIONS_COLUMNS = {
  'participant_name': 'Participant Name',
  'cr648_coachname': 'Coach Name',
  'cr648_date': 'Date',
  'cr648_sessiongoals': 'Session Goals',
  'cr648_lessonplan': 'Lesson Plan',
  'cr648_equines': 'Equines Used',
  'cr648_equipmentresources': 'Equipment & Resources',
  'cr648_taskwarmuptime': 'Warm-up Duration',
  'cr648_taskwarmupcoachingpointsfocusstyles': 'Warm-up Coaching Points',
  'cr648_taskwarmupcomment': 'Warm-up Comments',
  'cr648_maincontenttime': 'Main Content Duration',
  'cr648_maincontentcoachingpoints': 'Main Content Coaching Points',
  'cr648_maincontentcomment': 'Main Content Comments',
  'cr648_cooldowntime': 'Cool-down Duration',
  'cr648_cooldowncoachingpoints': 'Cool-down Coaching Points',
  'cr648_cooldowncomment': 'Cool-down Comments',
  'cr648_participantsevaluation': 'Participant Evaluation',
  'cr648_evaluationofsessionandactionfornextsession': 'Session Evaluation & Next Actions'
};

export const PARTICIPANT_INFO_COLUMNS = {
  'cr648_firstname': 'First Name',
  'cr648_lastname': 'Last Name',
  'cr648_dateofbirth': 'Date of Birth',
  'cr648_age': 'Age',
  'cr648_emailaddress': 'Email Address',
  'cr648_phonenumber': 'Phone Number',
  'cr648_mobilenumber': 'Mobile Number',
  'cr648_addressline1': 'Address Line 1',
  'cr648_addressline2': 'Address Line 2',
  'cr648_addressline3': 'Address Line 3',
  'cr648_postalcode': 'Postal Code',
  'cr648_guardianorparent': 'Guardian/Parent',
  'cr648_guardianphone': 'Guardian Phone',
  'cr648_heightincm': 'Height (cm)',
  'cr648_heightinftandin': 'Height (ft/in)',
  'cr648_weightinkg': 'Weight (kg)',
  'cr648_weightinstones': 'Weight (stones/lbs)',
  'cr648_disabilitystatus': 'Disability Status',
  'cr648_epilepsystatus': 'Epilepsy Status',
  'cr648_startdate': 'Start Date',
  'cr648_ApprovedOn': 'Approved On',
  'cr648_sessiondateandtime': 'Preferred Session Date/Time',
  'cr648_volunteerstatus': 'Volunteer Status',
  'cr648_dataprotectionconsent': 'Data Protection Consent',
  'cr648_photosconsent': 'Photos Consent'
};