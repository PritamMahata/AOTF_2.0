import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Invoice from '@aotf/models/Invoice';

interface RouteParams {
  params: Promise<{
    invoiceNumber: string;
  }>;
}

// GET a specific invoice by invoice number
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDatabase();
    
    const { invoiceNumber } = await params;
    const invoice = await Invoice.findOne({ 
      invoiceNumber: invoiceNumber.toUpperCase() 
    })
      .populate('createdBy', 'name email')
      .lean();
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT update an invoice
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    console.log('📥 Received PUT request to update invoice');
    await connectToDatabase();
    console.log('✅ Database connected');
    
    const { invoiceNumber } = await params;
    const body = await request.json();
    
    console.log('🔍 Looking for invoice:', invoiceNumber.toUpperCase());
    
    // Find the invoice
    const invoice = await Invoice.findOne({ 
      invoiceNumber: invoiceNumber.toUpperCase() 
    });
    
    if (!invoice) {
      console.log('❌ Invoice not found');
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Invoice found, updating...');
    
    // Update fields
    const updateFields = [
      'invoiceDate', 'paymentDate', 'paymentStatus',
      'yourCompany', 'billTo', 'shipTo',
      'items', 'subTotal', 'taxPercentage', 'taxAmount', 'grandTotal',
      'notes', 'currency', 'signature', 'websiteUrl', 'pdfUrl'
    ];
    
    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        (invoice as Record<string, unknown>)[field] = body[field];
      }
    });
    
    await invoice.save();
    
    console.log('✅ Invoice updated successfully:', {
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        updatedAt: invoice.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update invoice' 
      },
      { status: 500 }
    );
  }
}

// DELETE an invoice
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDatabase();
    
    const { invoiceNumber } = await params;
    const invoice = await Invoice.findOneAndDelete({ 
      invoiceNumber: invoiceNumber.toUpperCase() 
    });
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
