# Update Universal Header Script
# This script updates all HTML files with the universal header structure

$headerActionsInsert = @'
                <div class="header-actions">
                    <a href="settings.html" class="icon-button settings-icon" title="Settings">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m5.657-15.657l-1.414 1.414M9.172 14.828l-1.414 1.414m12.728 0l-1.414-1.414M9.172 9.172L7.758 7.758M23 12h-6m-6 0H1"></path>
                        </svg>
                    </a>
                    <a href="help.html" class="icon-button help-icon" title="Help Center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01"></path>
                        </svg>
                    </a>
                    <div class="user-profile" id="userProfile">
                        <!-- Populated by auth.js -->
                    </div>
                </div>
'@

# List of files to update (excluding index.html and about.html as they're already done)
$files = @(
    "roster.html",
    "apply.html",
    "partners.html",
    "store.html",
    "contact.html",
    "settings.html",
    "help.html",
    "dashboard.html",
    "profile.html",
    "login.html",
    "apply-coach.html",
    "apply-competitive.html",
    "apply-creator.html",
    "apply-designer.html",
    "apply-editor.html",
    "apply-freestyler.html",
    "apply-management.html",
    "apply-other.html"
)

$updated = 0
$errors = 0

foreach ($file in $files) {
    $filePath = "e:\Zorn Website 2.0\$file"
    
    if (Test-Path $filePath) {
        try {
            $content = Get-Content $filePath -Raw
            
            # Pattern to match the old user-profile div structure
            $pattern = '(?s)(\s*<div class="user-profile" id="userProfile">.*?</div>)\s*(<div class="hamburger">)'
            
            if ($content -match $pattern) {
                # Replace with new header-actions structure
                $newContent = $content -replace $pattern, "$headerActionsInsert`r`n                $2"
                
                Set-Content -Path $filePath -Value $newContent -NoNewline
                Write-Host "✓ Updated: $file" -ForegroundColor Green
                $updated++
            } else {
                Write-Host "⚠ Pattern not found in: $file" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "✗ Error updating $file : $_" -ForegroundColor Red
            $errors++
        }
    } else {
        Write-Host "⚠ File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Updated: $updated files" -ForegroundColor Green
Write-Host "  Errors: $errors files" -ForegroundColor $(if($errors -gt 0){"Red"}else{"Green"})
Write-Host "========================================" -ForegroundColor Cyan
