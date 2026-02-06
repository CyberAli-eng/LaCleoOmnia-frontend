const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function loadEnvFile(envFile) {
    const fullPath = path.join(__dirname, envFile);

    if (!fs.existsSync(fullPath)) {
        console.error(`Environment file ${envFile} not found at ${fullPath}`);
        process.exit(1);
    }

    const env = fs.readFileSync(fullPath, "utf-8");
    const lines = env.split("\n");

    for (let line of lines) {
        line = line.trim();

        // Skip empty lines and comments
        if (!line || line.startsWith("#")) continue;

        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=").trim();

        if (key && value) {
            process.env[key] = value;
            // console.log(`✓ ${key}=${value}`);
        }
    }

    console.log(`Loaded environment from: ${envFile}`);
}

function getEnvFile(environment) {
    const envMap = {
        "local": ".env",
        "stage": ".env.stage",
        "prod": ".env.prod"
    };

    return envMap[environment];
}

// Get environment from command line argument
const environment = process.argv[2];

if (!environment) {
    console.error(" Please specify environment: local, stage, or prod");
    console.error("Usage: node setEnv.js <local|stage|prod>");
    console.error("\nExamples:");
    console.error("  npm run build:local   # Build for local");
    console.error("  npm run build:stage   # Build for staging");
    console.error("  npm run build:prod    # Build for production");
    process.exit(1);
}

const envFile = getEnvFile(environment);

if (!envFile) {
    console.error(`Unknown environment: ${environment}`);
    console.error("Valid options: local, stage, prod");
    process.exit(1);
}

// Load the environment file
loadEnvFile(envFile);

// Print loaded configuration (excluding sensitive values)
console.log(`\n Configuration for ${environment}:`);
console.log(`   API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'}`);
console.log(`   Environment: ${process.env.NEXT_PUBLIC_ENV || 'NOT SET'}`);

// Run the next build command
console.log(`\n🔨 Building for ${environment}...\n`);
const build = spawn("npm", ["run", "build"], {
    stdio: "inherit",
    env: process.env
});

build.on("close", (code) => {
    if (code === 0) {
        console.log(`\n Build completed successfully for ${environment}!`);
    } else {
        console.error(`\n Build failed with code ${code}`);
    }
    process.exit(code);
});
