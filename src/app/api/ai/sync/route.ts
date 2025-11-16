/**
 * API endpoint para sincronizar datos con Core AI
 */

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { type } = await request.json();

    console.log(`[AI Sync] Iniciando sincronización: ${type || 'all'}`);

    // Ejecutar script de sincronización
    const { stdout, stderr } = await execAsync('npx tsx scripts/sync-to-core-ai.ts');

    if (stderr) {
      console.warn('[AI Sync] Warnings:', stderr);
    }

    console.log('[AI Sync] Output:', stdout);

    return NextResponse.json({
      success: true,
      message: 'Sincronización completada',
      output: stdout
    });

  } catch (error) {
    console.error('[AI Sync] Error:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stderr || error.stdout
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Health check de Core AI
    const coreAIUrl = process.env.CORE_AI_URL || 'http://localhost:8000';
    
    const response = await fetch(`${coreAIUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const health = await response.json();

    return NextResponse.json({
      coreAI: health,
      syncEndpoint: '/api/ai/sync',
      lastSync: null // TODO: Guardar timestamp de última sync
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Core AI no disponible',
      message: error.message
    }, { status: 503 });
  }
}
