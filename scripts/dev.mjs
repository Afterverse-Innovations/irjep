import fs from 'fs';
import path from 'path';

const mode = process.argv[2] === 'prod' ? 'production' : 'development';

async function main() {
    const rootDir = process.cwd();
    const astroDir = path.join(rootDir, 'apps', 'astro-web');
    const sourceEnv = path.join(rootDir, `.env.${mode}`);
    const destEnvAstro = path.join(astroDir, '.env.local');
    const destEnvRoot = path.join(rootDir, '.env.local');

    if (!fs.existsSync(sourceEnv)) {
        console.error(`\x1b[31mError: ${sourceEnv} not found.\x1b[0m`);
        process.exit(1);
    }

    // 1. Copy to Astro app
    fs.copyFileSync(sourceEnv, destEnvAstro);
    console.log(`\x1b[32m✔ Updated Astro: ${destEnvAstro}\x1b[0m`);

    // 2. Load and sync variables to Root .env.local (required for Convex)
    const content = fs.readFileSync(sourceEnv, 'utf8');
    let rootEnvContent = "";

    // For root, we map PUBLIC_X to X for Convex compatibility
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const k = key.trim();
                const v = valueParts.join('=').trim();
                const rootKey = k.startsWith('PUBLIC_') ? k.replace('PUBLIC_', '') : k;
                rootEnvContent += `${rootKey}=${v}\n`;
            }
        }
    });

    fs.writeFileSync(destEnvRoot, rootEnvContent.trim() + '\n');
    console.log(`\x1b[32m✔ Updated Root:  ${destEnvRoot} (${mode})\x1b[0m`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
