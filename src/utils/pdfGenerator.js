import jsPDF from 'jspdf';

// You might need to import or pass the ASSETS_BASE_URL if images are hosted

export const handleDownloadPdf = (selectedRequirement, requirementImages, ASSETS_BASE_URL) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    let yPos = margin;

    // Add Requirement Details
    pdf.setFontSize(16);
    pdf.text('Requirement Details', margin, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.text(`Name: ${selectedRequirement.name}`, margin, yPos);
    yPos += 7;
    pdf.text(`Car Title: ${selectedRequirement.car_title}`, margin, yPos);
    yPos += 7;
    pdf.text(`Date Submitted: ${selectedRequirement.date_submitted ? new Date(selectedRequirement.date_submitted).toLocaleDateString() : 'N/A'}`, margin, yPos);
    yPos += 7;
    pdf.text(`Status: ${selectedRequirement.car_loan_status ? selectedRequirement.car_loan_status.charAt(0).toUpperCase() + selectedRequirement.car_loan_status.slice(1) : 'Under Review'}`, margin, yPos);
    yPos += 15;

    // Add Uploaded Images section title
    pdf.setFontSize(14);
    pdf.text('Uploaded Images:', margin, yPos);
    yPos += 10;

    // Add Images
    const imgWidth = 60; // Width of image in PDF
    const imgHeight = 40; // Height of image in PDF
    const imgMargin = 5; // Margin between images
    let xPos = margin;

    requirementImages.forEach((image, index) => {
        const imageUrl = `${ASSETS_BASE_URL}/${image.file_path}`;
        
        // Check if there's enough space for the image on the current page
        if (yPos + imgHeight + margin > pdf.internal.pageSize.height) {
            pdf.addPage();
            yPos = margin; // Reset y position for new page
            xPos = margin; // Reset x position for new page
        }

        // Add image to PDF
        // You might need to handle different image types (PNG, JPEG, etc.)
        pdf.addImage(imageUrl, 'JPEG', xPos, yPos, imgWidth, imgHeight);

        // Move position for the next image
        xPos += imgWidth + imgMargin;

        // If it's the third image in a row, move to the next row
        if ((index + 1) % 3 === 0) {
            xPos = margin;
            yPos += imgHeight + imgMargin;
        }
    });

    // Save the PDF
    pdf.save(`loan_requirement_${selectedRequirement?.id || 'details'}.pdf`);
}; 