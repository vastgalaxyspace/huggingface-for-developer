const { execSync } = require('child_process');

try {
  console.log("Running build...");
  const output = execSync('npm run build', { encoding: 'utf-8' });
  console.log("BUILD SUCCESS:");
  console.log(output);
} catch (err) {
  console.log("BUILD ERROR:");
  console.log(err.stdout);
  console.log(err.stderr);
}
