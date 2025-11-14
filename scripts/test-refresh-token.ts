import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testRefreshToken() {
  console.log('🔄 Probando Refresh Token...\n');

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Faltan variables de entorno');
    return;
  }

  console.log('📋 Configuración:');
  console.log('Client ID:', clientId.substring(0, 30) + '...');
  console.log('Client Secret:', clientSecret.substring(0, 20) + '...');
  console.log('Refresh Token:', refreshToken.substring(0, 20) + '...\n');

  try {
    console.log('🔄 Intentando obtener Access Token...');
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data: any = await response.json();

    if (response.ok) {
      console.log('✅ Access Token obtenido exitosamente!\n');
      console.log('📊 Respuesta:');
      console.log('Access Token:', data.access_token.substring(0, 30) + '...');
      console.log('Expira en:', data.expires_in, 'segundos');
      console.log('Token Type:', data.token_type);
      console.log('Scope:', data.scope);
      console.log('\n🎉 El Refresh Token es VÁLIDO!');
      console.log('✅ Puedes usar Gmail OAuth2 para enviar emails');
    } else {
      console.error('❌ Error al obtener Access Token:');
      console.error('Status:', response.status);
      console.error('Error:', data.error);
      console.error('Descripción:', data.error_description);
      
      if (data.error === 'invalid_grant') {
        console.error('\n🔧 Solución:');
        console.error('1. El Refresh Token puede haber expirado o sido revocado');
        console.error('2. Ve a: https://developers.google.com/oauthplayground');
        console.error('3. Genera un nuevo Refresh Token');
        console.error('4. Actualiza GMAIL_REFRESH_TOKEN en tu .env');
      }
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testRefreshToken();
