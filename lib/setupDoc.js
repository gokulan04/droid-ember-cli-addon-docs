#!/usr/bin/env node
/**
 * Automates ember-cli-addon-docs setup for the dummy app of an Ember addon.
 * Performs:
 * 1. Router setup
 * 2. Application.hbs setup
 * 3. Docs index.md creation (copies README.md)
 * 4. Docs layout (docs.hbs) creation
 */

import fs from 'fs';
import path from 'path';

const testApp = "test-app/app";

// ---------- Helper Utilities ----------
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

// ---------- Step 1: Update Router ----------
function updateRouter(addonRoot) {
  const routerPath = path.join(addonRoot, testApp, '/router.js');
  if (!fs.existsSync(routerPath)) {
    console.warn('⚠️  router.js not found, skipping router setup.');
    return;
  }

let routerContent = `import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() { 
   });
  this.route('not-found', { path: '/\*path' });
});

export default Router;`;

  fs.writeFileSync(routerPath, routerContent, 'utf8');
  console.log('✅ Updated router.js');
}

// ---------- Step 2: Update Application Template ----------
function updateApplicationTemplate(addonRoot, addonName, repoUrl) {
  const appTemplatePath = path.join(addonRoot, testApp, '/templates/application.hbs');
  ensureDir(path.dirname(appTemplatePath));

  const content = `
{{page-title "${addonName}"}}
<DocsHeader @prefix="Droid" @name="${addonName}" @githubUrl="${repoUrl}" />
{{outlet}}
  `.trim();

  fs.writeFileSync(appTemplatePath, content, 'utf8');
  console.log('✅ Updated application.hbs');
}

// ---------- Step 3: Create Docs Index (README copy) ----------
function createDocsIndex(addonRoot) {
  const readmePath = path.join(addonRoot, 'README.md');
  const docsDir = path.join(addonRoot, testApp, '/templates/docs');
  const docsFile = path.join(docsDir, 'index.md');

  ensureDir(docsDir);

  if (!fs.existsSync(readmePath)) {
    console.warn('⚠️ README.md not found, creating a placeholder index.md.');
    fs.writeFileSync(docsFile, '# Documentation\n\nAddon documentation goes here.', 'utf8');
    return;
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  fs.writeFileSync(docsFile, readmeContent, 'utf8');

  console.log('✅ Created docs/index.md from README.md');
}

// ---------- Step 4: Create Docs Layout ----------
function createIndexLayout(addonRoot) {
  const indexLayoutPath = path.join(addonRoot, testApp, '/templates/index.hbs');
  ensureDir(path.dirname(indexLayoutPath));

  const layout = `<DocsHero/>

<div style="max-width: 40rem; margin: 0 auto; padding: 0 1.5rem">
  <DocsDemo as |demo|>
    <demo.example @name="my-demo.hbs">
      <p>Make sure to read up on the DocsDemo component before building out this page.</p>
    </demo.example>
  </DocsDemo>
</div>
  `.trim();

  fs.writeFileSync(indexLayoutPath, layout, 'utf8');
  console.log('✅ Created index.hbs');
}

// ---------- Step 4: Create Docs Layout ----------
function createDocsLayout(addonRoot) {
  const docsLayoutPath = path.join(addonRoot, testApp, '/templates/docs.hbs');
  ensureDir(path.dirname(docsLayoutPath));

  const layout = `
<DocsViewer as |viewer|>
  <viewer.nav as |nav|>
    <nav.section @label="Introduction" />
    <nav.item @label="Overview" @route="docs.index" /> 
  </viewer.nav>

  <viewer.main>
    {{outlet}}
  </viewer.main>
</DocsViewer>
  `.trim();

  fs.writeFileSync(docsLayoutPath, layout, 'utf8');
  console.log('✅ Created docs.hbs');
}

function getParentPackageInfo(parentRoot) {
  const pkgPath = path.join(parentRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.warn('⚠️ Could not find parent package.json');
    return {};
  }
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

// ---------- Run All Steps ----------
function setupDoc() {
  const addonRoot = path.resolve(process.env.INIT_CWD, "..", 'addon'); // workaround done for v2 structure
  console.log("ADDON ROOT ------> ", addonRoot);
  const packageInfo = getParentPackageInfo(addonRoot);
  const addonName = packageInfo.name;
  const repoUrl = packageInfo.repository;

  console.log(`🚀 Setting up ember-cli-addon-docs for ${addonName}...\n`);

  updateRouter(addonRoot);
  updateApplicationTemplate(addonRoot, addonName, repoUrl);
  createDocsIndex(addonRoot);
  createIndexLayout(addonRoot);
  createDocsLayout(addonRoot);

  console.log('\n🎉 ember-cli-addon-docs setup completed successfully!');
}

setupDoc();
