async function test() {
  console.log('Starting import test...')
  try {
    const m = await import('./src/lib/wa-service')
    console.log('✅ Success!')
  } catch (e: any) {
    console.error('❌ Error stack:')
    console.error(e.stack)
    if (e.code) console.error('Error code:', e.code)
  }
}

test()
