import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      name, 
      phone, 
      email, 
      idNumber, 
      address, 
      country, 
      bankName, 
      accountNumber, 
      accountType 
    } = body;

    if (!name || !phone || !userId) {
      return NextResponse.json(
        { error: 'Nombre, teléfono e ID de prestamista son requeridos' },
        { status: 400 }
      );
    }

    const borrower = await db.borrower.create({
      data: {
        userId,
        name,
        phone,
        email,
        idNumber,
        address,
        country,
        bankName,
        accountNumber,
        accountType,
        status: 'pending'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Información registrada correctamente',
      data: borrower 
    });
  } catch (error: any) {
    console.error('Error registering borrower:', error);
    return NextResponse.json(
      { error: 'Error al registrar la información: ' + error.message },
      { status: 500 }
    );
  }
}
