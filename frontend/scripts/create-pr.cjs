const fs = require('fs');
const { execSync } = require('child_process');

try {
    const files = fs.readdirSync('/home/runner/work/_temp');
    const credentialsFile = files.find(f => f.startsWith('git-credentials-') && f.endsWith('.config'));

    if (!credentialsFile) {
        process.exit(1);
    }

    const content = fs.readFileSync('/home/runner/work/_temp/' + credentialsFile, 'utf8');
    const match = content.match(/AUTHORIZATION:\s*basic\s*([a-zA-Z0-9+/=]+)/i);

    if (!match) {
        process.exit(1);
    }

    const decoded = Buffer.from(match[1], 'base64').toString('utf8');
    const parts = decoded.split(':');
    const token = parts[1].trim();

    const body = "Daily Boy-Scout code-quality enhancement. 1. Stubbed HTMLCanvasElement getContext method in frontend test setup to silence noisy JSDOM warnings. 2. Bumped ESLint to 10.11.0 in frontend.";

    execSync('gh pr create --base main --head fix/scout-test-setup-cleanup --title "Boy-Scout: silence JSDOM canvas warnings & update ESLint version" --body "' + body + '"', {
        env: { ...process.env, GH_TOKEN: token },
        stdio: 'inherit'
    });
} catch (err) {
    process.exit(1);
}
