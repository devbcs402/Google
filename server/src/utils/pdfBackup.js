import PDFDocument from 'pdfkit';

/**
 * Generates an A4 PDF backup of the user's email accounts and streams it to the response.
 *
 * @param {import('express').Response} res
 * @param {Array} accounts
 * @param {Object} user
 */
export function generatePdfBackup(res, accounts, user) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true,
    info: {
      Title: 'Email Vault Manager Backup',
      Author: user?.name || 'Email Vault User',
      Subject: 'Personal Email Accounts Directory Backup',
      CreationDate: new Date()
    }
  });

  // Stream directly to response
  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - 80; // 40pt margin on left and right

  // Helper to check page break
  function ensureSpace(neededHeight) {
    if (doc.y + neededHeight > pageHeight - 50) {
      doc.addPage();
    }
  }

  // --- Header / Cover Section ---
  doc.rect(40, 40, contentWidth, 80).fill('#f8fafc');
  doc.rect(40, 40, contentWidth, 80).stroke('#e2e8f0');

  doc.fillColor('#4338ca').fontSize(18).font('Helvetica-Bold')
    .text('EMAIL VAULT MANAGER BACKUP', 55, 52);

  const formattedDate = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  doc.fillColor('#334155').fontSize(9).font('Helvetica')
    .text(`Generated: ${formattedDate}`, 55, 75)
    .text(`User: ${user?.name || 'Unknown'} (${user?.email || 'N/A'})`, 55, 88)
    .text(`Total Email Accounts: ${accounts.length}`, 55, 101);

  doc.y = 135;

  // Security warning banner
  doc.rect(40, doc.y, contentWidth, 24).fill('#fef2f2');
  doc.rect(40, doc.y, contentWidth, 24).stroke('#fecaca');
  doc.fillColor('#991b1b').fontSize(8).font('Helvetica-Bold')
    .text('CONFIDENTIAL: This backup contains private email directory information. Store in a secure location.', 50, doc.y + 7);

  doc.y += 34;

  if (accounts.length === 0) {
    // Empty state PDF
    doc.rect(40, doc.y, contentWidth, 60).fill('#f8fafc').stroke('#e2e8f0');
    doc.fillColor('#64748b').fontSize(12).font('Helvetica-Bold')
      .text('No email accounts found.', 55, doc.y + 18);
    doc.fontSize(9).font('Helvetica')
      .text('Your vault currently has 0 saved email accounts. Add accounts in your dashboard to back them up.', 55, doc.y + 34);
  } else {
    // Group accounts by category
    const grouped = {};
    for (const acc of accounts) {
      const cat = acc.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(acc);
    }

    const categories = Object.keys(grouped);

    for (const category of categories) {
      const catAccounts = grouped[category];
      ensureSpace(45);

      // Category Header Banner
      doc.rect(40, doc.y, contentWidth, 22).fill('#e0e7ff');
      doc.fillColor('#3730a3').fontSize(11).font('Helvetica-Bold')
        .text(`CATEGORY: ${category.toUpperCase()} (${catAccounts.length})`, 50, doc.y + 6);
      doc.y += 28;

      for (const account of catAccounts) {
        // Estimate height needed for this account card (typically 120-170pt)
        ensureSpace(130);

        const cardStartY = doc.y;

        // Card container border & background
        doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold')
          .text(account.label, 52, cardStartY + 8, { continued: account.isFavorite });

        if (account.isFavorite) {
          doc.fillColor('#d97706').fontSize(9).font('Helvetica-Bold')
            .text('   [★ FAVORITED]');
        }

        doc.fillColor('#2563eb').fontSize(10).font('Helvetica')
          .text(account.emailAddress, 52, doc.y + 3);

        doc.y += 6;

        // Key-Value rows
        const fields = [
          ['Provider', account.provider || 'Other'],
          ['Category', account.category || 'Personal'],
          ['Purpose', account.purpose || 'None specified'],
          ['Storage Details', account.storageDetails || 'None specified'],
          ['Favorite', account.isFavorite ? 'Yes' : 'No'],
          ['Private Notes', account.notes || 'None'],
          ['Created Date', account.createdAt ? new Date(account.createdAt).toLocaleString() : 'N/A'],
          ['Last Updated', account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'N/A']
        ];

        for (const [label, val] of fields) {
          ensureSpace(16);
          doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold')
            .text(`${label}: `, 52, doc.y, { continued: true });
          doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica')
            .text(val, { width: contentWidth - 30 });
          doc.y += 2;
        }

        // Important Links
        if (account.importantLinks && account.importantLinks.length > 0) {
          ensureSpace(16);
          doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold')
            .text('Important Links:', 52, doc.y);
          doc.y += 2;

          for (const link of account.importantLinks) {
            ensureSpace(14);
            doc.fillColor('#4338ca').fontSize(8).font('Helvetica')
              .text(`  • ${link.title}: ${link.url}`, 58, doc.y, { width: contentWidth - 40 });
            doc.y += 2;
          }
        }

        const cardEndY = doc.y + 6;
        const cardHeight = cardEndY - cardStartY;

        // Draw card border around the section
        doc.rect(40, cardStartY, contentWidth, cardHeight).stroke('#cbd5e1');

        doc.y = cardEndY + 12;
      }
    }
  }

  // --- Add Page Numbers and Footer to All Pages ---
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // Subtle bottom line
    doc.rect(40, pageHeight - 32, contentWidth, 0.5).fill('#cbd5e1');

    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
      .text(
        `Generated by Email Vault Manager  •  Page ${i + 1} of ${range.count}`,
        40,
        pageHeight - 24,
        { align: 'center', width: contentWidth }
      );
  }

  doc.end();
}
