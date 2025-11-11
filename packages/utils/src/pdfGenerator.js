import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export const generatePDF = async (invoiceData, templateNumber) => {
  

  return new Promise(async (resolve, reject) => {
    let invoicePreview = null;
    let originalMarginLeft = "";
    let originalMarginRight = "";

    try {
      // Step 2: Find the invoice preview element
      invoicePreview = document.querySelector(".invoice-preview-container");

      if (!invoicePreview) {
        console.error(
          "❌ [PDF Generator] Invoice preview container not found!"
        );
        throw new Error(
          "Invoice preview not found. Please switch to preview mode first."
        );
      }
      console.log(
        "✅ [PDF Generator] Step 2: Invoice preview container found!"
      );
      console.log("📐 Preview dimensions:", {
        width: invoicePreview.offsetWidth,
        height: invoicePreview.offsetHeight,
      });

      // DEBUG: Log detailed positioning information
      console.log("🔍 [DEBUG] Element positioning details:");
      const previewRect = invoicePreview.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(invoicePreview);
      console.log("  - Bounding Client Rect:", {
        left: previewRect.left,
        top: previewRect.top,
        right: previewRect.right,
        bottom: previewRect.bottom,
        width: previewRect.width,
        height: previewRect.height,
      });
      console.log("  - Computed Styles:", {
        position: computedStyle.position,
        margin: computedStyle.margin,
        marginLeft: computedStyle.marginLeft,
        marginRight: computedStyle.marginRight,
        padding: computedStyle.padding,
        transform: computedStyle.transform,
        left: computedStyle.left,
        right: computedStyle.right,
      });
      console.log("  - Offset properties:", {
        offsetLeft: invoicePreview.offsetLeft,
        offsetTop: invoicePreview.offsetTop,
        offsetWidth: invoicePreview.offsetWidth,
        offsetHeight: invoicePreview.offsetHeight,
      });

      // Step 3: Get computed dimensions
      console.log("📏 [PDF Generator] Step 3: Getting computed dimensions...");
      const width = invoicePreview.offsetWidth;
      const height = invoicePreview.offsetHeight;
      console.log(`✅ Dimensions: ${width}px × ${height}px`); // Step 4: Configure html-to-image options
      console.log(
        "⚙️ [PDF Generator] Step 4: Configuring html-to-image options..."
      );
      // Temporarily remove centering to prevent blank space on left
      console.log("🔧 [DEBUG] Temporarily removing mx-auto centering...");
      originalMarginLeft = invoicePreview.style.marginLeft;
      originalMarginRight = invoicePreview.style.marginRight;
      invoicePreview.style.marginLeft = "0";
      invoicePreview.style.marginRight = "0";

      const options = {
        quality: 1,
        pixelRatio: 2,
        width: width,
        height: height,
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      };
      console.log("✅ Options configured:", options);

      // Step 5: Convert to PNG using html-to-image
      console.log("🖼️ [PDF Generator] Step 5: Converting HTML to PNG...");
      console.log("⏳ This may take a few seconds...");
      const dataUrl = await toPng(invoicePreview, options);

      // Restore original margins
      console.log("🔧 [DEBUG] Restoring original margins...");
      invoicePreview.style.marginLeft = originalMarginLeft;
      invoicePreview.style.marginRight = originalMarginRight;

      console.log("✅ [PDF Generator] Step 5: PNG conversion successful!");
      console.log("📊 Data URL length:", dataUrl.length);

      // Step 6: Find logo position for hyperlink
      console.log(
        "🔗 [PDF Generator] Step 6: Detecting logo position for hyperlink..."
      );
      let logoLink = null;
      if (invoiceData.websiteUrl) {
        const logoElement = invoicePreview.querySelector("[data-website-url]");
        if (logoElement) {
          const rect = logoElement.getBoundingClientRect();
          const previewRect = invoicePreview.getBoundingClientRect();

          // Calculate relative position and convert to PDF coordinates
          const relativeX = rect.left - previewRect.left;
          const relativeY = rect.top - previewRect.top;
          const relativeWidth = rect.width;
          const relativeHeight = rect.height;

          // Convert pixel positions to mm (A4 dimensions)
          const pdfWidth = 210; // A4 width in mm
          const pdfHeight = 297; // A4 height in mm
          const scaleX = pdfWidth / width;
          const scaleY = pdfHeight / height;

          logoLink = {
            url: invoiceData.websiteUrl,
            x: relativeX * scaleX,
            y: relativeY * scaleY,
            width: relativeWidth * scaleX,
            height: relativeHeight * scaleY,
          };

          console.log("✅ Logo hyperlink detected:", logoLink);
        } else {
          console.log(
            "⚠️ No logo element found with data-website-url attribute"
          );
        }
      } else {
        console.log("ℹ️ No website URL provided, skipping hyperlink");
      }

      // Step 7: Create PDF
      console.log("📄 [PDF Generator] Step 7: Creating PDF document...");
      const pdf = new jsPDF("p", "mm", "a4");
      console.log("✅ PDF document created (A4, portrait)");

      // Step 8: Add image to PDF
      console.log("🖼️ [PDF Generator] Step 8: Adding image to PDF...");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );
      console.log(`✅ Image added to PDF (${pdfWidth}mm × ${pdfHeight}mm)`);

      // Step 9: Add hyperlink to logo
      if (logoLink) {
        console.log(
          "🔗 [PDF Generator] Step 9: Adding clickable hyperlink to logo..."
        );
        pdf.link(logoLink.x, logoLink.y, logoLink.width, logoLink.height, {
          url: logoLink.url,
        });
        console.log(`✅ Hyperlink added: ${logoLink.url}`);
      } else {
        console.log(
          "⏭️ [PDF Generator] Step 9: No hyperlink to add, skipping..."
        );
      }

      // Step 10: Generate filename
      console.log("📝 [PDF Generator] Step 10: Generating filename...");
      // const { number, date, paymentDate } = invoiceData.invoice;
      const { number, date } = invoiceData.invoice;
      const { name: companyName } = invoiceData.yourCompany;
      const { name: billToName } = invoiceData.billTo;
      const timestamp = new Date().getTime();

      let fileName;
      switch (templateNumber) {
        case 1:
          fileName = `${number}.pdf`;
          break;
        case 2:
          fileName = `${companyName}_${number}.pdf`;
          break;
        case 3:
          fileName = `${companyName}.pdf`;
          break;
        case 4:
          fileName = `${date}.pdf`;
          break;
        case 5:
          fileName = `${number}-${date}.pdf`;
          break;
        case 6:
          fileName = `invoice_${timestamp}.pdf`;
          break;
        case 7:
          fileName = `Invoice_${number}.pdf`;
          break;
        case 8:
          fileName = `Invoice_${billToName}.pdf`;
          break;
        case 9:
          fileName = `IN-${date}.pdf`;
          break;
        default:
          fileName = `invoice_template_${templateNumber}.pdf`;
      }

      console.log("✅ Filename generated:", fileName);

      // Step 11: Save PDF
      console.log("💾 [PDF Generator] Step 11: Saving PDF...");
      pdf.save(fileName);
      console.log("✅ [PDF Generator] Step 11: PDF saved successfully!");

      // Step 12: Complete
      console.log("🎉 [PDF Generator] Step 12: PDF generation complete!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      resolve();
    } catch (error) {
      // Restore margins in case of error
      if (invoicePreview) {
        console.log("🔧 [ERROR CLEANUP] Restoring original margins...");
        invoicePreview.style.marginLeft = originalMarginLeft;
        invoicePreview.style.marginRight = originalMarginRight;
      }

      console.error("❌ [PDF Generator] ERROR occurred!");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      reject(error);
    }
  });
};
