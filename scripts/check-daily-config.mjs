import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

const hasDailyKey = envContent.includes('DAILY_API_KEY=') && !envContent.includes('DAILY_API_KEY=\n') && !envContent.includes('DAILY_API_KEY=""');
const hasDailyDomain = envContent.includes('NEXT_PUBLIC_DAILY_DOMAIN=') && !envContent.includes('NEXT_PUBLIC_DAILY_DOMAIN=\n') && !envContent.includes('NEXT_PUBLIC_DAILY_DOMAIN=""');

console.log('Daily.co Configuration Check:');
console.log('  DAILY_API_KEY:', hasDailyKey ? '✅ Set' : '❌ NOT SET or empty');
console.log('  NEXT_PUBLIC_DAILY_DOMAIN:', hasDailyDomain ? '✅ Set' : '❌ NOT SET or empty');

if (!hasDailyKey || !hasDailyDomain) {
    console.log('\n⚠️  Video calls will NOT work without these environment variables.');
    console.log('\nTo fix:');
    console.log('1. Create a Daily.co account at https://www.daily.co');
    console.log('2. Get your API key from the Daily.co dashboard');
    console.log('3. Add to .env.local:');
    console.log('   DAILY_API_KEY=your_api_key_here');
    console.log('   NEXT_PUBLIC_DAILY_DOMAIN=your-domain.daily.co');
} else {
    console.log('\n✅ Daily.co appears to be configured!');
}
