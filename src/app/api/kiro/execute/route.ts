import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Este endpoint recibe instrucciones y las guarda para que Kiro las procese
export async function POST(request: NextRequest) {
  try {
    const { instruction } = await request.json();

    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Instrucción inválida' },
        { status: 400 }
      );
    }

    // Guardar la instrucción en un archivo que Kiro puede leer
    const requestsPath = join(process.cwd(), '.kiro-requests.json');
    
    let requests = [];
    try {
      const existing = readFileSync(requestsPath, 'utf-8');
      requests = JSON.parse(existing);
    } catch {
      // Archivo no existe, crear nuevo
    }

    const newRequest = {
      id: Date.now().toString(),
      instruction,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    requests.push(newRequest);
    writeFileSync(requestsPath, JSON.stringify(requests, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Instrucción recibida. Kiro la procesará en breve.',
      requestId: newRequest.id,
    });
  } catch (error) {
    console.error('Error al procesar instrucción:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la instrucción' },
      { status: 500 }
    );
  }
}

// Endpoint para que el dashboard consulte el estado de las solicitudes
export async function GET(request: NextRequest) {
  try {
    const requestsPath = join(process.cwd(), '.kiro-requests.json');
    
    let requests = [];
    try {
      const existing = readFileSync(requestsPath, 'utf-8');
      requests = JSON.parse(existing);
    } catch {
      // No hay solicitudes
    }

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
