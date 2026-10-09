import { jsPDF } from 'jspdf';
import { Student } from '../types/student';

export const exportClassRosterPDF = (students: Student[], reportTitle: string = 'Official Student Enrollment Roster') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background banner
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NAWAZ SHARIF SCHOOL OF EMINENCE (NSSE)', 14, 11);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${reportTitle} | Generated on: ${new Date().toLocaleDateString('en-PK', { dateStyle: 'full' })}`, 14, 18);
  doc.text(`Total Records: ${students.length}`, pageWidth - 50, 18);

  // Gold accent line
  doc.setFillColor(234, 179, 8); // Amber 500
  doc.rect(0, 26, pageWidth, 1.5, 'F');

  // Table Headers
  const startY = 36;
  const colX = [14, 48, 92, 136, 170, 192, 222, 250];
  const headers = ['Roll No', 'Student Name', "Father's Name", 'Class & Section', 'Age/Blood', 'Phone', 'Fee Status', 'Status'];

  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(14, startY - 6, pageWidth - 28, 9, 'F');

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  headers.forEach((h, i) => {
    doc.text(h, colX[i], startY);
  });

  // Rows
  let currentY = startY + 7;
  const rowHeight = 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  students.forEach((std, index) => {
    // Check if new page needed
    if (currentY + rowHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;

      // Repeat table header on new page
      doc.setFillColor(30, 41, 59);
      doc.rect(14, currentY - 6, pageWidth - 28, 9, 'F');
      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      headers.forEach((h, i) => {
        doc.text(h, colX[i], currentY);
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      currentY += 7;
    }

    // Alternating zebra stripe
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY - 5, pageWidth - 28, rowHeight, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(std.rollNumber, colX[0], currentY);
    doc.text(std.name.length > 22 ? std.name.slice(0, 20) + '...' : std.name, colX[1], currentY);
    doc.text(std.fatherName.length > 22 ? std.fatherName.slice(0, 20) + '...' : std.fatherName, colX[2], currentY);
    doc.text(`${std.classGrade.slice(0, 16)} (${std.section})`, colX[3], currentY);
    doc.text(`${std.age} yrs / ${std.bloodGroup}`, colX[4], currentY);
    doc.text(std.guardianPhone, colX[5], currentY);

    // Fee Status Color representation
    doc.setTextColor(std.feeStatus === 'Paid' ? 16 : std.feeStatus === 'Scholarship' ? 14 : 185, std.feeStatus === 'Paid' ? 120 : std.feeStatus === 'Scholarship' ? 116 : 28, std.feeStatus === 'Paid' ? 50 : std.feeStatus === 'Scholarship' ? 144 : 28);
    doc.text(std.feeStatus, colX[6], currentY);

    doc.setTextColor(15, 23, 42);
    doc.text(std.academicStatus, colX[7], currentY);

    currentY += rowHeight;
  });

  // Footer & Seal
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated student record from the NSSE Management Portal. Official seal and verification guaranteed.', 14, pageHeight - 10);
  doc.text('Principal / Senior Registrar Sign & Stamp: _______________________', pageWidth - 110, pageHeight - 10);

  doc.save(`NSSE_Student_Roster_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportStudentProfilePDF = (student: Student) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(6, 78, 59); // NSSE Emerald
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NAWAZ SHARIF SCHOOL OF EMINENCE', 20, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL STUDENT RECORD & VERIFICATION DOSSIER', 20, 22);
  doc.text(`Roll No: ${student.rollNumber}`, pageWidth - 60, 22);

  // Gold accent bar
  doc.setFillColor(234, 179, 8);
  doc.rect(0, 32, pageWidth, 2, 'F');

  // Student Card Section Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 42, pageWidth - 30, 48, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 42, pageWidth - 30, 48, 3, 3, 'S');

  // Photo placeholder box
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(22, 47, 34, 38, 2, 2, 'F');
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(22, 47, 34, 38, 2, 2, 'S');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.text('[STUDENT PHOTO]', 25, 68);

  // Primary Info next to photo
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(student.name, 62, 54);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Son/Daughter of: `, 62, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.fatherName, 92, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Class & Section: `, 62, 69);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text(`${student.classGrade} | Section ${student.section}`, 92, 69);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Admission Date: `, 62, 76);
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.admissionDate}`, 92, 76);

  // Status badges in card
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(62, 80, 24, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(student.academicStatus, 65, 84.5);

  doc.setFillColor(245, 158, 11);
  doc.roundedRect(90, 80, 28, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`Fee: ${student.feeStatus}`, 93, 84.5);

  // Detailed Information Grid
  let y = 100;
  const renderDetailRow = (title: string, value: string, title2?: string, value2?: string) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, pageWidth - 30, 9, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y + 9, pageWidth - 15, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(title, 18, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value || 'N/A', 55, y + 6);

    if (title2 && value2) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(title2, 105, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(value2, 145, y + 6);
    }

    y += 11;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text('I. BIOGRAPHICAL & HEALTH INFORMATION', 15, 96);

  renderDetailRow('Date of Birth:', student.dob || 'N/A', 'Age:', `${student.age} Years`);
  renderDetailRow('Gender:', student.gender, 'Blood Group:', student.bloodGroup);
  renderDetailRow('B-Form / CNIC:', student.bFormNumber || '35201-XXXXXXX-X', 'Health / Medical:', student.medicalNotes || 'Fit');

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text('II. CONTACT & GUARDIAN DETAILS', 15, y);
  y += 4;

  renderDetailRow('Guardian Phone:', student.guardianPhone, 'WhatsApp:', student.whatsapp || student.guardianPhone);
  renderDetailRow('Emergency Contact:', student.emergencyContact, 'Record Last Modified:', new Date(student.lastUpdated).toLocaleDateString());
  renderDetailRow('Residential Address:', student.address);

  // Administrative Verification Box
  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('INSTITUTIONAL CERTIFICATION', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Certified that the above particulars are in accordance with the school admissions register maintained at NSSE.', 20, y + 15);
  doc.text('Registrar Signature: __________________________', 20, y + 28);
  doc.text('Principal Seal & Stamp: __________________________', pageWidth - 100, y + 28);

  doc.save(`NSSE_Profile_${student.rollNumber}.pdf`);
};
