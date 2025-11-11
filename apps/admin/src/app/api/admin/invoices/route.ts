import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@aotf/lib/mongodb';
import Invoice from '@aotf/models/Invoice';

// Generate a unique alphanumeric invoice number (max 6 characters)
async function generateUniqueInvoiceNumber(): Promise<string> {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    // Generate random length between 4-6 characters
    const length = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
    
    // Generate 2-3 letters
    const letterCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
    let invoiceNumber = '';
    
    // Add letters
    for (let i = 0; i < letterCount; i++) {
      invoiceNumber += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    
    // Add numbers
    for (let i = letterCount; i < length; i++) {
      invoiceNumber += numbers[Math.floor(Math.random() * numbers.length)];
    }
    
    // Check if this number already exists
    const existing = await Invoice.findOne({ invoiceNumber });
    if (!existing) {
      return invoiceNumber;
    }
    
    attempts++;
  }
  
  // Fallback: use timestamp-based number
  const timestamp = Date.now().toString().slice(-4);
  const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${letter}${timestamp}`.substring(0, 6);
}

// GET all invoices with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'paid' or 'unpaid'
    const invoiceNumber = searchParams.get('invoiceNumber');
    const postId = searchParams.get('postId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Build query
    const query: Record<string, unknown> = {};
    if (status) query.paymentStatus = status;
    if (invoiceNumber) query.invoiceNumber = new RegExp(invoiceNumber, 'i');
    if (postId) query.postId = postId;
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean();
    
    // Get total count for pagination
    const total = await Invoice.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST create a new invoice
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received POST request to create invoice');
    await connectToDatabase();
    console.log('✅ Database connected');
    
    const body = await request.json();
    console.log('📋 Request body:', {
      invoiceNumber: body.invoiceNumber,
      billTo: body.billTo?.name,
      itemCount: body.items?.length,
    });
    
    // Generate unique invoice number if not provided
    let invoiceNumber = body.invoiceNumber?.toUpperCase();
    if (!invoiceNumber) {
      invoiceNumber = await generateUniqueInvoiceNumber();
      console.log('🔢 Generated new invoice number:', invoiceNumber);
    } else {
      console.log('🔢 Using provided invoice number:', invoiceNumber);
      // Check if provided invoice number already exists
      const existing = await Invoice.findOne({ invoiceNumber });
      if (existing) {
        console.log('❌ Invoice number already exists');
        return NextResponse.json(
          { success: false, message: 'Invoice number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Validate required fields
    if (!body.billTo || !body.yourCompany || !body.items || body.items.length === 0) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create invoice
    const invoiceData = {
      invoiceNumber,
      invoiceDate: body.invoiceDate || new Date(),
      paymentDate: body.paymentDate || new Date(),
      paymentStatus: body.paymentStatus || 'unpaid',
      
      yourCompany: body.yourCompany,
      billTo: body.billTo,
      shipTo: body.shipTo || body.billTo, // Use billTo as default for shipTo
      
      items: body.items,
      subTotal: body.subTotal,
      taxPercentage: body.taxPercentage || 0,
      taxAmount: body.taxAmount || 0,
      grandTotal: body.grandTotal,
      
      notes: body.notes || '',
      currency: body.currency || 'INR',
      signature: body.signature || '/sign.png',
      websiteUrl: body.websiteUrl,
      
      postId: body.postId,
      createdBy: body.createdBy,
      pdfUrl: body.pdfUrl,
    };
    
    console.log('💾 Creating invoice document...');
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    console.log('✅ Invoice saved successfully:', {
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      collection: Invoice.collection.name,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: {
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create invoice' 
      },
      { status: 500 }
    );
  }
}
