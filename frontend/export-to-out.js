const fs = require('fs');
const path = require('path');

// Copy .next/static to out/_next/static
const sourceStatic = path.join(__dirname, '.next', 'static');
const destStatic = path.join(__dirname, 'out', '_next', 'static');

// Copy .next/server/app to out (for HTML files)
const sourceServer = path.join(__dirname, '.next', 'server', 'app');
const destOut = path.join(__dirname, 'out');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source does not exist: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Create out directory
if (!fs.existsSync('out')) {
  fs.mkdirSync('out', { recursive: true });
}

// Copy static assets
if (fs.existsSync(sourceStatic)) {
  console.log('Copying static assets...');
  copyRecursive(sourceStatic, destStatic);
}

// Copy public folder
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('Copying public folder...');
  copyRecursive(publicDir, path.join(destOut, 'public'));
}

// Copy HTML files from server/app
if (fs.existsSync(sourceServer)) {
  console.log('Copying HTML files...');
  copyRecursive(sourceServer, destOut);
}

// Copy web.config for IIS if it exists in project root
const webConfigPath = path.join(__dirname, 'web.config');
if (fs.existsSync(webConfigPath)) {
  console.log('Copying web.config...');
  fs.copyFileSync(webConfigPath, path.join(destOut, 'web.config'));
} else {
  // Create web.config for IIS if it doesn't exist
  const webConfigContent = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Handle Next.js static files - serve directly -->
        <rule name="Static Files" stopProcessing="true">
          <match url="^(_next|public)/.*" />
          <action type="None" />
        </rule>
        
        <!-- Handle requests for existing files (images, CSS, JS, etc.) -->
        <rule name="Existing Files" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>
        
        <!-- Trailing slash: rewrite /courses/ to /courses.html -->
        <rule name="Trailing Slash to HTML" stopProcessing="true">
          <match url="^(.+)/$" />
          <conditions>
            <add input="{REQUEST_FILENAME}.html" matchType="IsFile" />
          </conditions>
          <action type="Rewrite" url="/{R:1}.html" />
        </rule>
        
        <!-- If directory exists and has corresponding .html file, rewrite to .html -->
        <rule name="Directory to HTML" stopProcessing="true">
          <match url="^(.+)/?$" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" />
            <add input="{REQUEST_FILENAME}.html" matchType="IsFile" />
          </conditions>
          <action type="Rewrite" url="/{R:1}.html" />
        </rule>
        
        <!-- Rewrite routes without trailing slash to .html (e.g., /about -> /about.html) -->
        <rule name="Next.js HTML Routes" stopProcessing="true">
          <match url="^([^/]+)/?$" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}.html" matchType="IsFile" />
          </conditions>
          <action type="Rewrite" url="/{R:1}.html" />
        </rule>
        
        <!-- Rewrite nested routes to .html (e.g., /about/vision -> /about/vision.html) -->
        <rule name="Next.js Nested HTML Routes" stopProcessing="true">
          <match url="^(.+)/?$" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}.html" matchType="IsFile" />
          </conditions>
          <action type="Rewrite" url="/{R:1}.html" />
        </rule>
        
        <!-- Handle requests for existing directories (only if no .html file exists) -->
        <rule name="Existing Directories" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" />
          </conditions>
          <action type="None" />
        </rule>
        
        <!-- Fallback to index.html for client-side routing -->
        <rule name="Next.js Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Set default document -->
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
    
    <!-- Enable static content compression -->
    <httpCompression>
      <staticTypes>
        <add mimeType="text/html" enabled="true" />
        <add mimeType="text/css" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="application/json" enabled="true" />
      </staticTypes>
    </httpCompression>
    
    <!-- Disable directory browsing -->
    <directoryBrowse enabled="false" />
  </system.webServer>
</configuration>`;
  fs.writeFileSync(path.join(destOut, 'web.config'), webConfigContent);
  console.log('Created web.config for IIS...');
}

console.log('Export completed! Files are in the "out" directory.');
