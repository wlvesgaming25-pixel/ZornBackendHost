/**
 * Automated Route Validation Script
 * Tests all HTML pages for basic functionality
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

// Test results
const results = {
    passed: [],
    failed: [],
    warnings: []
};

console.log(`${colors.blue}🧪 Starting Route Validation Tests...${colors.reset}\n`);

// HTML pages to test
const htmlPages = [
    'index.html',
    'about.html',
    'roster.html',
    'apply.html',
    'partners.html',
    'store.html',
    'contact.html',
    'login.html',
    'profile.html',
    'dashboard.html',
    'help.html',
    'settings.html',
    '404.html',
    'oauth-success.html',
    'apply-freestyler.html',
    'apply-competitive.html',
    'apply-creator.html',
    'apply-designer.html',
    'apply-editor.html',
    'apply-coach.html',
    'apply-management.html',
    'apply-other.html'
];

// Required assets
const requiredAssets = {
    css: [
        'assets/css/index.css',
        'assets/css/about.css',
        'assets/css/roster.css',
        'assets/css/apply.css',
        'assets/css/dashboard.css',
        'assets/css/dashboard-enhancements.css',
        'assets/css/animation-enhancements.css',
        'assets/css/settings.css',
        'assets/css/help.css'
    ],
    js: [
        'assets/js/config.js',
        'assets/js/main.js',
        'assets/js/auth.js',
        'assets/js/dashboard.js',
        'assets/js/roster.js',
        'assets/js/roster-integration.js',
        'assets/js/roster-enhanced.js',
        'assets/js/settings.js',
        'assets/js/help.js',
        'assets/js/discord-stats.js',
        'assets/js/form-validator.js'
    ]
};

// Test 1: Check HTML files exist
console.log(`${colors.blue}📄 Testing HTML Files...${colors.reset}`);
htmlPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        console.log(`${colors.green}✓${colors.reset} ${page} exists`);
        results.passed.push(`HTML: ${page}`);
        
        // Check file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for basic HTML structure
        if (!content.includes('<!DOCTYPE html>')) {
            results.warnings.push(`${page} missing DOCTYPE`);
            console.log(`${colors.yellow}  ⚠ Missing DOCTYPE${colors.reset}`);
        }
        if (!content.includes('<head>') || !content.includes('</head>')) {
            results.failed.push(`${page} missing <head>`);
            console.log(`${colors.red}  ✗ Missing <head> tag${colors.reset}`);
        }
        if (!content.includes('<body>') || !content.includes('</body>')) {
            results.failed.push(`${page} missing <body>`);
            console.log(`${colors.red}  ✗ Missing <body> tag${colors.reset}`);
        }
    } else {
        console.log(`${colors.red}✗${colors.reset} ${page} NOT FOUND`);
        results.failed.push(`HTML: ${page} not found`);
    }
});

console.log('');

// Test 2: Check CSS files exist
console.log(`${colors.blue}🎨 Testing CSS Files...${colors.reset}`);
requiredAssets.css.forEach(cssFile => {
    const filePath = path.join(__dirname, cssFile);
    if (fs.existsSync(filePath)) {
        console.log(`${colors.green}✓${colors.reset} ${cssFile} exists`);
        results.passed.push(`CSS: ${cssFile}`);
        
        // Check file is not empty
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            results.warnings.push(`${cssFile} is empty`);
            console.log(`${colors.yellow}  ⚠ File is empty${colors.reset}`);
        }
    } else {
        console.log(`${colors.red}✗${colors.reset} ${cssFile} NOT FOUND`);
        results.failed.push(`CSS: ${cssFile} not found`);
    }
});

console.log('');

// Test 3: Check JavaScript files exist
console.log(`${colors.blue}⚡ Testing JavaScript Files...${colors.reset}`);
requiredAssets.js.forEach(jsFile => {
    const filePath = path.join(__dirname, jsFile);
    if (fs.existsSync(filePath)) {
        console.log(`${colors.green}✓${colors.reset} ${jsFile} exists`);
        results.passed.push(`JS: ${jsFile}`);
        
        // Check file is not empty
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            results.warnings.push(`${jsFile} is empty`);
            console.log(`${colors.yellow}  ⚠ File is empty${colors.reset}`);
        }
        
        // Basic syntax check (very simple)
        const content = fs.readFileSync(filePath, 'utf8');
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            results.warnings.push(`${jsFile} may have unmatched braces`);
            console.log(`${colors.yellow}  ⚠ Possible unmatched braces${colors.reset}`);
        }
    } else {
        console.log(`${colors.red}✗${colors.reset} ${jsFile} NOT FOUND`);
        results.failed.push(`JS: ${jsFile} not found`);
    }
});

console.log('');

// Test 4: Check critical directories
console.log(`${colors.blue}📁 Testing Directory Structure...${colors.reset}`);
const requiredDirs = [
    'assets',
    'assets/css',
    'assets/js',
    'assets/img',
    'backend',
    'backend/discord-proxy',
    'backend/application-handler',
    'backend/contact-handler'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        console.log(`${colors.green}✓${colors.reset} ${dir}/ exists`);
        results.passed.push(`DIR: ${dir}`);
    } else {
        console.log(`${colors.red}✗${colors.reset} ${dir}/ NOT FOUND`);
        results.failed.push(`DIR: ${dir} not found`);
    }
});

console.log('');

// Test 5: Check backend package.json files
console.log(`${colors.blue}📦 Testing Backend Configuration...${colors.reset}`);
const backendServices = [
    'backend/discord-proxy',
    'backend/application-handler',
    'backend/contact-handler',
    'backend/oauth-handler'
];

backendServices.forEach(service => {
    const packagePath = path.join(__dirname, service, 'package.json');
    const serverPath = path.join(__dirname, service, 'server.js');
    
    if (fs.existsSync(packagePath)) {
        console.log(`${colors.green}✓${colors.reset} ${service}/package.json exists`);
        results.passed.push(`Backend: ${service}/package.json`);
        
        // Check package.json content
        try {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            if (!pkg.dependencies) {
                results.warnings.push(`${service}/package.json has no dependencies`);
                console.log(`${colors.yellow}  ⚠ No dependencies listed${colors.reset}`);
            }
        } catch (e) {
            results.failed.push(`${service}/package.json invalid JSON`);
            console.log(`${colors.red}  ✗ Invalid JSON${colors.reset}`);
        }
    } else {
        console.log(`${colors.yellow}⚠${colors.reset} ${service}/package.json not found`);
        results.warnings.push(`Backend: ${service}/package.json missing`);
    }
    
    if (fs.existsSync(serverPath)) {
        console.log(`${colors.green}✓${colors.reset} ${service}/server.js exists`);
        results.passed.push(`Backend: ${service}/server.js`);
    } else {
        console.log(`${colors.red}✗${colors.reset} ${service}/server.js NOT FOUND`);
        results.failed.push(`Backend: ${service}/server.js not found`);
    }
});

console.log('');

// Test 6: Check deployment files
console.log(`${colors.blue}🚀 Testing Deployment Files...${colors.reset}`);
const deploymentFiles = [
    'netlify.toml',
    '_redirects',
    'robots.txt',
    'sitemap.xml'
];

deploymentFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`${colors.green}✓${colors.reset} ${file} exists`);
        results.passed.push(`Deploy: ${file}`);
    } else {
        console.log(`${colors.yellow}⚠${colors.reset} ${file} not found (optional)`);
        results.warnings.push(`Deploy: ${file} missing`);
    }
});

console.log('');

// Final Summary
console.log('═'.repeat(60));
console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
console.log('═'.repeat(60));
console.log(`${colors.green}✓ Passed:${colors.reset} ${results.passed.length}`);
console.log(`${colors.red}✗ Failed:${colors.reset} ${results.failed.length}`);
console.log(`${colors.yellow}⚠ Warnings:${colors.reset} ${results.warnings.length}`);
console.log('═'.repeat(60));

if (results.failed.length > 0) {
    console.log(`\n${colors.red}❌ FAILED TESTS:${colors.reset}`);
    results.failed.forEach(fail => console.log(`  - ${fail}`));
}

if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  WARNINGS:${colors.reset}`);
    results.warnings.forEach(warn => console.log(`  - ${warn}`));
}

console.log('');

// Exit code
if (results.failed.length === 0) {
    console.log(`${colors.green}✅ All critical tests passed! Ready for deployment.${colors.reset}\n`);
    process.exit(0);
} else {
    console.log(`${colors.red}❌ Some tests failed. Please fix before deploying.${colors.reset}\n`);
    process.exit(1);
}
