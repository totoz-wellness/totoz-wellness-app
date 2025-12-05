/**
 * Export resource details to printable format
 */

export const exportResourceToPDF = (resource: any, typeConfig: any) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  
  if (! printWindow) {
    alert('Please allow popups to export this resource');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${resource.name} - Totoz Wellness</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            border-bottom: 3px solid #3AAFA9;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            color: #3AAFA9;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            background: #E0F2F1;
            color: #00695C;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .section {
            margin: 25px 0;
          }
          .label {
            font-weight: bold;
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
            display: block;
          }
          .value {
            color: #333;
            font-size: 16px;
            padding-left: 10px;
          }
          .specializations {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
          }
          . spec-tag {
            background: #F5F5F5;
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 14px;
          }
          .contact-item {
            margin: 15px 0;
            padding: 12px;
            background: #F9F9F9;
            border-radius: 8px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resource.name}</h1>
          <span class="badge">${typeConfig[resource.type]. label}</span>
          ${resource.isVerified ? '<span class="badge" style="background: #4CAF50; color: white; margin-left: 10px;">✓ Verified</span>' : ''}
        </div>

        <div class="section">
          <span class="label">Description</span>
          <p class="value">${resource.description}</p>
        </div>

        ${resource.specializations && resource.specializations.length > 0 ? `
          <div class="section">
            <span class="label">Specializations</span>
            <div class="specializations">
              ${resource.specializations.map((spec: string) => `<span class="spec-tag">${spec}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${resource.operatingHours ?  `
          <div class="section">
            <span class="label">Operating Hours</span>
            <p class="value">${resource.operatingHours}</p>
          </div>
        ` : ''}

        ${resource.location. address || resource.location.city ?  `
          <div class="section">
            <span class="label">Location</span>
            <p class="value">
              ${[resource.location.address, resource. location.city, resource.location.county, resource.location.region]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>
        ` : ''}

        <div class="section">
          <span class="label">Contact Information</span>
          ${resource.contact. phone ? `
            <div class="contact-item">
              <strong>Phone:</strong> ${resource. contact.phone}
            </div>
          ` : ''}
          ${resource.contact.email ? `
            <div class="contact-item">
              <strong>Email:</strong> ${resource. contact.email}
            </div>
          ` : ''}
          ${resource.contact.website ? `
            <div class="contact-item">
              <strong>Website:</strong> ${resource. contact.website}
            </div>
          ` : ''}
        </div>

        ${resource.languages && resource.languages.length > 0 ? `
          <div class="section">
            <span class="label">Languages</span>
            <p class="value">${resource.languages.join(', ')}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Exported from Totoz Wellness ConnectCare Directory</p>
          <p>© ${new Date().getFullYear()} Totoz Wellness. All Rights Reserved.</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #3AAFA9; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="padding: 12px 24px; background: #999; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};